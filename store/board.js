import { getField, updateField } from 'vuex-map-fields';
const configs = require("~/assets/files/blocks.json")
const random_id = () => `${new Date().getUTCMilliseconds().toString()}${Math.round((Math.random() * 36 ** 12)).toString(36)}`
const dayjs = require('dayjs')
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
dayjs.extend(isSameOrAfter)
var isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
dayjs.extend(isSameOrBefore)

const empty_state = () => ({
	name: null,
	workspace_id: null,
	hide_filters: true,
	hide_search: true,
	search: '',
	filters: [],
	title: null,
	hero: "",
	logo: "",
	hero_image: "",
	page: 'view',
	palette: "",
	hero_background: "#161819",
	sign_in_method: "",

	active_section_text_color: "",
	inactive_section_text_color: "",
	active_section_background_color: "",

	board_background: "#FAFAFA",
	block_border: "#f5f5f5f9",
	block_shadow: "#d9d9d995",
	public: false,
	spreadsheetId: null,
	sheets_data: {},
	sheets: [],
	users: [],
	blocks: [],
	tempo_block: null,
	sections: '',
	current_section: null,
	owner_email: null,
	can_edit: false,
	user_role: null
})

export const state = () => {
	return empty_state()
}

export const actions = {

	async update_data({ commit, state }, info) {
		const { sheet_titles, skip_cache } = info
		const titles = sheet_titles.filter((title, index) => sheet_titles.indexOf(title) == index);
		// board added to support safari
		const params = skip_cache ? { "_vercel_no_cache": 1, 'referer':  window.location.href, "board": window.location.pathname.replace("/", "") } : { "board": window.location.pathname.replace("/", ""), 'referer': window.location.href } // Skip Cache on Vercel

		for (const title of titles.filter(t => typeof t === 'string')) {
			//https://chartmat-gsheet-env.eba-bqbpxmuf.us-east-1.elasticbeanstalk.com

			const BEANSTALK_ENDPOINT = await this.$axios.$get('/api/getENV/BEANSTALK_ENDPOINT');

			const url = `${BEANSTALK_ENDPOINT}/api/board/${state.spreadsheetId}/sheet/${title}`
			const r = await this.$axios.$get(url, { params }).catch(e => ({ error: e?.response?.data?.message ?? e?.message ?? "Data Error" }))
			commit("UPDATE_SHEETS_DATA", { [title]: r })
		}
	},

	async update_metadata({ commit }) {
		const metadata = await this.$axios.$post(`/api/board/update-metadata`, {})
		commit("UPDATE", metadata)
	}
}

export const mutations = {
	updateField,

	RESET_STATE(state) {
		Object.assign(state, empty_state())
	},
	UPDATE_SHEETS_DATA(state, new_data) {
		state.sheets_data = { ...state.sheets_data, ...new_data }
	},
	UPDATE(state, new_data) {
		Object.entries(new_data).forEach(entry => {
			if (state.hasOwnProperty(entry[0])) {
				state[entry[0]] = entry[1]
			}
		})
	},
	SET_TEMPO_BLOCK(state, block) {

		if (!block) {
			state.tempo_block = null
		}
		else {
			if (block.type == "score_card") {
				block.type = 'scorecard'
			}

			const block_type = block.type
			const config = configs[block_type]
			const default_data = Object.fromEntries(Object.entries(config.block).map(entry => [entry[0], entry[1].default_value]))
			const new_block = { ...default_data, sheet_title: null, axis: [], actions: [], type: block_type, section: state.current_section, id: random_id(), temp_block:true }
			state.tempo_block = block.id ? block : new_block
		}
	},

	MERGE_TEMPO_BLOCK(state, new_data) {
		state.tempo_block = { ...state.tempo_block, ...new_data }
	}
}

export const getters = {
	getField,

	spreadsheet_url(state) {
		return `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}`
	},
	sections_array(state) {
		const sections = state.sections ?? ''
		return sections.split(",").map(s => s.trim()).filter(s => s)
	},
	section_blocks(state) {
		if (state.current_section === 'un-categorized') {
			return state.blocks.filter(block => !state.sections.includes(block.section))
		} else {
			return state.blocks.filter(block => block.section === state.current_section)
		}
	},
	sheets(state, getters) {
		return [...new Set(state.blocks.map(block => block.sheet_title))]
	},
	section_sheets(state, getters) {
		return [...new Set(getters.section_blocks.map(block => block.sheet_title))]
	},
	filtered_data(state, getters, rootState) {
		// return state.sheets_data

		let query_filters = {}
		try {
			const urlQuery = new URLSearchParams(window.location.search);
			const filterQuery = urlQuery.get('filters');
			if (filterQuery) {
				query_filters = Object.fromEntries(filterQuery.split(",").map(f => f.split(":")))
			}
		} catch (e) { }
		
		const current_user = rootState?.auth?.user?.email
		let sheets_data = JSON.parse(JSON.stringify(state.sheets_data)) ?? {}
		const searches = state.search.toLowerCase().split(",")
		if (searches.length) {
			sheets_data = Object.fromEntries(Object.entries(sheets_data).map(e => {
				if (e[1].json) {
					e[1].json = e[1].json.filter(i => searches.some(term => JSON.stringify(Object.values(i)).toLowerCase().includes(term.trim())))
				}
				return [e[0], e[1]]
			}))
		}
		const make_number = (n, decimal = ".") => {
			let y = 0
			if (n === undefined) {
				y = 0
			}
			else if (decimal === ",") {
				y = n.toString().replace(/[^-,\d]/g, '').replace(/,+/g, ".")
			}
			else {
				y = n.toString().replace(/[^-0-9.]+/g, "")
			}
			return parseFloat(y)
		}
		const active_filters = state.filters.filter(f => f.active || query_filters.hasOwnProperty(f.name))
		const userId = sessionStorage.getItem("_id")
		// filter on email
		if (userId) {
			for (const s of state.sheets) {
				if (state.sheets_data[s.title]?.columns?.includes("_id")) {
					active_filters.push({ active: true, condition: "=", sheet_column: { column: "_id", sheet: s.title }, value: userId })
				}
			}
		}
		const filters = JSON.parse(JSON.stringify(active_filters))

		for (const filter of filters) {
			const { sheet, column } = filter?.sheet_column ?? {}
			const { condition, display } = filter
			if (query_filters.hasOwnProperty(filter.name)) {
				filter.value = query_filters[filter.name]
			}
			let value = filter.value == "[(current_user)]" && current_user ? current_user : filter.value
			const data = sheets_data[sheet]?.json ?? null
			if (data) {
				sheets_data[sheet].json = data.filter(row => {

					const cell = (row[column] ?? "").toString()
					switch (condition) {
						case '=': return cell == value
						case '>': return make_number(cell) > make_number(value)
						case '<': return parseFloat(cell) < make_number(value)
						case 'starts_with': return cell.startsWith(value)
						case 'not_starts_with': return !cell.startsWith(value)
						case 'ends_with': return cell.endsWith(value)
						case 'not_ends_with': return !cell.endsWith(value)
						case 'includes': return cell.includes(value)
						case 'not_includes': return !cell.includes(value)
						case 'past_days': {
							const day = Date.parse(cell)
							const today = + new Date()
							const comp = today - (86400000 * parseFloat(value))
							return day < today && day > comp
						}
						case 'today': {
							const today = dayjs().startOf('date')
							return today.isSame(dayjs(cell))
						}
						case 'tomorrow': {
							const tomorrow = dayjs().startOf('date').add(1, 'day')
							return tomorrow.isSame(dayjs(cell))
						}
						case 'current_week': {
							const [start, end] = [dayjs().startOf('week'), dayjs().endOf('week')]
							const currentDate = dayjs(cell)
							return start.isSameOrBefore(currentDate) && end.isSameOrAfter(currentDate)
						}
						case 'next_week': {
							const [start, end] = [dayjs().startOf('week').add(7, 'day'),
							dayjs().endOf('week').add(7, 'day')]
							const currentDate = dayjs(cell)

							return start.isSameOrBefore(currentDate) && end.isSameOrAfter(currentDate)
						}
						case 'date': {
							const [start, end] = value
							const day = Date.parse(cell)
							return day >= start && day <= end
						}
						case 'any_of': {
							return value.split("[(OR)]").map(x => x.trim()).includes(cell)
						}
					}
				})
			}
		}

		return sheets_data
	}


}
const axios = require("axios")
const db = require("./db.js")
const jwt = require("jsonwebtoken")

const utils = module.exports = {

	short_login_url(email, base_url) {
		const token = jwt.sign({ data: { email } }, process.env.CHARTMAT_SECRET_KEY, { expiresIn: '1h' })
		return [`${base_url}?token=${token}`, token]
	},

	async save_token(workspace_id, token_obj) {
		const now = db.timestamp_sc()
		const nested = {
			'token.expires_at': (now + token_obj.expires_in),
			'token.access_token': token_obj.access_token,
			'token.refresh_token': token_obj.refresh_token,
			'token.last_edited': now,
			'token.refresh_token_last_edited': now,
			'token.email': token_obj.email,
			'token.scope': token_obj.scope.split(" "),
		}
		// Delete all undefined otherwise refresh becomes undefined when saving the new access_token
		Object.keys(nested).forEach((k) => !nested[k] && delete nested[k]);
		await db.update_one("workspaces", workspace_id, nested)
	},

	async get_token(token, workspace_id) {
		// Some fancy caching might be very beneficial here...
		let access_token = token?.access_token
		if (!token || !token?.refresh_token) {
			throw new Error(`400::Google Sheets doesn't seems to be connected well. Please re-connect it.`)
		}
		const now = db.timestamp_sc()
		const token_is_valid = token.expires_at > (now - 30) // Must be active for at least 30 seconds

		if (!token_is_valid) {
			const postData = { "refresh_token": token.refresh_token, "client_id": process.env.CHARTMAT_GOOGLE_CLIENT_ID, "client_secret": process.env.CHARTMAT_GOOGLE_CLIENT_SECRET, "grant_type": 'refresh_token' }
			const { data } = await axios.post("https://oauth2.googleapis.com/token", postData).catch(e => utils.google_api_error_logger(e))
			await utils.save_token(workspace_id, data)
			access_token = data.access_token
		}

		if (!access_token || !access_token.length > 5) {
			throw new Error("400::The access token wasn't returned or is not formatted well. Please try again later.")
		}

		return access_token
	},

	google_api_error_logger(e, throw_error = true) {
		let error = e?.response?.data?.error?.message || e?.response?.data ? `${e?.response?.data?.error?.message ?? e?.response?.data?.error} : ${e?.response?.data?.error_description}` : false || e?.response?.data || e?.message || "Unknown Google API error"
		error = `The Google API returned an error. Please try again, if that doesn't work refresh your API connection in you account settings. [${error}]`
		if (!throw_error) {
			return error
		} else {
			throw new Error(`401::${error}`)
		}
	},

	async get_metadata(token, board) {
		const spreadsheetId = board.spreadsheetId
		const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`
		const { data } = await axios.get(url, { params: { access_token: token } }).catch(e => utils.google_api_error_logger(e))
		const existing_sheets = board.sheets ?? []
		const metadata = {
			title: data.properties.title,
			locale: data.properties.locale,
			timezone: data.properties.timeZone,
			sheets: data.sheets.map(sheet => ({ ...existing_sheets.find(s => s.title === sheet.properties.title), id: sheet.properties.sheetId, title: sheet.properties.title })) // So range doesn't change
		}
		return metadata
	},

	async set_workspace_or_null(req) {
		try {
			await utils.set_workspace(req)
		} catch (e) {
			return null
		}
	},

	async set_workspace(req) {
		console.log(req.headers.referer)
		const { host, pathname } = new URL(req.headers.referer)
		if (host === process.env.CHARTMAT_BOARD_BASE_URL) {
			return;
		}
		const [subdomain, domain] = host.split(".")

		const board_path = req.query['board'] || pathname.split("/")[1] || 'index'
		const isCustomDomain = !host.endsWith(`.${process.env.CHARTMAT_BOARD_BASE_URL}`)
		const workspace_find_filter = isCustomDomain ? ["domain", "==", host] : ['subdomain', '==', subdomain]
		const workspace = await db.get_one("workspaces", workspace_find_filter)
		if (!workspace) {
			throw new Error(`400::We could not find the workspace: ${host}`)
		}
		
		const boards = await db.get_many(`workspaces/${workspace.id}/boards`)
		workspace.boards = boards
		req.workspace = workspace
		req.workspace_id = workspace.id
		
		if (board_path !== "admin") {
			const board = workspace.boards.find(board => board.path === board_path)
			if (!board) {
				throw new Error(`400::${board_path} is not a registered path in the workspace ${host}`)
			}
			req.board = board
			req.board_id = board?.id
		}
	},

	async decode_token(req, token) {
		if (!token) {
			throw new Error("400::Please login to do this!")
		}
		if (token.startsWith("Bearer ")) { token = token.substr(7) }
		// Select correct secret key - If it's a workspace route we use the workspace key
		let key = req?.workspace?.sso_key ?? process.env.CHARTMAT_SECRET_KEY

		const user = jwt.verify(token, key, (error, result) => {
			if (error) {
				throw new Error(`401::${error.name}: ${error.message}`)
			}
			return result.data
		})
		return [user, key]
	},

	async set_user(req) {
		const [user, secret] = await utils.decode_token(req, req.headers.authorization)
		req.user = user
	},

	async set_user_or_null(req) {
		try {
			return await utils.set_user(req)
		} catch (e) {
			return null
		}
	},

	async get_or_create_user(given_email) {
		const email = utils.validate_email(given_email)
		const existing = await db.get_one("users", ['email', '==', email])
		if (existing?.id) {
			return [existing, false]
		} else {
			const new_user = { email: email, created_at: db.timestamp_sc() }
			const new_user_id = await db.add_one("users", new_user)
			await utils.sendTelegram(`${email} just signed up`)
			return [{ ...new_user, id: new_user_id }, true]
		}
	},
	validate_email(given_email) {
		const email = given_email || ""
		const lower_email = email.trim().toLowerCase()
		if (!/^\S+@\S+\.\S+$/.test(lower_email)) {
			throw new Error("400::The given email address is not valid")
		}
		return lower_email
	},

	pick(obj, keys) {
		return Object.assign({}, ...keys.map(key => ({ [key]: obj[key] })))
	},

	async sendEmail(to_email, template_alias, template_config, plain_html,cc) {
		const headers = { "X-Postmark-Server-Token": process.env.CHARTMAT_POSTMARK_API_KEY }
		let postMarkEndpoint = "https://api.postmarkapp.com/email"

		const data = {
			From: "support@chartmat.com",
			To: utils.validate_email(to_email),
		}

		if(cc){
			data["Cc"] = cc
		}

		if (template_alias) { // it uses a template
			postMarkEndpoint += "/withTemplate"
			data.TemplateAlias = template_alias,
				data.TemplateModel = template_config
		}

		else {
			// It's a plain HTML email
			data.HtmlBody = plain_html
			data.Subject = "Chartmat contact form email"
		}

		try {
			await axios.post(postMarkEndpoint, data, { headers: headers })
			return true
		}
		catch (e) {
			console.log(e.response)
			// Retry with another provider
			throw new Error(e.message)
		}
	},

	async sendEmailPostMark(from_email, name, to_email, subject, plain_html, text_body, postmark_api_key) {
		const headers = { "X-Postmark-Server-Token": postmark_api_key }
		let postMarkEndpoint = "https://api.postmarkapp.com/email"

		const data = {
			From: `${from_email} "${name}"`,
			To: utils.validate_email(to_email)
		}

		data.HtmlBody = plain_html
		data.TextBody = text_body
		data.Subject = subject

		try {
			await axios.post(postMarkEndpoint, data, { headers: headers })
			return true
		}
		catch (e) {
			console.log(e.response)
			// Retry with another provider
			throw new Error(e.message)
		}
	},

	async sendTelegram(msg) {
		try {
			const telegramUrl = `https://api.telegram.org/bot${process.env.CHARTMAT_TELEGRAM_TOKEN}/sendMessage`
			return await axios.post(telegramUrl, {
				chat_id: process.env.CHARTMAT_TELEGRAM_USER_ID,
				text: msg,
				parse_mode: "HTML",
				disable_web_page_preview: true
			}).then(r => r.ok).catch(e => { console.log(`Telegram Error: ${e.message}`); return false })
		}
		catch (e) {
			console.log(e.response)
			console.log(`Telegram Error: ${e.message}`)
			return false
		}
	}
}
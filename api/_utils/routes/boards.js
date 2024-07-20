const db = require("../db.js")
const { get_token, google_api_error_logger, validate_email, get_metadata, sendEmail, set_workspace, set_user, set_user_or_null, sendEmailPostMark } = require("../commons.js")
const axios = require("axios")
const jwt = require("jsonwebtoken")
const { CHARTMAT_PLANS } = require('../const');
const otp_generator = require('otp-generator');
const hb = require('handlebars')
const fs = require('fs')
const bcrypt = require("bcryptjs");
const color = require('color')
const pin_template = hb.compile(fs.readFileSync(`${__dirname}/pin.html`, 'utf-8'))
const otp_template = hb.compile(fs.readFileSync(`${__dirname}/otp.html`, 'utf-8'))
// PRE-HANDLERS

const can_edit = async (req) => {
	const user_email = req?.user?.email
	if(!req.workspace){
		return
	}
	const user = user_email ? req.workspace.users.find(u => u.email === user_email) : null
	req.workspace.user_role = user?.role ?? null
	req.workspace.can_edit = user && user.role === "admin"
}

const private_endpoint = async (req) => {
	// Allowed only for admins
	if (!req.workspace.can_edit) {
		throw new Error("400::You don't have enough rights to do this")
	}
}

const users_only = async (req) => {
	const user_email = req?.user?.email
	const is_user = user_email ? req.workspace.users.findIndex(u => u.email === user_email) > -1 : null
	if (!is_user) {
		throw new Error("400::You are not a user of this workspace")
	}
}

const public_endpoint = async (req) => {
	// Allowed only for admins, guests or anyone if the board is public
	const user_emails = req.workspace.users.map(u => u.email)
	const user_email = req?.user?.email
	// console.log(req.user.email)
	const is_workspace_user = user_email && user_emails.includes(user_email) // Both admin & guests can access 
	if (!req?.board?.public && !is_workspace_user) {
		throw new Error("400::This board is not public and you don't have access to it")
	}
}

const update_board = async (workspace_id, board_id, boards, new_data) => {
	await db.update_one(`workspaces/${workspace_id}/boards`, board_id, new_data)
}

const board_routes = module.exports = [

	// board publishing routes
	{
		url: "/api/marketplace/templates",
		method: ["GET", "PUT", "DELETE"],
		handler: async (req, reply) => {
			let catalogue = []
			const category = req.query["category"]
			if (category && category != "All templates") {
				catalogue = await db.get_many("marketplace_catalog", ["category", "==", category])
			} else {
				catalogue = await db.get_many("marketplace_catalog")
			}
			for (let c of catalogue) {
				const workspace = await db.get_id("workspaces", c.workspace_id)
				c.workspace = workspace
			}
			return catalogue
		}
	},

	//  purchase publisher template 
	{
		url: "/api/purchased/templates",
		method: ["GET"],
		preHandler: [set_workspace, set_user_or_null],
		handler: async (req, res) => {
			try {
				let purchased = []
				let orders = await db.get_many("marketplace_orders", ["client_reference_id", "==", req.workspace.created_by]) || []
				for (let order of orders) {
					if (order.status == 'complete') {
						const board = await db.get_id("marketplace_boards", order.catalog_id)
						// for us catalog_id is the board_id
						purchased.push({ ...board, id: order.catalog_id })
					}
				}
				console.log(purchased)
				return purchased
			} catch (e) {
				console.log(`boards.js - api/purchased/template -${e}`)
				res.statusCode = 400
				return res.send("Could not get purchased templates.")
			}
		}
	},

	{
		url: "/api/email-test",
		method: ["POST", "GET"],
		handler: async (req, reply) => {
			await sendEmail("m.champaneri.20@gmail.com", null, null, "hello","manish@tracious.com")
			return
		}

	},
	{
		url: "/api/marketplace/review-request/board",
		method: ["GET", "PUT", "DELETE"],
		preHandler: [set_workspace, set_user],
		handler: async (req, reply) => {
			const { workspace, user, workspace_id, method, board_id, board } = req

			if (method === "GET") {
				if (board?.review_request_id) {
					console.log(board)
					let reviewRequest = await db.get_id("marketplace_review_requests", board.review_request_id)
					reviewRequest['request_id'] = board.review_request_id
					return { reviewRequest }
				} else {
					return
				}
			} else if (method === "PUT") {
				const { form } = req.body
				const catalogue_background = color(board.hero_background || "#161819").lighten(0.6).hexa()
				const review_doc = {
					// review_id: board.review_request_id,
					timestamp: Date.now(),
					user_id: user.id,
					workspace_id: workspace_id,
					board_id: board_id,
					status: "pending",
					spreadsheet_id: board.spreadsheetId,
					// catalogue_background: catalogue_background,
					token: workspace.token,
					...form
				}

				let request_id = form.request_id
				if (request_id) {
					await db.create_or_replace("marketplace_review_requests", request_id, review_doc)
				} else {
					request_id = await db.add_one("marketplace_review_requests", review_doc)
				}
				await db.update_one(`/workspaces/${workspace_id}/boards`, board_id,
					{
						review_request_id: request_id,
					});

				review_doc['review_request_id'] = request_id;
				const fields = Object.entries(review_doc).map(o => `${o[0]}: ${o[1]}`)
				const templateReviewHTML = `
					Template to review,
					${fields.join('<br/>')}
				`
				await sendEmail("chartmat.com@gmail.com", null, null, templateReviewHTML,"deepak@chartmat.com")
				return { request_id }
			}
		}
	},

	{
		url: "/api/workspaces",
		method: ["POST", "GET"],
		preHandler: [set_user],
		handler: async (req, reply) => {
			if (req.method === "POST") {
				const workspace = req.body
				// Check if user can add workspace as per plan
				const user = await db.get_one("users", ['email', '==', req.user.email])
				const workspaces = await db.get_many("workspaces", ["created_by", "==", user.id])

				if (CHARTMAT_PLANS[user.plan] && (CHARTMAT_PLANS[user.plan].allowed_workspaces <= workspaces.length)) {
					// chartmat plans
					throw new Error(`400:: Your plan allows maximum ${CHARTMAT_PLANS[user.plan].allowed_workspaces} workspaces.Please upgrade for more workspaces. `)
				} else if (user.plan_limits?.allowed_workspaces <= workspaces.length) {
					// campaign plans
					throw new Error(`400::Your plan allows maximum ${user.plan_limits.allowed_workspaces} workspaces.Please upgrade for more workspaces. `)
				}

				const subdomain = workspace.subdomain.toLowerCase()
				const existing = await db.get_one("workspaces", ['subdomain', '==', subdomain])
				if (existing) {
					throw new Error("400::A workspace with this subdomain already exists")
				}
				// The owner of the board must always be an admin
				workspace.users = [{ email: req.user.email, role: "admin" }]
				workspace.subdomain = subdomain
				workspace.created_at = db.timestamp_sc()
				workspace.created_by = req.user.id
				workspace.sso_key = +new Date() + [...Array(40)].map(_ => (Math.random() * 36 | 0).toString(36)).join('')
				const new_id = await db.add_one("workspaces", workspace)
				const login_token = jwt.sign({ data: req.user }, workspace.sso_key, { expiresIn: '8h' })
				return { new_id, login_token }
			}

			else if (req.method === "GET") {
				const email = validate_email(req.user.email)
				const workspaces = await db.get_many("workspaces", ["users", "array-contains-any", [{ email: email, role: "admin" }, { email: email, role: "guest" }]]) || []
				let ws = []
				for (let w of workspaces) {
					const boards = await db.get_many(`workspaces/${w.id}/boards`)
					w = {
						id: w.id,
						created_at: w.created_at,
						name: w.name,
						users: w.users,
						created_by: w.created_by,
						token_email: w?.token?.email || false,
						boards: boards,
						subdomain: w.subdomain,
						login_token: jwt.sign({ data: req.user }, w.sso_key, { expiresIn: '8h' })
					}
					ws.push(w)
				}
				return ws.sort((a, b) => a.created_at - b.created_at)
			}
		}
	},

	{
		url: "/api/board/workspace",
		method: ["GET", "PUT", "DELETE"],
		preHandler: [set_workspace, set_user, can_edit],
		handler: async (req, reply) => {
			const { workspace, user, workspace_id, method } = req


			if (method === "GET") {
				// get user plan info
				const dbUser = await db.get_id('users', workspace.created_by)
				// Checking stripe status existance as it does not apply to appsumo & paddel subscription.
				if (dbUser.stripe_status && !['trialing', 'active'].includes(dbUser.stripe_status)) {
					dbUser.stripe_status === 'canceled' ? workspace.expired = true : '';
				}
				if (!dbUser.plan) {
					workspace.expired = true
				}

				const planLimits = CHARTMAT_PLANS[dbUser.plan] || dbUser.plan_limits || {
					allowed_workspaces: 0,
					allowed_user_per_workspace: 0,
				};

				await users_only(req)
				workspace.token_email = (workspace?.token?.refresh_token && workspace?.token?.email) ? workspace.token.email : false
				workspace.boards = (await db.get_many(`workspaces/${workspace_id}/boards`)).map(b => ({ name: b.name, title: b.title, id: b.id, spreadsheetId: b.spreadsheetId, public: b.public, path: b.path })) || []
				workspace.can_edit = req.workspace.can_edit
				workspace.plan_limits = planLimits || {
					allowed_workspaces: 0,
					allowed_user_per_workspace: 0,
				}
				workspace.lifetime_campaign = dbUser.lifetime_campaign;
				workspace.token_scope = workspace?.token?.scope;
				delete workspace.token
				delete workspace.sso_key
				// process api key before sending to front end 
				if (workspace.email_service?.postmark_key) {
					workspace.email_service.postmark_key = `${workspace.email_service.postmark_key.substr(0, 4)}****${workspace.email_service.postmark_key.substr(workspace.email_service.postmark_key.length - 4, workspace.email_service.postmark_key.length)}`;
				}
				return workspace
			}

			await private_endpoint(req)

			if (req.method === "PUT") {
				let keysWhichCanBeEdited = ['name', 'users', 'subdomain', 'favicon']
				if (req.body['edit_email_provider']) {
					keysWhichCanBeEdited.push('email_service')
				}
				const updated_data = {}
				const sub = req?.body?.subdomain || ""
				const existing = await db.get_one("workspaces", ['subdomain', '==', sub])
				if (sub.length < 3) {
					throw new Error("400::This subdomain is too short")
				}
				if (existing && (existing.id !== workspace_id)) {
					throw new Error("400::A workspace with this subdomain already exists")
				}

				for (const k of keysWhichCanBeEdited) {
					if (req.body[k]) {
						updated_data[k] = req.body[k]
					}
				}
				if (req.body.users) {

					const owner = await db.get_id('users', workspace.created_by)
					const planLimits = owner.plan_limits || CHARTMAT_PLANS[owner.plan] || {
						allowed_workspaces: 0,
						allowed_user_per_workspace: 0,
					};
					if (planLimits.allowed_user_per_workspace < req.body.users.length) {
						throw new Error(`400::Your plan allows maximum ${planLimits.allowed_user_per_workspace} user(s) per workspaces. Please upgrade for more users. `)
					}
					const owner_email = owner.email;
					const users_duplicates = [...req.body.users, { email: owner_email, role: "admin" }]
					updated_data.users = [...new Map(users_duplicates.map(v => [v.email, v])).values()]
				}
				if (Object.keys(updated_data).length) {
					await db.update_one("workspaces", workspace_id, updated_data)
				}
			}
			else if (req.method === "DELETE") {
				await db.delete_one("workspaces", workspace_id)
			}
			return "Done"
		}
	},

	{
		url: "/api/board/workspace-info",
		method: ["GET"],
		preHandler: [set_workspace, set_user, can_edit, private_endpoint],
		handler: async (req, reply) => {
			const { workspace, workspace_id } = req
			return {
				token: await get_token(workspace.token, workspace_id),
				token_email: workspace?.token?.email,
				boards_length: workspace.boards.length,
				// workspaces_length: user_workspaces.length,
				workspace_users: workspace.users.length,
				// total_users:[...new Set(users)].length,
				subdomain: workspace.subdomain
			}
		}
	},

	{
		url: "/api/board",
		method: ["POST", "PUT", "DELETE"],
		preHandler: [set_workspace, set_user, can_edit, private_endpoint],
		handler: async (req, reply) => {
			const { workspace, workspace_id, board, board_id, method } = req
			if (method === "POST") {
				const user_id = req.user.id

				let { template_id, spreadsheetId, path, is_template, marketplace } = req.body
				let cloned_workspace_id;
				if (marketplace) {
					const marketplaceBoard = await db.get_id("marketplace_boards", template_id)
					const marketplaceCatalog = await db.get_id("marketplace_catalog", template_id)

					cloned_workspace_id = marketplaceCatalog.workspace_id;
					template_id = marketplaceBoard.id;
					const user_token = await get_token(workspace.token, workspace_id)
					const cloned_board = { ...marketplaceBoard }
					const template_token = await get_token(marketplaceCatalog.token, cloned_workspace_id)
					const url = `https://sheets.googleapis.com/v4/spreadsheets`
					// google_api_error_logger(e, true)
					const template_spreadsheet = await axios.get(`${url}/${cloned_board.spreadsheetId}`, { params: { access_token: template_token } })
						.catch(e => console.log(e.response.data)).then(r => r.data)
					const payload = {
						properties: { ...template_spreadsheet.properties, title: `Chartmat ${template_spreadsheet.properties.title}` },
						sheets: template_spreadsheet.sheets
					}
					const new_spreadsheet = await axios.post(url, payload, { params: { access_token: user_token } })
						.catch(e => google_api_error_logger(e, true))
						.then(r => r.data)
					const new_spreadsheet_id = new_spreadsheet.spreadsheetId

					const ranges = template_spreadsheet.sheets.map(sheet => `ranges='${sheet.properties.title}'`).join("&")
					const value_url = `https://sheets.googleapis.com/v4/spreadsheets/${cloned_board.spreadsheetId}/values:batchGet?${ranges}`

					const values = await axios.get(value_url, { params: { access_token: template_token, valueRenderOption: "FORMULA" } }).then(r => r.data).catch(e => google_api_error_logger(e, true))
					const update_url = ` https://sheets.googleapis.com/v4/spreadsheets/${new_spreadsheet_id}/values:batchUpdate`
					const update_data = {
						data: values.valueRanges,
						valueInputOption: "USER_ENTERED"
					}
					// Update Sheet Values
					await axios.post(update_url, update_data, { params: { access_token: user_token } }).then(r => r.data).catch(e => google_api_error_logger(e, true))
					// Clone Board
					const now = db.timestamp_sc()
					const new_board_id = db.random_id()
					cloned_board.public = is_template ? false : cloned_board.public
					cloned_board.spreadsheetId = new_spreadsheet_id
					cloned_board.created_at = now
					cloned_board.created_by = user_id
					cloned_board.id = new_board_id
					cloned_board.path = path
					cloned_board.blocks = cloned_board.blocks.map(block => ({ ...block, id: db.random_id(), created_at: now }))
					await db.create_or_replace(`workspaces/${workspace_id}/boards`, new_board_id, cloned_board)
					return new_board_id
				}

				let user_token = await get_token(workspace.token, workspace_id)
				// original logic to clone ...
				cloned_workspace_id = is_template ? process.env.CHARTMAT_TEMPLATE_WORKSPACE_ID : workspace_id

				if (template_id) {
					// Clone Spreadsheet and then clone the board
					let cloned_workspace = is_template ? await db.get_id("workspaces", cloned_workspace_id) : workspace

					const original_board = await db.get_id(`workspaces/${cloned_workspace_id}/boards`, template_id)
					if (!original_board) {
						throw new Error("400::Sorry this template doesn't exists")
					}
					const cloned_board = { ...original_board }
					const template_token = is_template ? await get_token(cloned_workspace.token, cloned_workspace_id) : user_token
					const url = `https://sheets.googleapis.com/v4/spreadsheets`
					const template_spreadsheet = await axios.get(`${url}/${cloned_board.spreadsheetId}`, { params: { access_token: template_token } }).catch(e => google_api_error_logger(e, true)).then(r => r.data)
					const payload = {
						properties: { ...template_spreadsheet.properties, title: `Chartmat ${template_spreadsheet.properties.title}` },
						sheets: template_spreadsheet.sheets
					}
					const new_spreadsheet = await axios.post(url, payload, { params: { access_token: user_token } })
						.catch(e => google_api_error_logger(e, true))
						.then(r => r.data)
					const new_spreadsheet_id = new_spreadsheet.spreadsheetId

					const ranges = template_spreadsheet.sheets.map(sheet => `ranges='${sheet.properties.title}'`).join("&")
					const value_url = `https://sheets.googleapis.com/v4/spreadsheets/${cloned_board.spreadsheetId}/values:batchGet?${ranges}`

					const values = await axios.get(value_url, { params: { access_token: template_token, valueRenderOption: "FORMULA" } }).then(r => r.data).catch(e => google_api_error_logger(e, true))
					const update_url = ` https://sheets.googleapis.com/v4/spreadsheets/${new_spreadsheet_id}/values:batchUpdate`
					const update_data = {
						data: values.valueRanges,
						valueInputOption: "USER_ENTERED"
					}

					// Update Sheet Values
					await axios.post(update_url, update_data, { params: { access_token: user_token } }).then(r => r.data).catch(e => google_api_error_logger(e, true))

					// Clone Board
					const now = db.timestamp_sc()
					const new_board_id = db.random_id()
					cloned_board.public = is_template ? false : cloned_board.public
					cloned_board.spreadsheetId = new_spreadsheet_id
					cloned_board.created_at = now
					cloned_board.created_by = user_id
					cloned_board.id = new_board_id
					cloned_board.path = path
					cloned_board.blocks = cloned_board.blocks.map(block => ({ ...block, id: db.random_id(), created_at: now }))
					await db.add_one(`workspaces/${workspace_id}/boards`, cloned_board)
					return new_board_id
				}

				// Create a new board
				else {
					const new_board = { id: db.random_id(), spreadsheetId: spreadsheetId, created_at: db.timestamp_sc(), workspace_id: workspace_id, created_by: user_id, blocks: [], public: false, path: path }
					const spreadsheet_metadata = await get_metadata(user_token, new_board)
					await db.add_one(`workspaces/${workspace_id}/boards`, { ...new_board, ...spreadsheet_metadata })
					return new_board.id
				}
			}
			else if (req.method === "PUT") {
				await update_board(workspace_id, board_id, workspace.boards, req.body)
				return "Board edited"
			}
			else if (req.method === "DELETE") {
				await db.delete_one(`workspaces/${workspace_id}/boards`, board_id)
				return "Board deleted"
			}
		}
	},

	// test email service
	{
		url: "/api/test-email",
		method: ["POST"],
		handler: async (req, res) => {
			const email_service = req.body.email_service
			const to_email = req.body.to_email
			if (email_service.provider == 'postmark') {
				try {
					await sendEmailPostMark(
						email_service.sender_email,
						email_service.sender_name,
						to_email,
						'Test email from Chartmat',
						"",
						`Hi,\r\nThis is an email to test your white labelled sender email address using the service provider that you have selected on your Chartmat workspace. Login PIN emails for all boards on this workspace will be sent to your board users using this sender email address.`,
						email_service.postmark_key)
					return { success: true }
				} catch (e) {
					console.log(e)
					return { success: false, msg: e.toString() }
				}
			}
		}
	},

	{
		url: "/api/board/db-user",
		method: ["GET"],
		preHandler: [set_workspace, set_user_or_null, can_edit, public_endpoint],
		handler: async (req, reply) => {
			const { id } = req.user;
			const user = await db.get_id('users', id)
			return user
		}
	},

	// login to board with email and password
	{
		url: "/api/board/login-email/:id",
		method: ["POST"],
		handler: async (req, reply) => {
			const email = validate_email(req.body.email)
			const password = req.body.password
			const board_id = req.params.id
			const workspace_id = req.body.workspace_id
			const password_key = `${workspace_id}_${board_id}_password`
			const permission_key = `${workspace_id}_${board_id}`

			let user = await db.get_one("dashboard_users", ['email', '==', email])
			if (!user || !user[password_key]) {
				return { success: false, msg: "The email address does't have access to this board with password. Please try another email or reset the password." }
			}

			const matched = await new Promise(resolve => {
				bcrypt.compare(password, user[password_key], (err, isMatch) => {
					return resolve(isMatch)
				})
			})

			if (!matched) {
				return { success: false, msg: "Invalid password." }
			}
			return {
				success: true,
				data: {
					id: user.id, permission: user[permission_key] || 'read', email: user.email
				}
			}
		}
	},

	// Send password reset otp for user-board combination
	{
		url: "/api/board/password-reset-otp/:id",
		method: ["POST"],
		handler: async (req, reply) => {
			const email = validate_email(req.body.email)
			const fresh_signup = req.query["fresh_signup"] == "true"
			console.log(req.query);
			console.log(fresh_signup)
			const board_id = req.params.id
			const otp = otp_generator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
			const workspace_id = req.body.workspace_id

			const key = `${workspace_id}_${board_id}`
			const workspace = await db.get_id("workspaces", workspace_id)
			const board = await db.get_id(`workspaces/${workspace_id}/boards`, board_id)
			let users = await db.get_many("dashboard_users", [key, '!=', null])

			if (fresh_signup) {
				if (users.map((u) => u.email).includes(email)) {
					return { success: false, msg: "User already exists." }
				}
			} else {
				if (!users.map((u) => u.email).includes(email)) {
					return { success: false, msg: "User does not exists." }
				}
			}


			const doc = await db.add_one("user_otp", {
				otp, email,
				board_id,
				workspace_id: workspace_id,
				generated_on: Date.now().valueOf()
			})

			const email_config = { board_name: board.name, pin: otp }
			if (process.env.IS_LOCAL == "true") {
				return { success: true, otp_doc_id: doc }
			}
			if (workspace.email_service?.provider == 'postmark') {
				const email_service = workspace.email_service;
				const email_html = otp_template(email_config)
				try {
					await sendEmailPostMark(email_service.sender_email,
						email_service.sender_name,
						email,
						`OTP to verify your email address for ${email_config.board_name}`,
						email_html,
						"",
						email_service.postmark_key)
					return { success: true, otp_doc_id: doc }
				} catch (e) {
					return { success: false, msg: "Something went wrong, please try again." }
				}
			} else {
				if (process.env.IS_LOCAL !== "true") {
					const email_sent = await sendEmail(email, "board-password-reset", email_config)
					return { success: true, otp_doc_id: doc }
				}
				return { success: true, otp_doc_id: doc }
			}

		}
	},

	// reset password for user-board combination
	{
		url: "/api/board/reset-password/:id",
		method: ["POST"],
		handler: async (req, reply) => {
			const email = validate_email(req.body.email)
			const password = req.body.password
			const otp = req.body.otp
			const otp_doc_id = req.body.otp_doc_id

			// read otp doc
			const otp_doc_data = await db.get_id("user_otp", otp_doc_id)
			const board_id = req.params.id

			if (otp !== otp_doc_data.otp) {
				return { success: false, msg: 'Invalid OTP.' }
			}

			const key = `${otp_doc_data.workspace_id}_${board_id}`

			// if user is not in the list, create user with basic permission.
			// const user = await db.get_id("dashboard_users", email)
			let user = await db.get_one("dashboard_users", ["email", '==', email])

			// hash and store the password
			const hashedPassword = await new Promise(resolve => {
				bcrypt.hash(password, 16, async (err, hash) => {
					resolve(hash)
				})
			})

			if (!user) {
				user = {}
				user['email'] = email
				user[`${key}_password`] = hashedPassword
				user[key] = 'read'
				user['id'] = await db.add_one("dashboard_users", user)
			} else if (!user[key]) {
				user[key] = 'read'
				user[`${key}_password`] = hashedPassword
				await db.update_one("dashboard_users", user.id, user)
			} else {
				user[`${key}_password`] = hashedPassword
				await db.update_one("dashboard_users", user.id, user)
			}
			// remove otp
			await db.delete_one("user_otp", otp_doc_id)
			return {
				success: true,
				data: {
					id: user.id, permission: user[key] || 'read', email: user.email
				}
			}

		}
	},

	// Send otp for user-board combination
	{
		url: "/api/board/login/:id",
		method: ["POST"],
		handler: async (req, reply) => {
			const email = validate_email(req.body.email)
			const board_id = req.params.id
			const otp = otp_generator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
			const workspace_id = req.body.workspace_id

			const key = `${workspace_id}_${board_id}`
			const workspace = await db.get_id("workspaces", workspace_id)
			const board = await db.get_id(`workspaces/${workspace_id}/boards`, board_id)
			let users = await db.get_many("dashboard_users", [key, '!=', null])
			if (board.sign_in_method === "Users created by admin") {
				if (!users.map((u) => u.email).includes(email)) {
					return { success: false, msg: "The email address does't have access to this board. Please try another." }
				}
			}


			const doc = await db.add_one("user_otp", {
				otp, email,
				board_id,
				workspace_id: workspace_id,
				generated_on: Date.now().valueOf()
			})

			const email_config = { board_name: board.name, pin: otp }
			if (workspace.email_service?.provider == 'postmark') {
				const email_service = workspace.email_service;
				const email_html = pin_template(email_config)
				try {
					await sendEmailPostMark(email_service.sender_email,
						email_service.sender_name,
						email,
						`Your PIN for ${email_config.board_name}`,
						email_html,
						"",
						email_service.postmark_key)
					return { success: true, otp_doc_id: doc }
				} catch (e) {
					return { success: false, msg: "Something went wrong, please try again." }
				}
			} else {

				if (process.env.IS_LOCAL !== "true") {
					const email_sent = await sendEmail(email, "board-pin", email_config)
					return { success: true, otp_doc_id: doc }
				}
				return { success: true, otp_doc_id: doc }
			}

		}
	},


	// verify otp for user-board combination
	{
		url: "/api/board/auth/:id",
		method: ["POST"],
		handler: async (req, reply) => {
			const email = validate_email(req.body.email)
			const otp = req.body.otp
			const otp_doc_id = req.body.otp_doc_id

			// read otp doc
			const otp_doc_data = await db.get_id("user_otp", otp_doc_id)
			const board_id = req.params.id

			if (otp !== otp_doc_data.otp) {
				return { success: false, msg: 'Invalid PIN.' }
			}

			const key = `${otp_doc_data.workspace_id}_${board_id}`
			const workspace = await db.get_id("workspaces", otp_doc_data.workspace_id)
			const board = await db.get_id(`workspaces/${otp_doc_data.workspace_id}/boards`, board_id)
			let users = await db.get_many("dashboard_users", [key, '!=', null])
			if (board.sign_in_method === "Users created by admin") {
				if (!users.map((u) => u.email).includes(email)) {
					return { success: false, msg: 'Email address not in allowed by admin.' }
				}
			}

			// if user is not in the list, create user with basic permission.
			// const user = await db.get_id("dashboard_users", email)
			let user = await db.get_one("dashboard_users", ["email", '==', email])

			if (!user) {
				// Create or update user 
				user = {}
				user['email'] = email
				user[key] = 'read'
				user['id'] = await db.add_one("dashboard_users", user)
			} else if (!user[key]) {
				user[key] = 'read'
				await db.update_one("dashboard_users", user.id, user)
				console.log(user)
			}

			// remove otp
			await db.delete_one("user_otp", otp_doc_id)
			return {
				success: true,
				data: {
					id: user.id, permission: user[key] || 'read', email: user.email
				}
			}
		}
	},

	// user list for current workspace - dashboard
	{
		url: "/api/board/:id/users",
		method: ["GET"],
		preHandler: [set_workspace, set_user_or_null, can_edit, public_endpoint],
		handler: async (req, reply) => {
			const { board, workspace, workspace_id, board_id } = req
			const key = `${workspace_id}_${board_id}`
			let users = await db.get_many("dashboard_users", [key, '!=', null])
			users = users.map((u) => {
				u['permission'] = u[key]
				u['id'] = u.id
				return u
			})
			return { users: users }
		}
	},


	// manage current workspace - dashboard
	{
		url: "/api/board_users",
		method: ["POST", "DELETE"],
		preHandler: [set_workspace, set_user_or_null, can_edit, public_endpoint],
		handler: async (req, reply) => {
			const { workspace_id, board_id } = req
			const key = `${workspace_id}_${board_id}`
			const id = req.body.user_id
			const email = req.body.email
			const remove = req.body.remove
			if (req.method === "POST") {
				console.log(email)
				if (remove) {
					let obj = {}
					obj[key] = null
					if (id) {
						await db.update_one("dashboard_users", id, obj)
					}
				} else {
					let obj = {}
					obj['email'] = email
					obj[key] = req.body.permission
					// such user exist don't add
					const doc = await db.get_one("dashboard_users", ["email", '==', email])
					if (doc?.id) {
						await db.update_one("dashboard_users", doc.id, obj)
					} else {
						await db.add_one("dashboard_users", obj)
					}
				}
			}
			return "Ok"
		}
	},

	{
		url: "/api/board/:id",
		method: ["GET"],
		preHandler: [set_workspace, set_user_or_null, can_edit, public_endpoint],
		handler: async (req, reply) => {

			// :id is the board id. It is important because otherwise caching would return always the same board
			const { board, workspace, workspace_id, board_id } = req
			const dbUser = await db.get_id('users', workspace.created_by)
			// Checking stripe status existance as it does not apply to appsumo & paddel subscription.
			if (dbUser.stripe_status && !['trialing', 'active'].includes(dbUser.stripe_status)) {
				dbUser.stripe_status === 'canceled' ? board.expired = true : board.autocharge_failed = true;
			}
			if (!dbUser.plan) {
				board.expired = true
			}
			// will use board favicon as workspace favicon
			board.favicon = workspace.favicon
			board.workspace_id = workspace_id
			board.palette = workspace.palette
			board.can_edit = req.workspace.can_edit
			board.user_role = req.workspace.user_role
			return board
		}
	},

	{
		url: "/api/board/block",
		method: ["PUT", "DELETE"],
		preHandler: [set_workspace, set_user, can_edit, private_endpoint],
		handler: async (req, reply) => {
			const { board, workspace, workspace_id, board_id } = req
			const blocks = board.blocks || []
			const index = board.blocks.findIndex(block => block.id === req.body.id)
			if (req.method === "PUT") {
				if (index > -1) {
					blocks[index] = req.body
				} else {
					blocks.push(req.body)
				}
			} else if (req.method === "DELETE") {
				blocks.splice(index, 1);
			}
			await update_board(workspace_id, board_id, workspace.boards, { blocks: blocks })

			return "Done"
		}
	},

	{
		url: "/api/board/update-metadata",
		method: ["POST"],
		preHandler: [set_workspace, set_user, can_edit, private_endpoint],
		handler: async (req, reply) => {
			const { workspace, workspace_id, board_id } = req
			const token = await get_token(req.workspace.token, workspace_id)
			const new_metadata = await get_metadata(token, req.board)
			await update_board(workspace_id, board_id, workspace.boards, new_metadata)
			return new_metadata
		}
	},

	{
		url: "/api/board/:spreadsheet_id/sheet/:sheet_title",
		method: ["PUT", "DELETE"],
		preHandler: [set_workspace, set_user_or_null, can_edit, public_endpoint],
		handler: async (req) => {
			const { spreadsheetId, sheets } = req.board
			const { sheet_title } = req.params
			const token = await get_token(req.workspace.token, req.workspace_id)


			const sheet = sheets.find(s => s.title === sheet_title)
			const input_range = sheet?.range ?? "A1"
			const range = input_range.includes(":") ? input_range : `${input_range}:100000`
			const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheet_title)}!${range}`

			if (req.method === "PUT") { // Edit or add data via forms
				const row = req.query.row
				const columns = await axios.get(url, { params: { access_token: token } })
					.then(r => r.data.values[0])
					.catch(e => ({
						error: google_api_error_logger(e, true)
					}))
				const values = Array(columns.length).fill(null)
				for (const [new_column_name, new_value] of Object.entries(req.body)) {
					const index = columns.findIndex(column_name => column_name === new_column_name)
					if (index === -1) {
						throw new Error(`400::The sheet "${sheet_title}" doesn't have anymore the column "${new_column_name}". Please re-map this axis in the block editor to fix the issue.`)
					}
					values[index] = new_value
				}

				const params = {
					valueInputOption: 'USER_ENTERED',
					access_token: token
				}
				const body = {
					majorDimension: "ROWS",
					values: [values]
				}

				if (row) {
					const [start_range, end_range] = range.split(":")
					const start_range_letters = start_range.replace(/\d+/g, "")
					const start_range_numbers = start_range.replace(/[^.\d]/g, "")
					const range_cell = start_range_letters + (parseInt(start_range_numbers) + parseInt(row) + 1) // +1 Because the first row is the headers, so data starts in row 2
					// const correct_range = `${encodeURIComponent(sheet_title)}!${range_cell}`
					const correct_range = `'${sheet_title}'!${range_cell}`
					const edit_body = {
						"valueInputOption": "USER_ENTERED",
						"data": {
							"values": [values],
							"range": correct_range
						}
					}
					const edit_url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`
					await axios.post(edit_url, edit_body, { params }).catch(e => ({
						error: google_api_error_logger(e, true)
					}))

				}
				else {
					await axios.post(`${url}:append`, body, {
						params
					}).catch(e => ({
						error: google_api_error_logger(e, true)
					}))
				}
				return "Done"
			} else if (req.method === "DELETE") {
				const row = req.query.row
				const params = {
					access_token: token
				}
				const get_url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`
				const sheet = await axios.get(get_url, { params }).catch(e =>
				({
					error: google_api_error_logger(e, true)
				}))
				const sheet_id = sheet.data.sheets.filter(s => s.properties.title == sheet_title).map(s => s.properties.sheetId)[0]
				const body = {
					"requests": [
						{
							"deleteDimension": {
								"range": {
									"sheetId": sheet_id,
									"dimension": "ROWS",
									"startIndex": parseInt(row) + 1,
									"endIndex": parseInt(row) + 2,
								}
							}
						}
					],
				}
				const delete_url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`
				const res = await axios.post(delete_url, body, { params }).catch(e => ({
					error: google_api_error_logger(e, true)
				}))
				return "Done"
			}
		}
	},

	{
		url: "/api/workspaces/custom-domain",
		method: ["POST", "GET", "DELETE"],
		preHandler: [set_workspace, set_user, can_edit, private_endpoint],
		handler: async (req, reply) => {
			const { workspace, body, query, user, workspace_id, method } = req
			let domain = method === "POST" ? body.domain : workspace.domain

			domain = domain.replace("http://", "https://").replace("https://", "") // Remove all nonsense

			if (!domain) {
				throw new Error("400::You need to pass a valid domain")
			}
			if (domain.includes("chartmat.")) { // Avoid that chartmat.com, .app, .dev or others get edited
				throw new Error("400::Uneditable domain - You can't use a domain which included the word Chartmat")
			}
			const config = { headers: { Authorization: `Bearer ${process.env.CHARTMAT_VERCEL_AUTH_TOKEN}` }, params: { teamId: process.env.CHARTMAT_VERCEL_TEAM_ID } }

			if (method === "GET") {
				const { data } = await axios.get(`https://api.vercel.com/v6/domains/${workspace.domain}/config`, config)
				const valid = data?.configuredBy ? true : false;
				return valid
			}

			else if (method === "POST") {
				// ADD A NEW DOMAIN TO THIS WORKSPACE
				const already_taken = await db.get_one("workspaces", ['domain', '==', domain])
				if (already_taken) {
					throw new Error("400::This domain seems to be connected already to an existing workspace.")
				}
				const domain_api = `https://api.vercel.com/v8/projects/${process.env.CHARTMAT_VERCEL_PROJECT_ID}/domains`

				try {
					await axios.post(domain_api, { name: domain }, config)
					await db.update_one("workspaces", workspace_id, { domain })
					return `Domain ${domain} successfully added`
				} catch (e) {
					throw new Error(`400::${domain} can't be added. Please try a different domain or contact us. - ${e.message}`)
				}
			}

			else if (method === "DELETE") {
				const delete_domain_api = `https://api.vercel.com/v6/domains/${domain}`
				// The API below is documented in the platform starter kit but doesn't seem to work..
				// const delete_domain_api = `https://api.vercel.com/v8/projects/${process.env.SPLITMAT_PROXY_PROJECT_ID}/domains/${domain}`
				try {
					await axios.delete(delete_domain_api, config)
					await db.update_one("workspaces", workspace_id, { domain: null })
					return `Domain ${domain} successfully deleted`
				} catch (e) {
					return { error: "This domain can not be deleted. Please reach out" }
				}
			}
		}
	},

	// make api call
	{
		url: "/api/board/api_call",
		method: ["POST"],
		preHandler: [set_workspace],
		handler: async (req, reply) => {
			const { board } = req
			const block = board.blocks.find(block => block.id === req.body.id)
			const action = block.actions[req.body.action_index]
			const data = req.body.data
			let body;
			let headers = {}

			if (action.field_mapping && action.body_type == 'JSON') {
				const field_mapping = JSON.parse(action.field_mapping)
				body = {}
				headers["Content-Type"] = "application/json"
				field_mapping.forEach((v) => {
					body[v.key] = data[v.value]
				})
			} else if ((action.field_mapping && action.body_type == 'Form-data')) {
				body = new URLSearchParams()
				const field_mapping = JSON.parse(action.field_mapping)
				headers["Content-Type"] = "application/x-www-form-urlencoded"
				field_mapping.forEach((v) => {
					body.append(v.key, data[v.value]);
				})
			}

			try {
				let res;
				switch (action.authorization_method) {
					case 'Custom Header':
						headers[action.custom_header] = action.token
						res = await axios({
							method: action.http_method,
							url: action.api_endpoint,
							headers,
							data: body
						});
						break;

					case 'Bearer Token':
						headers['Authorization'] = `Bearer ${action.token}`
						res = await axios({
							method: action.http_method,
							url: action.api_endpoint,
							headers,
							data: body
						});
						break;

					default:
						res = await axios({
							method: action.http_method,
							url: action.api_endpoint,
							data: body
						});
						break;
				}
				return reply.status(200).send(res.data)
			} catch (e) {
				return reply.status(400).send(e.toString())
			}
		}
	}
]

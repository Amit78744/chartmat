const db = require("../db.js")
const jwt = require("jsonwebtoken")
const axios = require("axios")
const { validate_email, get_token, sendTelegram, decode_token, set_workspace_or_null, save_token, setup_board, google_api_error_logger, sendEmail, set_user_or_null, set_user, get_or_create_user, short_login_url } = require("../commons.js")
const { CHARTMAT_PLANS } = require("../const.js")
// const querystring  = require('querystring');


const block_free_signups = async (email) => {
	const user = await db.get_one("users", ["email", "==", email])
	if (!user) {
		// Check it it's maybe a guest
		const workspaces = await db.get_many("workspaces", ["users", "array-contains-any", [{ email: email, role: "admin" }, { email: email, role: "guest" }]])
		if (!workspaces.length) {
			await sendTelegram(`${email} just tried to login, but it doesn't have an active account`)
			throw new Error(`400::The email ${email} is not registered. Please try another email or start a free trial at chartmat.com/pricing`)
		}
	}
}


const auth_routes = module.exports = [

	{
		url: "/api/validate/appsumo_code",
		method: ["POST"],
		handler: async (req) => {
			const coupon_doc = await db.get_id(process.env.CHARTMAT_ACTIVE_CAMPAIGN_COLLECTION, req.body.coupon_code)
			if (coupon_doc) {
				if (coupon_doc.claimed) {
					return { valid: false, msg: "AppSumo code already claimed." }
				}
				return { valid: true }
			}
			return { valid: false, msg: "Invalid AppSumo code." }
		}
	},
	{
		url: "/api/auth/db-user",
		method: ["GET"],
		preHandler: [set_user],
		handler: async (req) => {
			const db_user = await db.get_id("users", req.user.id)
			if (!db_user) { throw new Error("400::This user has been deleted") }
			const workspaces = await db.get_many("workspaces", ["created_by", "==", req.user.id])
			return {
				email: db_user.email,
				cancel_url: db_user?.billing?.cancel_url,
				stripe_connected: !!db_user.stripe_customer,
				stripe_cancel_at: db_user.stripe_cancel_at,
				stripe_status: db_user.stripe_status,
				stripe_current_period_end: db_user.stripe_current_period_end,
				plan: db_user.plan,
				plan_limits: db_user.plan_limits || CHARTMAT_PLANS[db_user.plan] || {
					allowed_workspaces: 0,
					allowed_user_per_workspace: 0,
				},
				lifetime_campaign: db_user?.lifetime_campaign,
				ga_connected: !!db_user?.token?.refresh_token,
				total_workspaces: workspaces.length,
				paddle_cancel_url: db_user.paddle_cancel_url,
				invoice_item_uuid: db_user.invoice_item_uuid,
				stripe_account: db_user.stripe_account,
			}
		}
	},

	{
		url: "/api/auth",
		method: ["POST", "GET", "PUT"],
		preHandler: [set_workspace_or_null, set_user_or_null],
		schema: {
			summary: "Converts or sends JWT",
			description: 'Convert JWT to a long lived one or Send a short lived JWT via email',
			tags: ['auth'],
		},
		handler: async (req) => {
			if (req.method === "GET") {
				return { user: req.user }
			}

			else if (req.method === "POST") {
				const body = req.body
				if (body.token) { // Convert short-lived token to long-lived one
					const [token_data, secret] = await decode_token(req, body.token)
					const email = validate_email(token_data.email)
					const [user, created] = await get_or_create_user(email)
					const long_lived_token = jwt.sign({ data: { id: user.id, email: email } }, secret, { expiresIn: '90 days' })
					await db.update_one("users", user.id, { last_login_at: db.timestamp_sc() })
					return { token: long_lived_token, created: created }
				}

				else { // Send short lived token

					parsedURL = new URL(req.headers.referer)
					const onlyPathURL = `${parsedURL.origin}${parsedURL.pathname}`
					const email = validate_email(body.email)
					const [tokenUrl, token] = short_login_url(email, onlyPathURL)

					// Verify that the user was added to a workspace
					await block_free_signups(email)

					if (process.env.IS_LOCAL === "true") {
						console.log('\x1b[36m', `In production we would email: ${email} the link:`, '\x1b[32m', `${tokenUrl}`, '\x1b[0m');
						return { email_sent: true }
					}
					else {
						console.log("mail sent.")
						const email_config = { action_url: tokenUrl }
						const email_sent = await sendEmail(email, "login", email_config)
						return { email_sent: email_sent }
					}
				}
			}
		}
	},

	{
		url: "/api/auth/google",
		method: ["GET", "PUT", "POST"],
		preHandler: [set_user_or_null],
		handler: async (req, reply) => {
			const user = req.user
			const scopes = [
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/drive.file",
			]
			const protocol = process.env.IS_LOCAL ? 'http://' : "https://"
			const ga_values = {
				client_id: process.env.CHARTMAT_GOOGLE_CLIENT_ID,
				redirect_uri: `${protocol}${process.env.CHARTMAT_BOARD_BASE_URL}/dashboard/auth`,
				access_type: 'offline',
				response_type: 'code',
				scope: scopes.join(" ")
			}
			if (req.method === "PUT") {
				ga_values.prompt = "consent" // Returns a new refresh token
			}

			if (["GET", "PUT"].includes(req.method)) {
				const query = new URLSearchParams(ga_values)
				return `https://accounts.google.com/o/oauth2/auth?${query.toString()}`
				// return `https://accounts.google.com/o/oauth2/auth?${querystring.stringify(ga_values)}`
			}

			else if (req.method === "POST") {
				const post_data = { grant_type: "authorization_code", code: req.body.code, client_id: ga_values.client_id, client_secret: process.env.CHARTMAT_GOOGLE_CLIENT_SECRET, redirect_uri: ga_values.redirect_uri }
				const { data } = await axios.post("https://www.googleapis.com/oauth2/v4/token", post_data).catch(e => google_api_error_logger(e))
				let user_id = user?.id
				let created = false
				let shortLifeToken = false
				if (req.body.workspace_id || !user_id) { // Verify who owns the new token - Not needed when just logging in.
					const token_user = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", { params: { access_token: data.access_token } }).then(r => r.data)
					if (!token_user.email_verified) {
						throw new Error("400::For security reasons you can login with Google only with a verified email")
					}
					data.email = validate_email(token_user.email)
				}

				if (!user_id) {

					// Verify that the user was added to a workspace
					await block_free_signups(data.email)

					const user_info = await get_or_create_user(data.email)
					user_id = user_info[0].id
					created = user_info[1]
					const url_and_token = short_login_url(data.email)
					shortLifeToken = url_and_token[1]
				}

				let subdomain = null
				if (req.body.workspace_id) {
					await save_token(req.body.workspace_id, data)
					const workspace = await db.get_id("workspaces", req.body.workspace_id)
					subdomain = workspace.subdomain
				}

				return shortLifeToken ? { token: shortLifeToken, created: created } : { subdomain: subdomain }
			}
		}
	},

	{
		url: "/api/auth/app_script",
		method: ["GET", "PUT", "POST"],
		preHandler: [set_user_or_null],
		handler: async (req, reply) => {
			const user = req.user
			const scopes = [
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/drive.file",
				"https://www.googleapis.com/auth/script.scriptapp",
			]
			const protocol = process.env.IS_LOCAL ? 'http://' : "https://"
			const ga_values = {
				client_id: process.env.CHARTMAT_GOOGLE_CLIENT_ID,
				redirect_uri: `${protocol}${process.env.CHARTMAT_BOARD_BASE_URL}/dashboard/auth`,
				access_type: 'offline',
				response_type: 'code',
				scope: scopes.join(" ")
			}
			if (req.method === "PUT") {
				ga_values.prompt = "consent" // Returns a new refresh token
			}

			if (["GET", "PUT"].includes(req.method)) {
				const query = new URLSearchParams(ga_values)
				return `https://accounts.google.com/o/oauth2/auth?${query.toString()}`
				// return `https://accounts.google.com/o/oauth2/auth?${querystring.stringify(ga_values)}`
			}

			else if (req.method === "POST") {
				const post_data = { grant_type: "authorization_code", code: req.body.code, client_id: ga_values.client_id, client_secret: process.env.CHARTMAT_GOOGLE_CLIENT_SECRET, redirect_uri: ga_values.redirect_uri }
				const { data } = await axios.post("https://www.googleapis.com/oauth2/v4/token", post_data).catch(e => google_api_error_logger(e))
				let user_id = user?.id
				let created = false
				let shortLifeToken = false
				if (req.body.workspace_id || !user_id) { // Verify who owns the new token - Not needed when just logging in.
					const token_user = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", { params: { access_token: data.access_token } }).then(r => r.data)
					if (!token_user.email_verified) {
						throw new Error("400::For security reasons you can login with Google only with a verified email")
					}
					data.email = validate_email(token_user.email)
				}


				if (!user_id) {

					// Verify that the user was added to a workspace
					await block_free_signups(data.email)

					const user_info = await get_or_create_user(data.email)
					user_id = user_info[0].id
					created = user_info[1]
					const url_and_token = short_login_url(data.email)
					shortLifeToken = url_and_token[1]
				}
				let subdomain = null
				if (req.body.workspace_id) {
					await save_token(req.body.workspace_id, data)
					const workspace = await db.get_id("workspaces", req.body.workspace_id)
					subdomain = workspace.subdomain
				}

				return shortLifeToken ? { token: shortLifeToken, created: created } : { subdomain: subdomain }
			}
		}
	},

	{
		url: "/api/auth/loopedin",
		method: ["POST"],
		preHandler: [set_user],
		handler: async (req, rep) => {
			const name = req.user.email.split("@")[0]
			const token = jwt.sign({ email: req.user.email, name: name }, process.env.LOOPEDIN_SSO_KEY, { algorithm: 'HS256' });
			return `${req.body.returnURL}?token=${token}`
		}
	}
]
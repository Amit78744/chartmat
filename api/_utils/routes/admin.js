const db = require("../db.js")
const axios = require("axios")
const { validate_email, short_login_url, get_or_create_user, sendTelegram, get_token, google_api_error_logger } = require("../commons.js")
const { enterprise_to_business } = require("../db.js")

const private_fn = async (req, rep) => {
	const today = `${parseInt(new Date().getMonth()) + 1}${new Date().getDate()}`
	const auth = req.headers.authorization
	if (!auth) {
		const now = db.timestamp_sc()
		rep.headers({ "WWW-Authenticate": `Basic realm="Admin Dashboard"` })
		rep.statusCode = 401
		throw new Error("401::Ship a password")
	}
	else {
		const decoded = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString()
		const [username, password] = decoded.split(":")
		const [day, user] = username.split("-")
		const admins = ['admin36x']
		if (day !== today || !admins.includes(user)) {
			await sendTelegram(`ADMIN_ACCESS: ${user} wrong username`)
			throw new Error("400::Wrong Username")
		}
		else if (password !== process.env.CHARTMAT_ADMIN_PASSWORD) {
			await sendTelegram(`ADMIN_ACCESS: ${user} wrong password`)
			throw new Error("400::Wrong Password")
		}
		else {
			await sendTelegram(`ADMIN_ACCESS: ${user} just accessed the admin page`)
		}
	}
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

const admin_routes = module.exports = [

	{
		url: "/api/admin/x",
		method: ["GET"],
		preHandler: [],
		handler: async (req, rep) => {
			return "foo"
		}
	},

	{
		url: "/api/admin/stats",
		method: ["GET"],
		preHandler: [],
		handler: async (req, rep) => {
			const { code } = req.headers
			if (code !== "ghk36HB%@s8") {
				await sendTelegram("Wrong stats code")
				throw new Error("wrong code")
			}
			const users = await db.get_many("users")
			const workspaces = await db.get_many("workspaces")
			const boards = workspaces.map(w => w.boards || []).flat()
			const blocks = boards.map(b => b.blocks || []).flat()
			const plans = {}
			for (const user of users) {
				const plan = "PLAN_" + (user.plan ?? "free")
				if (plans[plan]) {
					plans[plan]++
				} else {
					plans[plan] = 1
				}
			}
			return {
				total_users: users.length,
				total_workspaces: workspaces.length,
				total_boards: boards.length,
				total_blocks: blocks.length,
				time: db.timestamp_sc(),
				...plans,
				workspaces: workspaces.map(w => ({ subdomain: w.subdomain, name: w.name, created_at: w.created_at })),
				boards: boards.map(board => ({ subdomain: board.subdomain, title: board.title, created_at: board.created_at })),
				blocks: blocks.map(block => ({ id: block.id, created_at: block.created_at }))
			}
		}
	},

	{
		url: "/api/new-users",
		method: ["GET"],
		preHandler: [private_fn],
		handler: async (req, rep) => {
			const workspaces = await db.get_many("workspaces")
			const wl = workspaces.length
			let ul = 0
			for (const workspace of workspaces) {
				const ux = workspace.users ?? []
				const user_x = ux.map(u => u.email).join("-")
				const admins_x = (workspace.admins ?? []).join("-")
				if (user_x !== admins_x) {
					console.log(`These are not equal: ${user_x} and ${admins_x}`)
				}
				// const admins = workspace.admins 
				// if (!admins){
				// 	console.log(`The workspace ${workspace.id} doesn't have admins`)
				// } else {
				// 	const users = workspace.admins.map(email => ({email:email, role:"admin"}))
				// 	const user_x = (workspace.users ?? []).join("-")
				// 	const skip = workspace.admins.lenght === user_x.length
				// 	if (!skip){
				// 		await db.update_one("workspaces", workspace.id, {users})
				// 		ul++							
				// 	}
				// }
			}
			return `Done`
		}
	},

	{
		url: "/api/migrate",
		method: ["GET"],
		preHandler: [private_fn],
		handler: async (req, rep) => {
			const zero = ["john.giftakis@gmail.com", "clong@goelemental.com", "philippekernfrance@gmail.com", "ilan@ezcell.ca", "chris@suffern.com.au", "info@cme.to", "oworthington@gmail.com", "stevenorechow@hey.com", "zero.bd4810@mailbeaver.net", "david@proweblabs.com", "sean@weblogixinc.com", "hugo@enrich3.com", "lindamacdonalde@gmail.com", "ag@goering.de", "ivhokt@gmail.com", "luciandesign@gmail.com", "fvanlint+zero@toolit.nl", "wiroj_t@tykglass.com", "daniel@enhancedprimarycare.co.uk", "chris@baselineaudio.com", "winzeler@andoverlabs.com", "admin@mediadevil.com", "workstation@gmail.com", "bbennett@thekickstart.com", "glyncaddell@gmail.com", "profacil@gmail.com", "loyalekoinu@gmail.com", "dave_jenkins5@yahoo.com", "digitaldiyninja@gmail.com", "birlibirloke@gmail.com", "shravad@gmail.com", "benjamin.migaud@gmail.com", "geniusdeliveredbyadr@gmail.com", "john@jhan.org", "dj.le.zero@evdigital.us", "anvesh@anveen.com", "tools@hudsongroup.pro", "ismo.talka@protonmail.com", "titodj@gmail.com", "alex@verbpeak.com", "vuhoang02@gmail.com", "khyozsan@gmail.com", "a_perona@yahoo.co.uk", "hello@airamplify.com.au", "subs@agapito.xyz", "mrchanvit@gmail.com", "dariusmk7@gmail.com", "accounts@sageninecreative.com", "ivanckw@gmail.com"]
			for (const email of zero) {
				const existing = await db.get_one("users", ["email", "==", email])
				if (existing) {
					// console.log(`User ${email} exists. ${existing.plan}`)
				}
				else {
					console.log(`NOT ${email} exists`)
					// await db.add_one("users", {email:email, plan:"chartmat_tier3", created_at:db.timestamp_sc()})
				}
			}
			return zero.length
		}
	},

	{
		url: "/api/clone-board/:workspace_subdomain/:board_path/:to_workspace_subdomain",
		method: ["GET"],
		preHandler: [private_fn],
		handler: async (req, rep) => {
			const { workspace_subdomain, board_path, to_workspace_subdomain } = req.params
			const workspace = await db.get_one("workspaces", ['subdomain', '==', workspace_subdomain])
			if (!workspace) {
				throw new Error("400::Workspace not found")
			}

			const board = await db.get_one(`workspaces/${workspace.id}/boards`, ["path", '==', board_path])
			if (!board) {
				throw new Error("400::Board not found")
			}
			const to_workspace = await db.get_one("workspaces", ['subdomain', '==', to_workspace_subdomain])
			if (!to_workspace) {
				throw new Error("400::To Workspace not found")
			}
			const to_boards = to_workspace.boards
			board.id = db.random_id()
			board.created_by = workspace.created_by
			board.created_at = db.timestamp_sc()
			board.public = false
			board.workspace_id = to_workspace.id
			await db.add_one(`workspaces/${workspace_id}/boards`, board)
			return "Done!"
		}
	},

	{
		url: "/api/admin",
		method: ["GET"],
		preHandler: [private_fn],
		handler: async (req, rep) => {
			// const templates = require("")
			rep.type('text/html')
			let base = "<h1 style='width:100%'>Chartmat Admin</h1>"
			base += "<h1 style='font-size: xx-large; color:red; text-align:center; position: sticky;top: 0; background-color:yellow; padding:10px;'>MAKE SURE YOU ARE USING THIS IN INCOGNITO MODE!!!!!</h1>"
			const database = db.connectToDatabase()
			const collections = await database.listCollections().then(snapshot => snapshot.map(snaps => snaps["_queryOptions"].collectionId))
			const users = await db.get_many("users")
			const workspaces = await db.get_many("workspaces")
			const boards = workspaces.map(w => w.boards || []).flat()

			const box_div = `<div style="background-color:white;padding:10px; margin-top:20px; border-radius:5px;border:1px solid black;height:300px;overflow:scroll;resize:vertical">`

			base += `${box_div}
						<h3>Stats:</h3>
						<ul><li>Total Users: ${users.length}</li></ul>
						<ul><li>Total workspaces: ${workspaces.length}</li></ul>
						<ul><li>Total Boards: ${workspaces.map(b => (b.boards || []).length).reduce((a, b) => a + b, 0)}</li></ul>
						<ul><li>Total Blocks: ${boards.map(b => (b.blocks || []).length).reduce((a, b) => a + b, 0)}</li></ul>
					</div>
					`

			base += `${box_div}
						<h3>Login as:</h3>
						<ul>${users.map(u => `<li><a href="/api/admin/login-as/${u.email}">${u.email}</a> (${u?.plan || ''}) - ${!!u?.token?.refresh_token ? 'G.S. Connected' : ''}</li>`).join('')}</ul>
					</div>	
					`

			base += `${box_div}
						<h3>Boards with blocks:</h3>
						<ul>${boards.map(b => `<li>${b.title} - ${b.created_by} - ${(b.blocks || []).length} Blocks</li>`).join('')}</ul>
					</div>
					`

			base += `${box_div}
					<h3>Power users:</h3>
					<ul>${boards.map(b => `<li>${b.title} - ${b.created_by} - ${(b.blocks || []).length} Blocks</li>`).join('')}</ul>
				</div>
				`

			base += `${box_div}
						<h3>Export all:</h3>
						<ul>${collections.map(c => `<li><a href="/api/admin/export/${c}">${c}</a></li>`).join('')}</ul>
					</div>
					`
			base += `${box_div}
						<h3>Users with more than 1 board:</h3>
						<ul>${users
					.filter(u => boards.filter(b => b.created_by === u.id).length > 1)
					.sort((a, b) => boards.filter(bo => bo.created_by === a.id) - boards.filter(bo => bo.created_by === b.id))
					.map(u => `<li>${u.email} (${boards.filter(b => b.created_by === u.id).length})</li>`)
					.join('')}</ul>
					</div>
				`

			const templates = require("../../../assets/files/templates.json")
			const x = templates.map(t => ({
				title: t.title,
				path: t.path,
				path_count: boards.filter(b => b.path === t.path).length,
				name_count: boards.filter(b => b.title.includes(t.title)).length
			})).sort((y, yy) => yy.path_count - y.path_count)

			base += `${box_div}
				<h3>Most cloned templates:</h3>
				<ul>${x
					.map(u => `<li>${u.title} (Same path: ${u.path_count}) - (Same name: ${u.name_count})</li>`)
					.join('')}</ul>
				</div>
			`

			base += `${box_div}
				<h3>Create a new account (Free Plan):</h3>
					Just visit /api/admin/create-account/:email-address
				</div>
			`
			return `<body style="padding:40px;background-color:#F9F5E3;font-family: sans-serif;">${base}</body>`
		}
	},

	{
		url: "/api/admin/login-as/:email",
		method: ["GET"],
		preHandler: [private_fn],
		handler: async (req, rep) => {
			const email = validate_email(req.params.email)
			const base_url = process.env.CHARTMAT_BOARD_BASE_URL
			const [url, token] = short_login_url(email, `//${base_url}/dashboard/auth`)
			return rep.redirect(url)
		}
	},

	{
		url: "/api/admin/create-account/:email",
		method: ["GET"],
		preHandler: [private_fn],
		handler: async (req, rep) => {
			const email = validate_email(req.params.email)
			const [user, created] = await get_or_create_user(email)
			if (created) {
				return `New user created with email: ${email} - ID is: ${user.id}`
			} else {
				throw new Error("400::This user already exists!!")
			}
		}
	},

	{
		url: "/api/admin/export/:collection",
		method: ["GET"],
		// preHandler:[private_fn],
		handler: async (req) => {
			const filter = req.query.filter ? req.query.filters.split(",") : null
			return await db.get_many(req.params.collection, filter)
		}
	},
	{
		url: "/api/admin/enterprise_to_business",
		method: ["GET"],
		// preHandler:[private_fn],
		handler: async (req) => {
			const users = await db.get_many("users", ["plan", "==", "enterprise"])
			console.log(users)
		}
	},
	{
		url: "/api/admin/coupons",
		method: ["GET"],
		handler: async (req) => {
			const coupons = await db.get_many("appsumo_apr_2023")
			console.log(coupons.length)
			return coupons.length
		}
	},

	{
		url: "/api/admin/approve_request",
		method: ["GET"],
		handler: async (req) => {
			const { review_id, catalog_color } = req.query;
			
			if(!catalog_color || !review_id){
				return "catalog_color & review_id are required query parameter."
			}
			const marketplaceWorkspaceId = process.env.CHARTMAT_MARKETPLACE_WORKPLACE_ID
			const marketplaceWorkspace = await db.get_id("workspaces", marketplaceWorkspaceId)
			const marketplaceToken = await get_token(marketplaceWorkspace.token, marketplaceWorkspaceId)
			const reviewRequest = await db.get_id("marketplace_review_requests", review_id);
			const boardToPublish = await db.get_id(`workspaces/${reviewRequest.workspace_id}/boards`, reviewRequest.board_id)

			if (!boardToPublish) {
				throw new Error("400::Sorry this template doesn't exists")
			}

			if(reviewRequest.status != 'pending'){
				return "already published"
			}

			const boardClone = { ...boardToPublish }
			const boardOwnerToken = await get_token(reviewRequest.token, reviewRequest.workspace_id)
			const url = `https://sheets.googleapis.com/v4/spreadsheets`
			const boardSpreadSheet = await axios.get(`${url}/${reviewRequest.spreadsheet_id}`,
				{ params: { access_token: boardOwnerToken } })
				.catch(e => {google_api_error_logger(e, true)
				console.log(e);
				}).then(r => r.data)
			const payload = {
				properties: {
					...boardSpreadSheet.properties, title: `Chartmat Marketplace ${boardSpreadSheet.properties.title}`
				},
				sheets: boardSpreadSheet.sheets,
			}
			const newGoogleSheet = await axios.post(url, payload, { params: { access_token: marketplaceToken } })
				.catch(e => {
					console.log(e.response.data);
					google_api_error_logger(e, true)})
				.then(r => r.data)
			const newGoogleSheetId = newGoogleSheet.spreadsheetId

			const makeSheetPublic = await axios.post(`https://www.googleapis.com/drive/v2/files/${newGoogleSheetId}/permissions
			`, { role: 'reader', type: 'anyone' },
				{ params: { access_token: marketplaceToken } }
			).catch(e => console.log(e))
				.then(r => r.data)
			console.log(makeSheetPublic)

			const ranges = boardSpreadSheet.sheets.map(sheet => `ranges='${sheet.properties.title}'`).join("&")
			const value_url = `https://sheets.googleapis.com/v4/spreadsheets/${boardClone.spreadsheetId}/values:batchGet?${ranges}`

			const values = await axios.get(value_url, { params: { access_token: boardOwnerToken, valueRenderOption: "FORMULA" } }).then(r => r.data).catch(e => google_api_error_logger(e, true))
			const update_url = ` https://sheets.googleapis.com/v4/spreadsheets/${newGoogleSheetId}/values:batchUpdate`
			const update_data = {
				data: values.valueRanges,
				valueInputOption: "USER_ENTERED"
			}

			// Update Sheet Values
			await axios.post(update_url, update_data, { params: { access_token: marketplaceToken } }).then(r => r.data).catch(e => google_api_error_logger(e, true))

			// Clone Board
			const now = db.timestamp_sc()
			const new_board_id = db.random_id()
			boardClone.public = true
			boardClone.sign_in_method = "No sign in"
			boardClone.spreadsheetId = newGoogleSheetId
			boardClone.created_at = now
			boardClone.created_by = "chartmat_admin"
			boardClone.board_id = new_board_id
			boardClone.token = marketplaceWorkspace.token
			boardClone.path = `${boardToPublish.path}-${now}`
			boardClone.blocks = boardClone.blocks.map(block => ({ ...block, id: db.random_id(), created_at: now }))
			boardClone.users = []
			boardClone.workspace_id = marketplaceWorkspaceId
			// mark request as published, also generate related assets in 
			// necessary collections...

			let catalogDocument = reviewRequest
			catalogDocument["status"] = "published"
			catalogDocument["name"] = boardToPublish.name || boardToPublish.title
			catalogDocument["id"] = new_board_id
			catalogDocument["marketplace_preview_path"] = `${boardToPublish.path}-${now}`
			catalogDocument["marketplace_board_id"] = new_board_id
			catalogDocument["marketplace_workspace_d"] = marketplaceWorkspaceId
			catalogDocument["marketplace_sheet_id"] = newGoogleSheetId
			catalogDocument["token"] = marketplaceWorkspace.token
			catalogDocument["catalogue_background"] = `#${catalog_color}`

			await db.update_one("marketplace_review_requests", review_id, { status: "published" }); // updating status of existing request.
			const marketplace_asset_id = `${reviewRequest.workspace_id}_${reviewRequest.board_id}` // reusing workspace_id & board_Id as we want to keep the only latest version in marketplace
			await db.create_or_replace(`marketplace_catalog`, marketplace_asset_id, catalogDocument)
			await db.create_or_replace(`marketplace_boards`, marketplace_asset_id, boardClone)
			// clone board to chartmat
			await db.create_or_replace(`workspaces/${marketplaceWorkspaceId}/boards`, new_board_id, boardClone)
			// await db.add_one(`workspaces/${marketplaceWorkspaceId}/boards`, boardClone)
			return new_board_id
		}
	},

	{
		url: "/api/admin/load_coupons",
		method: ["GET"],
		handler: async (req) => {
			const codes = require('./free-appsumo-codes.json')
			let i = 0;
			for (const c of codes) {
				await db.create_or_replace("appsumo_apr_2023", c, { appsumo_code: c })
				if (i % 400 == 0) {
					console.log("waiting`")
					await sleep(1000)
				}
				i++
			}
			console.log("loaded")
			return "done"
			// const users = await db.get_many("users", ["plan", "==", "enterprise"])
			// console.log(users)
		}
	},

]
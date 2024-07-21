const db = require("../db.js")
const { validate_email, set_user_or_null, sendTelegram } = require("../commons.js")
const axios = require("axios")

const main_routes = module.exports = [
	{
		url: "/api/delete-file",
		method: ["POST"],
		handler: async (req) => {
			const file_url = req.body.file_url
			await db.remove_file(file_url)
			return 'done'
		}
	},
	{
		url: "/api/upload-file",
		method: ["POST"],
		handler: async (req) => {
			const data = await req.file()
			if (!data) { // No file has been submitted
				return ''
			}
			const buffer = await data.toBuffer()
			const mb = 8
			if (Buffer.byteLength(buffer) > mb * 1000000) { // 1048576 = 1MB
				throw new Error(`400::Sorry this file is too big. It needs to be less than ${mb} MB`)
			}
			const url = db.upload_file(buffer, data.filename)
			return url
		}
	},

	{
		url: "/api/update-gist",
		method: ["GET"],
		handler: async (req) => {
			const url = "https://api.getgist.com/contacts/batch"
			const users = await db.get_many("users")
			const headers = { 'Content-Type': 'application/json', "Authorization": `Bearer ${process.env.CHARTMAT_GET_GIST_TOKEN}` }

			let gist = []
			let get_url = "https://api.getgist.com/contacts"
			while (get_url) {
				const this_gist = await axios.get(get_url, { headers }).then(r => r.data).catch(e => { throw new Error(e) })
				gist = [...gist, ...this_gist.contacts]
				get_url = this_gist?.pages?.next ?? null
			}

			const to_be_updated = []
			for (const user of users) {
				const plan = user.plan ?? "free"
				const exists = gist.find(g => g.email === user.email && g.user_id === user.id && g.custom_properties.plan === plan)
				if (!exists) {
					const contact = { email: user.email, user_id: user.id, custom_properties: { plan: plan } }
					to_be_updated.push(contact)
				}
			}

			const bulk_update = false
			if (bulk_update) {
				await axios.post("https://api.getgist.com/contacts/batch", { contacts: to_be_updated }, { headers })
				return `Bulk done for ${to_be_updated.length} contacts`
			}
			else {
				let count = 0
				for (const contact of to_be_updated) {
					await axios.post("https://api.getgist.com/contacts", contact, { headers }).then(r => { console.log(`${contact.email} updated`) }).catch(e => { console.log(`${contact.email} ERROR`) })
					count++
				}
				return `${count} users updated`
			}
		}
	},
	{
		url: "/api/onboarding",
		method: ["POST"],
		handler: async (req, rep) => {
			const email = req?.body?.form_data?.email
			const msg = email ? ` (From: ${email})` : ''
			const form_title = `<i><u>Chartmat Onboarding${msg}:</u></i>\n\n`
			const form_data = Object.entries(req.body.form_data).map(entry => `<b>${entry[0]}</b>:\n${entry[1]}`).join("\n\n")
			await sendTelegram(`${form_title}\n\n${form_data}`)
			return 'done'
		}
	},

	{
		url: "/api/templates",
		method: ["GET"],
		preHandler: [],
		handler: async (req, rep) => {
			const extras = {
				"task-manager": {
					description: "Task Manager",
					icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
				},
				"company-feedback": {
					description: "Company wide Feedback",
					icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
				},
				"time-tracker": {
					description: "Use this template to track your working hours, freelance projects or anything else",
					icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
				},
				"daily-budget": {
					description: "Use this template to track your expenses. Comparing different suppliers and vendors.",
					icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
				},
				"work-location": {
					description: "Use this template to track who in the company works from where. Ideal to avoid overcrowded spaces",
					icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
				},
				"paypal-shop": {
					description: "Use this template to create a small shop using paypal.me links. You can also switch to stripe links",
					icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
				},
				"company-dashboard": {
					description: "Use this template to display important company metrics & information on a screen. Turn on full screen and ideally locate the monitor at a visible place for employees.",
					icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
				},
				"split-expenses": {
					description: "Use this template to split expenses based on who paid for an item and who participated in the consumption. Review total balances at the end of your trip or event.",
					icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
				},
				"restaurant-menu": {
					description: "Use this template to update and share your restaurant menu. Combine share the link using a QR code and provide a contactless menu for your customers. Ideally with your logo and domain to maintain brand awareness.",
					icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
				},
				"travel-reimbursement": {
					description: "Use this template to record travel expenses such as gas or restaurant bills. Attach images through the form and display the expense summary to the line manager.",
					icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				},
				"job-board": {
					description: "Use this template to create a small job board and receive CV files as PDF directly in a spreadsheet from which you can track job applications. Eventually you could expand it with application metrics.",
					icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
				},
				"stock-market": {
					description: "Use this template to track a portfolio. It's automatically updated using Google Finance data",
					icon: "M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z"
				},
				"seo-metadata": {
					description: "Use this template to monitor how your website looks like on search engines. It automatically fetches new pages and shows relevant errors",
					icon: "M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				},
				"csv-import": {
					description: "This is an example of how you can easily build a dashboard from a CSV file. We use daily updated Covid-19 CSV reports.",
					icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				},
				"support-schedule": {
					hidden: true,
					description: "Use this template to track shifts and monitor who needs to work on what.",
					icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
				},
				"project-status": {
					hidden: true,
					icon: "M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
				},
				"portfolio": {
					hidden: true,
					description: "",
					icon: "M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
				},
				"business-presence": {
					description: "Build a small website to show your opening hours, accept bookings and display your inventory",
					icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
				},
				"directory": {
					description: "Build a simply directory with Chartmat using the grid block or using the markdown block.",
					icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
				},
				"statistical-data": {
					description: "This Board shows you how you can display statistical data with Chartmat.",
					icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
				},
				"employee-survey": {
					description: "Conduct an employee survey in your business and visualize the results. All within the comfort of Chartmat.",
					icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				},
				"golf-school": {
					description: "Learn how to show different data to different users using filters.",
					icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
				},
				"e-commerce-shop": {
					description: "Build a small store using Stripe payment links",
					icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
				},
				"landing-page": {
					description: "Build a small landing page powered by Google Sheets",
					icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
				},
				"consulting": {
					description: "Internal dashboard for a consulting company",
					icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
				},
				"blank": {
					icon: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				}
			}
			const workspace = await db.get_id("workspaces", process.env.CHARTMAT_TEMPLATE_WORKSPACE_ID)
			const boards = await db.get_many(`workspaces/${process.env.CHARTMAT_TEMPLATE_WORKSPACE_ID}/boards`).filter(b => b.public)
			const templates = boards.map(b => ({
				id: b.id,
				description: extras[b.path]?.description,
				icon: extras[b.path]?.icon,
				title: b.title,
				name: b.name,
				path: b.path,
				spreadsheetId: b.spreadsheetId,
				template_image: b.template_image,
				cover_color: b.cover_color,
				featured: b.featured,
				link: `https://docs.google.com/spreadsheets/d/${b.spreadsheetId}`
			})).filter(t => !extras[t.path]?.hidden)
		
			if (process.env.IS_LOCAL) {
				const fs = require('fs');
				const path = `./assets/files/templates.json`
				fs.writeFile(path, JSON.stringify(templates), function (err) {
					if (err) {
						console.log(err);
					}
				});
				console.log(`Replaced static file at path: ${path}`)
			}
			return templates
		}
	},

	{
		url: "/api/getENV/:name",
		method: ["GET"],
		preHandler: [],
		handler: async (req, rep) => {
			rep.setHeader('Access-Control-Allow-Origin', '*'); // Allows all origins
			rep.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
			rep.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

			if (req.method === 'OPTIONS') {
				return rep.status(200).end();
			}
			  
		  const { name } = req.params;
	  
		  // Fetch the environment variable value by its name
		  const envVarValue = process.env[name];
	  
		  if (envVarValue) {
			return envVarValue;
		  } else {
			rep.status(404).send({ error: "Environment variable not found" });
		  }
		}
	}
]

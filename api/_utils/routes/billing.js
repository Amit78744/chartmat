
const db = require("../db.js")
const { validate_email, set_user_or_null, get_or_create_user, sendTelegram, short_login_url, sendEmail } = require("../commons.js")
const axios = require("axios")
const jwt = require("jsonwebtoken");
const { LIFETIME_PLAN, CHARTMAT_LIFETIME_PLAN } = require("../const.js");
const no_undefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

const billing = module.exports = [

	{
		url: "/api/billing/appsumo/token",
		method: ["POST"],
		preHandler: [],
		handler: async (req) => {
			if (process.env.APPSUMO_USERNAME_PASSWORD !== `${req?.body.username}_${req?.body.password}`) {
				throw new Error("401::Username or password are wrong")
			}
			const appsumo_jwt = jwt.sign({ data: { now: db.timestamp_sc() } }, process.env.APPSUMO_JWT_SECRET, { expiresIn: '10m' })
			return { "access": appsumo_jwt }
		}
	},

	{
		url: "/api/billing/appsumo",
		method: ["POST"],
		preHandler: [],
		handler: async (req, rep) => {

			const body = req.body

			// validate incoming coupons and determine plan
			if (body.action == 'activate') {
				const coupons = await db.get_many_ids(process.env.CHARTMAT_ACTIVE_CAMPAIGN_COLLECTION, body.appsumo_code)
				if (coupons.length == 0 ||
					coupons.length > 5 ||
					(coupons.length != body.appsumo_code.length) ||
					(coupons.some(c => c.claimed))) {
					return { status: "error", msg: "Invalid AppSumo code(s)." }
				}

				const profile = {
					appsumo_code: body.appsumo_code,
					email: validate_email(body.email),
					lifetime_campaign: process.env.CHARTMAT_ACTIVE_CAMPAIGN_COLLECTION,
					plan: LIFETIME_PLAN[coupons.length - 1].plan,
					plan_limits: {
						allowed_workspaces: LIFETIME_PLAN[coupons.length - 1].allowed_workspaces,
						allowed_user_per_workspace: LIFETIME_PLAN[coupons.length - 1].allowed_user_per_workspace
					}
				}

				const [user, created] = await get_or_create_user(profile.email)
				if (user.plan) {
					throw new Error(`400::This email address is already linked to another account. Please use a different email address to activate this license.`)
				}
				// Mark coupons used
				for (const c of coupons) {
					await db.update_one(process.env.CHARTMAT_ACTIVE_CAMPAIGN_COLLECTION,
						c.appsumo_code,
						{ claimed_by: user.id, claimed: true, claimed_at: Date.now().valueOf() })
				}
				await db.update_one("users", user.id, profile)
				// return profile
				console.log(user)
				const [tokenUrl, token] = short_login_url(profile.email, `http://${process.env.CHARTMAT_BOARD_BASE_URL}/dashboard/auth`)
				if (process.env.IS_LOCAL === "true") {
					console.log('\x1b[36m', `In production we would email: ${profile.email} the link:`, '\x1b[32m', `${tokenUrl}`, '\x1b[0m');
					return { email_sent: true }
				}
				else {
					const email_config = { action_url: tokenUrl }

					const email_sent = await sendEmail(profile.email, "login", email_config)
					return { email_sent: email_sent }
				}
			}
			else if (body.action == 'upgrade') {
				const coupon = await db.get_id(process.env.CHARTMAT_ACTIVE_CAMPAIGN_COLLECTION, body.appsumo_code)
				if (!coupon || coupon.claimed) {
					return { status: "error", msg: "Invalid AppSumo code." }
				}

				let user = await db.get_one("users", ['email', '==', body.email])
				if (!user) {
					return { status: "error", msg: "Something went wrong please try again." }
				}
				user.appsumo_code.push(coupon.appsumo_code)

				if (user.appsumo_code.length > 5) {
					return { status: "error", msg: "You already have upgraded to highest plan available." }
				}
				const profile = {
					appsumo_code: user.appsumo_code,
					plan: LIFETIME_PLAN[user.appsumo_code.length - 1].plan,
					plan_limits: {
						allowed_workspaces: LIFETIME_PLAN[user.appsumo_code.length - 1].allowed_workspaces,
						allowed_user_per_workspace: LIFETIME_PLAN[user.appsumo_code.length - 1].allowed_user_per_workspace
					}
				}
				// Mark coupons used
				await db.update_one(process.env.CHARTMAT_ACTIVE_CAMPAIGN_COLLECTION,
					coupon.appsumo_code,
					{ claimed_by: user.id, claimed: true, claimed_at: Date.now().valueOf() })
				await db.update_one("users", user.id, profile)

				return {
					status: "success", msg: "product upgraded"
				}
			}

		}

	},

	// {
	// 	url: "/api/billing/appsumo",
	// 	method: ["POST"],
	// 	preHandler: [],
	// 	handler: async (req, rep) => {
	// 		let token = req?.headers?.authorization.substr(7)
	// 		jwt.verify(token, process.env.APPSUMO_JWT_SECRET, (error) => {
	// 			if (error) {
	// 				throw new Error(`401::${error.name}: ${error.message}`)
	// 			}
	// 		})
	// 		const body = req.body
	// 		const profile = { plan: body.plan_id, uuid: body.uuid, email: validate_email(body.activation_email), invoice_item_uuid: body.invoice_item_uuid }

	// 		if (body.action === "activate") {
	// 			const [user, created] = await get_or_create_user(profile.email)
	// 			if (user.uuid) {
	// 				throw new Error(`400::This email address is already linked to another account. Please use a different email address to activate this license.`)
	// 			}
	// 			await db.update_one("users", user.id, profile)
	// 			rep.statusCode = 201
	// 			return {
	// 				message: "product activated",
	// 				redirect_url: `https://${process.env.CHARTMAT_BOARD_BASE_URL}/auth?email=${profile.email}`
	// 			}
	// 		}

	// 		else { // Update an existing user (Upgrade, Downgrade, ETC)
	// 			if (body.action === "refund") {
	// 				profile.plan = "free"
	// 			}
	// 			const existing_user = await db.get_one("users", ["uuid", "==", profile.uuid])
	// 			if (!existing_user) {
	// 				throw new Error(`400::A user with the uuid of ${profile.uuid} could not be found. Yet the request.action is ${body.action}`)
	// 			}
	// 			await db.update_one("users", existing_user.id, no_undefined(profile))
	// 			return { message: `${body.action} completed successfully. Thanks!` }
	// 		}

	// 	}
	// },

	// delete publisher
	{
		url: "/api/delete/publisher",
		method: ["GET",],
		preHandler: [set_user_or_null],
		handler: async (req) => {
			let accounts = [req.query['account_id']]

			for (const acc of accounts) {
				try {
					const stripe = axios.create({
						"baseURL": 'https://api.stripe.com/v1',
						headers: {
							"Authorization": `Bearer ${process.env.CHARTMAT_STRIPE_PRIVATE_KEY}`,
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					})

					let account = await stripe.delete(`/accounts/${acc}`)
					console.log(account.data)
				} catch (e) {
					console.log(`billing.js - api/delete/publisher`)
					return console.error(e.toString())
				}
			}
			return
		}
	},

	// create & onboard publisher
	{
		url: "/api/publisher",
		method: ["GET",],
		preHandler: [set_user_or_null],
		handler: async (req) => {

			try {
				const stripe = axios.create({
					"baseURL": 'https://api.stripe.com/v1',
					headers: {
						"Authorization": `Bearer ${process.env.CHARTMAT_STRIPE_PRIVATE_KEY}`,
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				})
				let account_id = req.query["account_id"]
				console.log(account_id)
				if (!account_id) {
					let account_create_data = [
						`country=US`,
						`type=express`,
						`capabilities[card_payments][requested]=true`,
						`capabilities[transfers][requested]=true`,
						`business_type=individual`,
						`metadata["chartmat_user_id"]=${req.user.id}`,
					]
					let account = await stripe.post("/accounts", account_create_data.join("&")).catch(e => console.error(e.response.data))
					account_id = account.data.id;
					await db.update_one('users', req.user.id, { "stripe_account": account.data })
				}
				let onboarding_data = [
					`account=${account_id}`,
					`type=account_onboarding`,
					`return_url=https://www.chartmat.app/dashboard/account`,
					`refresh_url=https://www.chartmat.app/dashboard/account`,
				]
				let link = await stripe.post("/account_links", onboarding_data.join("&"))
				return link.data
			} catch (e) {
				console.log(`billing.js - api/publisher/ -${e}`)
				return console.error(e)
			}
		}
	},

	//  purchase publisher template 
	{
		url: "/api/purchase/template",
		method: ["GET"],
		preHandler: [set_user_or_null],
		handler: async (req, res) => {
			try {
				const catalog_id = req.query["catalog_id"]
				const template_to_purchase = await db.get_id("marketplace_catalog", catalog_id)

				// check if not already purchased by the user
				const purchase_order = await db.get_one_double_filter("marketplace_orders",
					["catalog_id", "==", catalog_id],
					["client_reference_id", "==", req.user.id],
				)
				if (purchase_order) {
					if (purchase_order.status == "open") {
						return { url: purchase_order.url }
					} else if (purchase_order.status == "complete") {
						res.statusCode = 400
						return res.send("Template is already purchased.")
						// throw new Error("Template is already purchased.")
					}
				}

				if (template_to_purchase.price > 0) {
					// stripe_account stands for publisher account
					const user = await db.get_id("users", template_to_purchase.user_id)
					const stripe_account_id = user.stripe_account?.id
					if (!stripe_account_id || !user.stripe_account?.details_submitted || !user.stripe_account?.charges_enabled) {
						res.statusCode = 400
						return res.send("Publisher account not active.")
					}
					const stripe = axios.create({
						"baseURL": 'https://api.stripe.com/v1',
						headers: {
							"Authorization": `Bearer ${process.env.CHARTMAT_STRIPE_PRIVATE_KEY}`,
							'Content-Type': 'application/x-www-form-urlencoded',
							'Stripe-Account': stripe_account_id,
						}
					})
					const template_seller_price = parseFloat(template_to_purchase.price) * 100;
					const chartmat_share = Math.round(parseFloat(process.env.CHARTMAT_PLATFORM_FEE_PERCENTS / 100) * template_seller_price);

					console.log(template_seller_price, chartmat_share);

					let data = [
						"payment_method_types[0]=card",
						`success_url=https://${process.env.CHARTMAT_BOARD_BASE_URL}/payment_success`,
						`cancel_url=https://${process.env.CHARTMAT_BOARD_BASE_URL}/payment_fail`,
						`line_items[0][name]=${template_to_purchase.name}`,
						`line_items[0][description]=${template_to_purchase.description}`,
						`line_items[0][amount]=${template_seller_price}`,
						`line_items[0][quantity]=1`,
						`line_items[0][currency]=usd`,
						`line_items[0][images][]=${encodeURIComponent(template_to_purchase.thumbnail)}`,
						`allow_promotion_codes=true`,
						'mode=payment',
						`payment_intent_data[application_fee_amount]=${chartmat_share}`,
						'invoice_creation[enabled]=true',
						`customer_email=${encodeURIComponent(req.user.email)}`,
						`client_reference_id=${req.user.id}`,
					]
					let link = await stripe.post("/checkout/sessions", data.join("&"))
					// saving checkout session details
					await db.create_or_update("marketplace_orders", link.data?.id, { ...link.data, catalog_id })
					return link.data
				}
				await db.create_or_update("marketplace_orders", `free_${catalog_id}_${req.user.id}`,
					{
						client_reference_id: req.user.id,
						customer_email: req.user.email,
						name:template_to_purchase.name,
						status:"complete",
						catalog_id
					})
				return 	{
					client_reference_id: req.user.id,
					customer_email: req.user.email,
					name:template_to_purchase.name,
					status:"complete",
					catalog_id
				}
				
			} catch (e) {
				console.log(`billing.js - api/purchase/template -${e.toString()}`)
				res.statusCode = 400
				return res.send("Could not make request to purchase template.")
			}
		}
	},

	// publisher webhook endpoint
	{
		url: "/api/webhook/publisher",
		method: ["GET", "POST", "PUT", "DELETE"],
		handler: async (req) => {
			const { method, body } = req
			const event = body

			try {
				// Handle the event
				switch (event.type) {
					case 'account.updated':
						const accountUpdated = event.data.object;
						const user = await db.get_one("users", ["stripe_account.id", "==", accountUpdated.id])
						await db.update_one('users', user.id, { "stripe_account": accountUpdated })
						break;

					// checkout.session.completed
					case 'checkout.session.completed':
						const checkoutObject = event.data.object;
						await db.update_one('marketplace_orders', checkoutObject.id, checkoutObject)
						break;

					default:
						console.log(`Unhandled event type ${event.type}`);
				}

			} catch (e) {
				console.error(`billing.js - api/publisher/ -${e}`)
				return console.error(e)
			}
		}
	},


	{
		url: "/api/billing",
		method: ["POST", "PUT", "PATCH"],
		preHandler: [set_user_or_null],
		handler: async (req) => {
			// Stripe Billing
			const { method, body } = req

			const all_plans = {
				prod: {
					lite_monthly: "price_1M5UPaBLRNpnDpeL7YL7ng7c",
					lite_yearly: "price_1M5UPZBLRNpnDpeLhhrKW5bB",
					pro_monthly: "price_1LQXyzBLRNpnDpeL4rk4LzZW",
					pro_yearly: "price_1M5UWQBLRNpnDpeLpJiCJB00",
					business_monthly: "price_1LQXzGBLRNpnDpeLCpTLcMI2",
					business_yearly: "price_1M5UYUBLRNpnDpeLNX9LXk7v",

					lite_lifetime: "price_1NECD9BLRNpnDpeLrS0964MS",
					pro_lifetime: "price_1NECGABLRNpnDpeL2ocXgc3b",
					proplus_lifetime: "price_1NECtSBLRNpnDpeLnxzLAyIa",
					promax_lifetime: "price_1NEEyyBLRNpnDpeLut3zTTzp",
					enterprise_lifetime: "price_1NEEziBLRNpnDpeLodfAcChg",


				},
				dev: {
					lite_monthly: "price_1M2SnaBLRNpnDpeLk4w7Xxdc",
					lite_yearly: "price_1M2SnaBLRNpnDpeLbhhlynSq",
					pro_monthly: "price_1M3bsdBLRNpnDpeL0iN3zR7Z",
					pro_yearly: "price_1M3bsdBLRNpnDpeLnmPclCNt",
					business_monthly: "price_1M3btcBLRNpnDpeLs3padUgx",
					business_yearly: "price_1M3btcBLRNpnDpeLM9jYLuRR",

					// lifetime 
					lite_lifetime: "price_1NC4gWBLRNpnDpeLVEioCEyy",
					pro_lifetime: "price_1NCIwUBLRNpnDpeLNwV3ZHWV",
					proplus_lifetime: "price_1NCIx5BLRNpnDpeLeacXe3lW",
					promax_lifetime: "price_1NCJDFBLRNpnDpeLssejmzYX",
					enterprise_lifetime: "price_1NCJECBLRNpnDpeLfcFJS65h",
				}
			}
			const plans = process.env.NODE_ENV === "production" ? all_plans.prod : all_plans.dev

			if (method === "POST") { // Used by stripe to update users
				console.log(JSON.stringify(body.data))
				const stripe = body?.data?.object

				if (!stripe) {
					if (body.cancel_url) { // It's PADDLE
						return "Done thanks"
					}
					throw new Error("400::This Stripe request is malformed.")
				}
				const with_undefined_billing = {
					stripe_customer: stripe.customer,
					stripe_subscription: stripe.subscription,
					stripe_price_id: stripe?.items?.data?.[0]?.price?.id || stripe?.lines?.data?.[0]?.price?.id,
					stripe_cancel_at: stripe.cancel_at,
					stripe_status: stripe.status,
					stripe_current_period_end: stripe.current_period_end,
				}

				const flipped_plans = Object.entries(plans).reduce((acc, [key, value]) => (acc[value] = key, acc), {})
				with_undefined_billing.plan = flipped_plans[with_undefined_billing.stripe_price_id]?.split("_")[0]
				const duration = flipped_plans[with_undefined_billing.stripe_price_id]?.split("_")[1]
				const plan_key = flipped_plans[with_undefined_billing.stripe_price_id]
				// duration is lifetime, get the data from lifetime plan
				if (duration == "lifetime") {
					with_undefined_billing.lifetime_campaign = process.env.CHARTMAT_NATIVE_LIFETIME_DEAL_CAMPAIGN;
					with_undefined_billing.plan_limits = {
						allowed_workspaces: CHARTMAT_LIFETIME_PLAN[plan_key]?.allowed_workspaces,
						allowed_user_per_workspace: CHARTMAT_LIFETIME_PLAN[plan_key]?.allowed_user_per_workspace
					}
				}
				const billing = no_undefined(with_undefined_billing)

				if (body.type === "customer.subscription.updated" ||
					body.type === "customer.subscription.created" ||
					body.type === "customer.subscription.deleted"
				) {
					const user = await db.get_one("users", ["stripe_customer", "==", stripe.customer])
					if (!user) {
						throw new Error("400::We can't update this customer because we didn't find it in the database")
					}
					await db.update_one("users", user.id, billing)
					await sendTelegram(`${user.email} updated Stripe. Status is: ${with_undefined_billing.stripe_status} - Cancel at: ${with_undefined_billing.stripe_cancel_at || "N/A"}`)
				}

				else {
					// Strip email 
					const stripe_email = stripe.customer_details?.email || stripe.email || stripe.customer_email
					const email = validate_email(stripe_email)
					const [user, created] = await get_or_create_user(email)
					await db.update_one("users", user.id, billing)
					await sendTelegram(`${stripe_email} started a trial via Stripe. Status is ${with_undefined_billing.stripe_status}`)
				}
				// Revert the below code
				// return "Customer updated"
				return JSON.stringify({ b: billing, p: flipped_plans, s: flipped_plans[with_undefined_billing.stripe_price_id] })
			}

			// new checkout session

			let user;
			if (body?.email) {
				user = await db.get_one('users', ['email', '==', body?.email]) //get_or_create_user(body?.email)
				if (body.startpage && user) {
					throw new Error("400::This email address is already linked to another existing account. Please use a different email address to activate this license.")
				}
			}

			const stripe = axios.create({
				"baseURL": 'https://api.stripe.com/v1',
				headers: {
					"Authorization": `Bearer ${process.env.CHARTMAT_STRIPE_PRIVATE_KEY}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})

			if (method === "PATCH") { // Create a new checkout session
				await sendTelegram(`${body?.email || 'UNKNOWN EMAIL'} is starting a new trial. Let's see if he pays... Affiliate id: ${body?.rewardful_referral || "NONE"} - Plan: ${plans[body?.plan_name || '']}`)
				let dbUser;

				const [user, created] = await get_or_create_user(body?.email)
				// user with life time campaign can not processed for further plan 
				// upgrade or subscription
				if (user.plan && user.lifetime_campaign) {
					throw new Error(`400::This email address is already linked to another account. Please use a different email address to activate this license.`)
				}

				if (req.user) {
					dbUser = await db.get_id("users", req.user.id)
					// First need to cancel the current plan. Then plan can be switched.
					// Not canceled plan can charge user for multiple subscription. 
					// Don't change below condition unless you know.
					if (dbUser.stripe_customer && dbUser.stripe_status !== 'canceled') {
						throw new Error(`400::You have a valid subscription please manage it at ${process.env.CHARTMAT_BOARD_BASE_URL}/dashboard/account`)
					}
				}
				let success_url = `https://${process.env.CHARTMAT_BOARD_BASE_URL}${req.user ? "/dashboard/account" : "/dashboard/auth"}`

				const success_params = []
				if (body.email && !req.user) {
					success_params.push(`email=${body.email}`)
				}

				if (body?.rewardful_referral) {
					success_params.push("affiliate=true")
				}
				if (success_params.length) {
					success_url += `?${success_params.join("&")}`
				}

				console.log(plans[body.plan_name], body.plan_name)
				const cancel_url = `https://${process.env.CHARTMAT_BOARD_BASE_URL}${req.user ? "/dashboard/account" : "/dashboard/start"}`// req.user ? `https://${process.env.CHARTMAT_BOARD_BASE_URL}/dashboard/account` : `https://${process.env.CHARTMAT_BOARD_BASE_URL}/dashboard/start`
				let data = [
					"payment_method_types[0]=card",
					`success_url=${encodeURIComponent(success_url)}`,
					`cancel_url=${cancel_url}`,
					`line_items[0][price]=${plans[body.plan_name]}`,
					`line_items[0][quantity]=1`,
					`allow_promotion_codes=true`,
					`metadata[referral]=${body?.rewardful_referral || null}`,
				]
				// only subscribe if not lifetime
				if (body.plan_name?.includes('lifetime')) {
					data.push('mode=payment')
					data.push(`invoice_creation[enabled]=true`)
					if (dbUser && dbUser.stripe_customer) {
						data.push(`customer=${dbUser.stripe_customer}`)
					} else if (req.user) {
						data.push(`client_reference_id=${req.user.id}`)
						data.push(`customer_email=${encodeURIComponent(req.user.email)}`)
					} else if (body.email) {
						data.push(`customer_email=${encodeURIComponent(body.email)}`)
					}
				} else {
					data.push('mode=subscription')
					data.push(`subscription_data[metadata][referral]=${body?.rewardful_referral || null}`)
					if (dbUser && dbUser.stripe_customer) {
						data.push(`customer=${dbUser.stripe_customer}`)
					} else if (req.user) {
						data.push(`subscription_data[trial_period_days]=14`)
						data.push(`client_reference_id=${req.user.id}`)
						data.push(`customer_email=${encodeURIComponent(req.user.email)}`)
					} else if (body.email) {
						data.push(`subscription_data[trial_period_days]=14`)
						data.push(`customer_email=${encodeURIComponent(body.email)}`)
					}
				}

				const session = await stripe.post("/checkout/sessions", data.join("&")).catch(e => console.error(e.response.data))
				return session.data.url
			}


			else if (method === "PUT") { // Show billing portal
				try {
					if (!req.user) {
						throw new Error("400::You need to be logged in to do this!")
					}

					const user = await db.get_id("users", req.user.id)
					const data = `customer=${user.stripe_customer}&return_url=https://${process.env.CHARTMAT_BOARD_BASE_URL}/dashboard/account`
					const portal = await stripe.post("/billing_portal/sessions", data).catch(e => console.log(e.response.data))
					return portal.data.url
				}
				catch (e) {
					console.error(e)
				}
			}
		}
	}
]
"use strict";
const awsLambdaFastify = require('@fastify/aws-lambda')
const fastify = require('fastify')
const Sentry = require("@sentry/node");
const cors = require('@fastify/cors');

const app = fastify({
	ignoreTrailingSlash: false,
	caseSensitive:false,
	ajv: {
		customOptions: {
			removeAdditional: 'all',
			useDefaults: true,
			coerceTypes: true,
			allErrors: false,
			nullable: true
		}
	} 
})

// Register CORS plugin
app.register(cors, {
	origin: '*', // You can restrict this to specific origins if needed
	methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true
});

// Constants
const isProd = process.env.NODE_ENV === "production"

// Swagger
if (!isProd) {
	// app.register(require('@fastify/swagger'), { // For Swagger DOCS
	// 	routePrefix: '/api/docs',
	// 	swagger: {
	// 	info: {
	// 		title: 'Chartmat Backend API Documentation',
	// 		description: 'Backend routes for the Chartmat API',
	// 		version: '1.0.0'
	// 	},
	// 	schemes: isProd ? ['https'] : ["http"],
	// 	consumes: ['application/json'],
	// 	produces: ['application/json']
	// 	},
	// 	exposeRoute: !isProd
	// })
}

// HELMET SECURITY HEADER
app.register(require('@fastify/helmet'), {
	frameguard:false
})

// Rate limiting 
app.register(require('@fastify/rate-limit'), {
	max: 120,
	ban:3,
	timeWindow: 60000 // '1 minute'
})

// Accept form files
app.register(require('@fastify/multipart'), {
	limits: { files: 1 }
})

// Accept form webhooks (AppSumo)
app.register(require('@fastify/formbody'))


// Set Caching Headers for ALL non-auth requests (Used by Vercel)
app.addHook('onSend', async (req, reply, payload) => {
	if (!req.headers.authorization) {
		reply.headers({
			'Cache-Control':'no-cache'
			// 'Cache-Control': 's-maxage=600, stale-while-revalidate'
		})
	}
	return payload
})

// Error Handler
app.setErrorHandler(async (error, req, reply) => {
	let error_code = 500;
	let error_message = "Sorry there has been a server error.."

	if (error.validation){
		reply.status(406)
		const uniques_validation_errors = [ ...new Set(error.validation.map(val => `${val.dataPath} ${val.message} (${JSON.stringify(val.params)})`)) ]
		error_message = uniques_validation_errors.join(" && ")
		error_code = 400
	}
	else {
		const code_and_message = error.message.split("::")
		error_code = code_and_message.length > 1 ? code_and_message[0] : 500
		error_message = code_and_message.length > 1 ? code_and_message[1] : error_message
	}
	
	console.log("\x1b[31m",`Error: ${error}`, "\x1b[0m")

	if (isProd) {
		Sentry.init({ dsn: process.env.CHARTMAT_SENTRY_BACKEND_DSN })
		Sentry.captureException(error);
		await Sentry.flush(2000);
	}

	reply.status(error_code)
	throw new Error(error_message)
})

// Decorate req (https://github.com/fastify/fastify/issues/1555)
app.decorateRequest('user', null)
app.decorateRequest('board', null)

for (const folder_routes of ['billing', 'main', 'auth', 'boards', 'admin']){
	for (const route of require(`./_utils/routes/${folder_routes}.js`)){
		app.route(route)
	}
}

 /// SERVER ///
  
if (require.main === module) {
	// called directly i.e. "node app"
	app.listen({ port: 3030 })
	// app.listen(3030, (err) => {
	//   if (err) console.error(err)
	//   console.log(`server listening on 3030`)
	// })
  } else {
	// required as a module => executed on aws lambda
	exports.handler = awsLambdaFastify(app, {serializeLambdaArguments: false, callbackWaitsForEmptyEventLoop:false})
}

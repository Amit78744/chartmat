const isProd = process.env.NODE_ENV === "production"
const useProxy = process.env.IS_LOCAL === "true"

export default {
	ssr: false,
	telemetry: false,
	components: true,
	pageTransition: 'fade',
	serverMiddleware: [
		{ path: '/api/secure-data', handler: '~/middleware/secure-data.js' }
	  ],
	publicRuntimeConfig: {  // Available in the frontend with $config
		CHARTMAT_BASE_URL: process.env.CHARTMAT_BASE_URL,
		CHARTMAT_STATIC_FORMS: "2354714e-444c-4a6e-b38f-868df2f9dfb7",
	},
	privateRuntimeConfig: {
		CHARTMAT_BOARD_BASE_URL: process.env.CHARTMAT_BOARD_BASE_URL,
		CHARTMAT_STRIPE_PRIVATE_KEY: process.env.CHARTMAT_STRIPE_PRIVATE_KEY,
		BEANSTALK_ENDPOINT: process.env.BEANSTALK_ENDPOINT,
		CHARTMAT_GOOGLE_PICKER_API_KEY: process.env.CHARTMAT_GOOGLE_PICKER_API_KEY,
		CHARTMAT_GOOGLE_APP_ID: process.env.CHARTMAT_GOOGLE_APP_ID,
		CHARTMAT_TEMPLATE_WORKSPACE_ID: process.env.CHARTMAT_TEMPLATE_WORKSPACE_ID,
		CHARTMAT_MAPBOX_AUTH_TOKEN: process.env.CHARTMAT_MAPBOX_AUTH_TOKEN,
		CHARTMAT_PLATFORM_FEE_PERCENTS: process.env.CHARTMAT_PLATFORM_FEE_PERCENTS,
	},
	head: {
		title: 'Chartmat',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ hid: 'description', name: 'description', content: 'Build great applications using Google Sheets' },
			{ hid: 'og:image', name: 'og:image', content: '/og-image.jpeg' }
		],
		link: [
			{ rel: 'icon', type: 'image/x-icon', href: '/chartmat-favicon.ico', hid: 'icon' },
			{
				rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.12.1/css/all.min.css',
			},
		],
		// script: [{ "src": "https://cdn.tailwindcss.com" }]
	},
	loading: { color: '#20B2AA' },
	css: [
		'~/node_modules/primeicons/primeicons.css',
		'~/node_modules/primevue/resources/primevue.min.css',
		'~/node_modules/v-markdown-editor/dist/v-markdown-editor.css',
		'~/assets/tailwind.css',
		'~/node_modules/primevue/resources/themes/lara-light-blue/theme.css',
		'~/node_modules/mapbox-gl/dist/mapbox-gl.css',
	],
	// tailwindcss: {
	// 	configPath: '~/tailwind.config.js',
	// 	cssPath: '~/assets/ail'ind,
	// 	purgeCSSInDev: false,
	// 	exposeConfig:false
	// },

	pwa: {
		icon: false,
		display: 'minimal-ui',
		manifest: {
			name: 'Chartmat',
			// start_url:`${process.env.CHARTMAT_BASE_URL}`
		}
	},
	plugins: [
		// { src: '~/plugins/ga.client.js', mode:'client'},
		{ src: '~/plugins/mapbox.client.js', mode: 'client' },
		{ src: '~/plugins/axios.client.js', mode: 'client' },
		{ src: '~/plugins/integrations.client.js', mode: 'client' },
		{ src: '~/plugins/pwa-updater.js', mode: 'client' },
		{ src: '~/plugins/shared.js' },
		{ src: '~/plugins/primevue.client.js', mode: 'client', ssr: false },
		{ src: '~/plugins/md-editor.js', mode: 'client', ssr: false },
	],
	modules: ['@nuxtjs/axios', "@nuxtjs/auth-next", "@nuxtjs/sentry", "vue-swatches/nuxt"],//, "@nuxt/content"],
	buildModules: ['@nuxt/postcss8', '@nuxtjs/proxy', '@nuxtjs/pwa'],
	axios: {
		progress: false,
		retry: { retries: 0 }
	},
	// All /API calls get proxied to the main app which runs on port 4000
	proxy: useProxy ? ['http://localhost:3030/api'] : false,
	sentry: {
		dsn: process.env.CHARTMAT_SENTRY_FRONTEND_DSN,
		// disableServerSide: true
	},
	router: {
		base: '/',
		trailingSlash: false,
		extendRoutes(routes, resolve) {
			routes.push({
				name: 'index',
				path: '/',
				component: resolve(__dirname, 'pages/_board_slug.vue')
			})
		}
	},
	auth: {
		cookie: false,
		strategies: {
			local: {
				endpoints: {
					login: { url: '/api/auth', method: 'post', propertyName: 'token', withCredentials: false },
					user: { url: '/api/auth', method: 'get', propertyName: false, withCredentials: true },
					logout: false
				}
			}
		},
		redirect: { login: "/dashboard/auth", logout: false, callback: false, home: false }
	},
	build: {
		terser: {
			terserOptions: {
				compress: {
					drop_console: isProd
				}
			}
		},
		postcss: {
			plugins: {
				'tailwindcss/nesting': {},
				tailwindcss: {},
				autoprefixer: {},
			},
		},
		extend(config, ctx) {
		},
		transpile: [/^primevue($|\/)/],
	},

	generate: {
		exclude: [
			/^\/api\// // path starts with /api/ - Otherwise they get generated and it return a 404
		]
	}
}

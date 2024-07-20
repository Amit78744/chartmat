// const colors = require('tailwindcss/colors')

// module.exports = {
// 	experimental: 'all',
// 	mode: 'jit',
// 	theme: {
// 		extend: {
// 		  colors: { ...colors }
// 		}
// 	},
// 	plugins: [require('@tailwindcss/typography')],
// 	purge: {
// 		enabled: process.env.NODE_ENV === "production",
// 		options: {
// 			safelist: ['loading'],
// 			whitelistPatterns: [/^grid-cols-/],
// 		}
// 	}
// }

module.exports = {
	mode: 'jit',
	content: [
	  "./components/**/*.{js,vue,ts}",
	  "./layouts/**/*.vue",
	  "./pages/**/*.vue",
	  "./plugins/**/*.{js,ts}",
	  "./nuxt.config.js",
	],
	theme: {
	  extend: {},
	},
	plugins: [require('@tailwindcss/typography')],
  }
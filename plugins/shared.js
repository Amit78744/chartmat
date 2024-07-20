import Vue from 'vue'

Vue.filter('noUnderscores', val => (val ?? '')
										.replace(/_/g, ' '))

Vue.filter('beautify', val => (val ?? '')
										.replace(/([A-Z])/g, (match) => ` ${match}`) // No Camel
										.replace(/[_,-]/g, ' ') // No Underscore or dash
										.trim())

Vue.mixin({
	methods: {
	    errorMsg (e) {
			console.log(e)
			let error = "There was an error. Please try again or reach out via chat"
			if (!e || !e.response){
				return error
			}
			if (((typeof e.response.data) == "object") && ("message" in e.response.data)){
				error = e.response.data.message
			} else {
				error = JSON.stringify(e.response.data)
			}
			return error
        },

		pick(obj, keys){
			return  Object.assign({}, ...keys.map(key => ({ [key]: obj[key] })))
		},

		ts_to_date(timestamp){
			return timestamp ? new Date(timestamp*1000).toLocaleTimeString([], {hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }) : null
		},

		random_id(){
			return `${new Date().getUTCMilliseconds().toString()}${Math.round((Math.random() * 36 ** 12)).toString(36)}`
		},

		gevent(event_name){
			const user_id = this.$auth?.user?.id
			try {
				if (user_id){
					this.$gtag.config("GA_MEASUREMENT_ID", {user_id:user_id})
				}
				this.$gtag.event(event_name)
			} catch(e){ }
		},

		isWhite(color="#ffffff"){
			const nThreshold = 105;
			const r = parseInt(color.substring(1, 3), 16)
			const g = parseInt(color.substring(3, 5), 16)
			const b = parseInt(color.substring(5, 7), 16)
			const bgDelta = (r * 0.299) + (g * 0.587) + (b * 0.114)
			return ((255 - bgDelta) > nThreshold)
		},

		logUser(){
			if (!this.$auth.loggedIn){
				return;
			}
			const email = this.$auth?.user?.email
			if (!email || !email.length>5){
				return;
			}
			const user_id = this.$auth.user.id

			if (this.$gtag) {
				this.$gtag.config("GA_MEASUREMENT_ID", {user_id:user_id})
				this.$gtag.event("login")
			}
			
			if (window.gist){
				gist.identify(user_id, {"email": email});
			}
			if (window.FS){
				FS.identify(user_id, {"email": email});
			}
			if (this.$sentry){
				this.$sentry.configureScope(scope => scope.setUser({id:user_id, "email": email}));
			}
		},

		async jwt_login(shortLifeToken, method, force_created){
			// Google calls the endpoint twice, once to save the token and once to login. So we use force_created to make sure created is correct
			const {data} = await this.$auth.loginWith('local', { data: { token: shortLifeToken } })
			this.gevent(`${method}_login`, {created:created})
			const created = data.created
			if (force_created || created){
				this.$router.push({path: "/dashboard", query: {} }) // {method:method}  })
			} else {
				this.$router.push({path: "/dashboard", query: {} })
			}
		}

	}
})
<template>
	<div class='max-w-3xl box-padding'>

		<script>
			(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');
		</script>
		<script async src='https://r.wdfl.co/rw.js' data-rewardful='ed7792'></script>

		<div v-show="loginStep == 4">
			Loading...
		</div>
		<div class="p-2 md:px-12 md:py-20">
			<div v-show="loginStep == 1">
				<div>
					<h1 class="text-2xl leading-8 font-extrabold text-gray-900 sm:text-3xl sm:leading-9">
						Login
					</h1>
					<p class="mt-3 text-lg leading-6 text-gray-700">
						Type your email to get a login link or login with Google
					</p>
				</div>
				<div class='pt-8'>
					<button @click="loginWithGoogle"
						class='bg-gray-50 border border-gray-200 text-black font-semibold py-3 px-4 rounded w-full inline-flex items-center justify-center hover:scale-110 transform duration-500'>
						<svg class='h-6 w-6 mr-3' xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48">
							<defs>
								<path id="a"
									d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
							</defs>
							<clipPath id="b">
								<use xlink:href="#a" overflow="visible" />
							</clipPath>
							<path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
							<path clip-path="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
							<path clip-path="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
							<path clip-path="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
						</svg>
						<span>Login with Google</span>
					</button>

					<form @submit.prevent="sendMagicLink" class="mt-8 grid gap-6 grid-cols-1 md:grid-cols-3">
						<div class=" md:col-span-2">
							<label class='sr-only' for="miele">Don't fill this</label>
							<input aria-label="miele" id="miele" class='hidden' style="display:none !important "
								label="Miele" tabindex="-1" autocomplete="off" v-model="miele" type="text" name="miele"
								placeholder="miele" />
							<label class='sr-only' for="email-address">Email Address</label>
							<input id="email-address" name="email" autocomplete="on" v-model="email"
								aria-label="Email address" required type="email"
								class="appearance-none w-full px-5 py-3 border border-gray-300 focus:border-emerald-400 text-base leading-6 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 transition duration-150 ease-in-out shadow-lg"
								placeholder="Type your email here" />
						</div>
						<button type="submit" :class="{ loading }"
							class="shadow-lg w-full flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:bg-emerald-400 transition duration-150 ease-in-out">
							Send Magic Link
						</button>
					</form>
				</div>
			</div>

			<div v-show="loginStep == 2">
				<div class='text-gray-900'>
					<svg class='w-24 h-24 fill-current' viewBox="0 0 24 24">
						<path
							d="M13 17H17V14L22 18.5L17 23V20H13V17M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H11V18H4V8L12 13L20 8V14H22V6A2 2 0 0 0 20 4M12 11L4 6H20Z" />
					</svg>
					<h2 class="text-4xl font-bold text-gray-900"> Email sent! </h2>
					<h3 class="text-xl mt-3 text-gray-800"> Click on the link in your <span
							class='text-emerald-500 font-semibold tracking-wide'>{{ email }}</span> inbox to login.</h3>
				</div>
			</div>

			<div v-show="loginStep == 3" class='text-gray-800'>
				<h2 class="text-4xl font-bold"> Logging you in... </h2>
				<h3 class="text-xl mt-3 text-gray-700"> One second... </h3>
			</div>
			<div class="small-error mt-10" v-if="error">{{ error }}</div>
		</div>
	</div>
</template>

<script>

export default {
	layout: "main",
	head() {
		return {
			title: "Chartmat Login"
		}
	},
	data() {
		return {
			loading: false,
			email: '',
			miele: '',
			error: null,
			verifyingEmail: false,
			loginStep: 4, // Can be 1, 2, 3 or 4
			query: {}
		}
	},
	async mounted() {
		const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');
		
		const local_storage_key = 'connecting_workspace_id'
		this.query = this.$route.query
		if (Object.keys(this.$route.query).length) {
			this.$router.replace({ 'query': {} })
		}
		const { error, affiliate, logout, token, email, returnURL, code, error_subtype, workspace_id, app_script } = this.query
		try {
			if (error) { // Always log errors...
				this.error = `error  - ${error_subtype}`
			}
			if (token) {
				this.convertToken(token)
			}
			else if (email) {
				this.email = email
				await this.sendMagicLink()
				if (affiliate) {
					rewardful('convert', { email: email })
				}
			} else if (app_script && workspace_id) {
				try {
					localStorage.setItem(local_storage_key, workspace_id);
					window.location.href = await this.$axios.$put("/api/auth/app_script", {}, { headers: { 'Content-Type': 'application/json' } })
				}
				catch (e) {
					alert(e.message)
				}
			}
			else if (workspace_id) {
				try {
					localStorage.setItem(local_storage_key, workspace_id);
					window.location.href = await this.$axios.$put("/api/auth/google", {}, { headers: { 'Content-Type': 'application/json' } })
				}
				catch (e) {
					alert(e.message)
				}
			}
			else if (code) {
				const workspace_id = localStorage.getItem(local_storage_key);
				localStorage.removeItem(local_storage_key);
				const resp = await this.$axios.$post("/api/auth/google", { code, workspace_id })
				const { created, token, subdomain } = resp
				if (token) {
					try {
						await this.jwt_login(token, 'google', created)
					} catch (e) {
						this.error = this.errorMsg(e)
					}
				}
				else {
					alert("Google has been successfully connected to your workspace")
					window.location.href = `//${subdomain}.${CHARTMAT_BOARD_BASE_URL}/admin`
				}
			}
			else if (logout) {
				this.logout()
			}
			else if (this.$auth.loggedIn) {
				if (returnURL) {
					this.loopedin(returnURL)
				} else {
					this.redirect_to_boards()
				}
			}
			else {
				this.loginStep = 1
			}
		} catch (e) {
			this.loginStep = 1
			this.error = this.errorMsg(e)
		}
	},
	methods: {
		async loopedin(returnURL) {
			const loppedInUrl = await this.$axios.$post(`/api/auth/loopedin`, { returnURL: returnURL })
			window.location.href = loppedInUrl
		},
		async loginWithGoogle() {
			await this.$axios.setToken(false)
			await this.$auth.logout()
			window.location.href = await this.$axios.$get("/api/auth/google")
		},
		async sendMagicLink() {
			this.error = null
			if (this.miele.length) {
				this.error = "Bots not allowed!";
				return;
			}
			const valid = /\S+@\S+\.\S+/.test(this.email)
			if (!valid) {
				this.error = `${this.email} is not a valid email address`
				return;
			}
			const email = this.email
			this.loading = true
			await this.$axios.post('/api/auth', {
				email: email,
				base_url: process.client ? window?.location?.origin : null
			})
				.then(r => {
					this.loginStep = 2
				})
				.catch(e => {
					this.error = this.errorMsg(e)
					this.loginStep = 1
				})
			this.loading = false
			this.step = 2
		},
		redirect_to_boards() {
			this.$router.push({ path: "/dashboard", query: {} })
		},
		async convertToken(shortLifeToken) {
			this.error = null
			this.loginStep = 3
			try {
				await this.jwt_login(shortLifeToken, 'email')
			} catch (e) {
				this.loginStep = 1
				this.error = this.errorMsg(e)
			}
		},

		async logout() {
			await this.$axios.setToken(false)
			await this.$auth.logout()
			if (this.$sentry) {
				this.$sentry.configureScope(scope => scope.setUser(null));
			}
			this.loginStep = 1
			// window.location.href = this.$route.query.next || "/"
		}
	}
}
</script>

<style></style>

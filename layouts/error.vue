<template>
<div class="error h-screen rounded-none border-8 bg-gray-200" :class="{'border-dashed border-red-600 overflow-y-auto':is404}">
		<div class='p-4 mx-auto my-auto max-w-md'>
			<h1 class="font-bold text-6xl text-red-600">{{error.statusCode}}</h1>
			<h2 class="text-xl text-gray-900"> {{is404 ? "Page not found" :"An error occurred"}} </h2>

			<div class='text-red-600 my-4'> {{errorMessage}} </div>

			<a class='btn btn-red mb-2' v-if="is404" href="/">Go to the homepage</a>
			<a v-else class='btn btn-indigo mb-2' @click="$router.go()">Refresh this page</a>
		</div>
</div>
</template>
<script>
export default {
	props: ['error'],
	mounted(){
		this.logUser()
		this.$sentry.captureException(new Error(`${this.error.statusCode}: ${this.errorMessage}`))
	},
	computed:{
		is404(){
			return this.error.statusCode === 404
		},
		errorMessage(){
			return this.errorMsg(this.error)
		}
	}
}
</script>

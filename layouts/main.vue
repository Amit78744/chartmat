<template>
<div class='min-h-screen bg-slate-200'>
	<navBar></navBar>
	<div class='p-2 sm:p-6 -mt-32'>
		<div class='flex min-h-[70vh] bg-white shadow-lg rounded overflow-hidden'>
			<nuxt />
		</div>
	</div>
</div>
</template>

<script>
export default {
	async mounted(){
		const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');

		if (window.location.host !== CHARTMAT_BOARD_BASE_URL){
			window.location.href = `//${CHARTMAT_BOARD_BASE_URL}${window.location.pathname}`
		}
		this.logUser()
	}
}
</script>

<style>

</style>
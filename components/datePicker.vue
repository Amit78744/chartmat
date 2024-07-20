<template>
	<input ref="picker" class='w-full bg-transparent'>
</template>
<script>
import flatpickr from "flatpickr";
export default {
	props: ['dates'],
	mounted(){
		flatpickr(this.$refs.picker, {
			mode: "range",
			altFormat:"U",
			defaultDate: (this.dates instanceof Array) ? this.dates : null,
			onClose:(dates) => this.changeDates(dates)
		});
	},
	methods:{
		changeDates(dates){
			const timestamps = dates.map(date => +new Date(date))
			this.$emit("change", timestamps)
		}
	}
}
</script>

<style>
@import 'flatpickr/dist/flatpickr.css';
</style>
<template>
	<div class='p-5' :style="`color:${block.font_color}`">
        <div class='block w-full' v-html="block.iframe">
		</div>
	</div>
</template>

<script>
export default {
	props:{
		block:{
			type:Object
		},
		json:{

		},
		columns:{
			default:[]
		}
	},
	computed:{
		customClasses(){
			const columns = `md:grid-cols-${this.block.columns}`
			const gap = `gap-${this.block.gap}`
			return `${columns} ${gap}`
		}
	}
}
</script>

<style>

</style>
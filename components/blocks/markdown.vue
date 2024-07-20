<template>
	<div class='p-5' :style="`color:${block.font_color}`">
		<div v-if="!block.loop">
			<mrk2html :markdown="replaceMrk(block.markdown, json[0])"></mrk2html>
		</div>
		<div v-else class='grid grid-cols-1' 
		:class="{
			'sm:grid-cols-2':block.columns == 2,
			'sm:grid-cols-3':block.columns == 3,
			'sm:grid-cols-4':block.columns == 4,
			'gap-0':block.gap == 0,
			'gap-3':block.gap == 3,
			'gap-6':block.gap == 6,
			'gap-10':block.gap == 10
		}"
		>
			<div v-for="(row, row_index) in json" :key="row_index">
				<div class='block'>
					<mrk2html :markdown="replaceMrk(block.markdown, row)"></mrk2html>
				</div>
			</div>
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
	},
	methods:{
		replaceMrk(text, row={}){
			for (const column of this.columns) {
				const value = row[column] ?? ''
				text = text.replaceAll(`([${column}])`, value )	
			}
		
			return text
		}
	}
}
</script>

<style>

</style>
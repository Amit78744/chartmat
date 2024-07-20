<template>
  <div class='max-w-2xl p-6'>
	  <h1 class='text-2xl font-bold mb-6'>Embed your entire board or a selected block:</h1>
	  <div class='' v-show="isPublic">
		  <div class='space-y-6'>
			<div class='space-y-1 mt-3'>
				<div>
					<input v-model="embed" type="radio" id="board" name="embed" value="board">
					<label for="board">Embed the entire board</label>
				</div>
				<div>
					<input v-model="embed" type="radio" id="section" name="embed" value="section">
					<label for="section">Embed a specific section</label>
				</div>
				<div>
					<input v-model="embed" type="radio" id="block" name="embed" value="block">
					<label for="block">Embed a specific block</label>
				</div>
			</div>

			<div v-show="embed==='section'">
				<p class='font-bold mb-1'>Select the section you want to embed</p>
				<div v-if="!sections_array.length" class='small-error mt-6'>You don't have sections in the board!</div>
				<select v-else v-model="section" class='my-form max-w-md'>
					<option v-for="section in sections_array" :key="section">{{section}}</option>
				</select>
			</div>

			<div v-show="embed==='block'">
				<p class='font-bold mb-1'>Select the block you want to embed</p>
				<div v-if="!blocks.length" class='small-error mt-6'>You don't have blocks in the board!</div>
				<select v-else v-model="block_id" class='my-form max-w-md'>
					<option v-for="(block, index) in blocks" :key="block.id" :value="block.id">{{block.title || `Block ${index+1}`}}</option>
				</select>
			</div>


			<div>
				<label>
					<input type="checkbox"  v-model=full_screen>
					Full Screen Embed
				</label>
				<p class='text-xs text-gray-400'>Make the embed take the full screen height and width</p>
			</div>

			<div class='flex flex-wrap gap-4' v-show="!full_screen">
				<label class='font-bold'>
					Height:
					<input class='my-form' type="number" v-model=height>
				</label>
				
				<label class='font-bold'>
					Width:
					<input class='my-form' type="number" v-model=width>
				</label>
			</div>

			<div class='bg-gray-900 text-gray-200 font-mono text-sm p-3 rounded select-all overflow-y-scroll'>
				{{iframe}}
			</div>

		</div>
	  </div>

	  <div v-show="!isPublic" class='small-error'>
		  Only public boards can be embedded. <br>You can make this board public in the board settings. (Make sure you save the settings!).
	  </div>
  </div>
</template>

<script>
import {mapState, mapGetters} from "vuex"

export default {
	data(){
		return {
			embed:'board',
			block_id:null,
			section:null,
			height:400,
			width:600,
			full_screen:false
		}
	},
	computed:{
		...mapState("board", ['blocks','public']),
		...mapGetters("board", ['sections_array']),
		isPublic(){
			return this.public // public is a reserved word
		},
		iframe(){
			const url = process.server ? "" : window.location.origin + window.location.pathname
			let src = `${url}?embed=true`
			if (this.embed == 'section'){
				if (!this.section){return "You need to add a valid section"}
				src += `&section=${this.section}`
			}
			else if (this.embed == 'block'){
				if (!this.block_id){return "You need to add a valid block"}
				src += `&block_id=${this.block_id}`
			}
			const container_style = this.full_screen ? "overflow:hidden; display:static; height:100vh; width:100vw;" : `overflow:hidden; display:relative; height:${this.height}px; width:${this.width}px`

			return `
				<div 
					id="chartmat-container" 
					style="${container_style}">
					<iframe
						src="${src}" 
						frameborder="0" 
						allowfullscreen
						style="display:absolute; top:0: left:0; right:0; bottom:0; width:100%; height:100%"
						>
					</iframe>
				</div>
			`
		}
	}
}
</script>

<style>

</style>
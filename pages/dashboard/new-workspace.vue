<template>
  <div class='box-padding w-full'>
	  <p v-show="$fetchState.pending">Loading...</p>
	  <div v-show="!$fetchState.pending">
	  <div class='border-b border-gray-200 pb-6 mb-6'>
		  <h1 class='title'>New Workspace</h1>
		  <p class='subtitle'>Create a new workspace</p>
	  </div>
	  	<div class='small-error' v-show="!canAddWorkspace">
			  <p>
				  	You reached the number of workspaces you can create.<br>
			  		In your current plan ({{user.plan}}) you can add a maximum of {{limit}} workspaces.
			  </p>
			  <nuxt-link class='block btn mx-auto text-lg btn-indigo mt-8' to="/dashboard/account">Upgrade your plan</nuxt-link>
		</div>
		<div class="max-w-xl" :class="{'disabled opacity-20':!canAddWorkspace}">
			<div class="space-y-8 mt-4">
				<div>
					<p class='font-semibold text-gray-700'>Name:</p>
					<p class='text-sm text-gray-600'>This will help you recognize this workspace from others</p>
					<input class='my-form mt-1' v-model="workspace.name" placeholder="Acme Inc">
				</div>
				
				<div>
					<p class='font-semibold text-gray-700'>Subdomain:</p>
					<p class='text-sm text-gray-600'>This is the subdomain used for this workspace</p>
					<div class='flex items-stretch justify-center mt-1'>
						<div class='px-2 text-sm flex items-center rounded bg-gray-100 border border-gray-200 rounded-r-none border-r-0'>https://</div>
						<input class='my-form flex-grow rounded-l-none rounded-r-none' v-model="subdomain" placeholder="acme">
						<div class='px-2 text-sm flex items-center rounded bg-gray-100 border border-gray-200 rounded-l-none border-l-0'>.chartmat.app</div>
					</div>
				</div>
			</div>

			<div class='mt-8 border-t border-gray-200 pt-8'>
				<button class='btn btn-indigo w-full text-lg' @click="createWorkspace" :class="{loading}"> Create Workspace </button>
			</div>	  
		</div>
	  </div>
  </div>
</template>

<script>
const slugify = require("slugify")
export default {
	fetchOnServer:false,
	layout:'main',
	data(){
		return {
			loading:false,
			user:{},
			workspace:{
				name:'',
				subdomain:''
			}
		}
	},
	async fetch(){
		this.user = await this.$axios.$get("/api/auth/db-user")
	},
	computed:{
		limit(){
			// const limits = {
			// 	"chartmat_tier1": 1,
			// 	"chartmat_tier2": 3,
			// 	"chartmat_tier3": 10,
			// 	"chartmat_tier4": 25,
			// 	"chartmat_tier5": 100,
			// 	"pro":5,
			// 	"enterprise":10000
			// }
			// const limit = limits[this.user?.plan] ?? 1
			return this.user.plan_limits?.allowed_workspaces
		},
		canAddWorkspace(){
			return this.user.total_workspaces < this.limit
		},
		subdomain:{
			get(){
				return this.workspace.subdomain
			},
			set(v){
				this.workspace.subdomain = slugify(v,   {lower: true, strict: true, locale: 'en', trim: true })
			}
		}
	},
	methods:{
		async createWorkspace(){
			const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');

			const {new_id, login_token} = await this.$axios.$post(`/api/workspaces`, this.workspace)
			window.location.href = `//${this.workspace.subdomain}.${CHARTMAT_BOARD_BASE_URL}/admin?token=${login_token}`
		}
	}
}
</script>

<style>

</style>
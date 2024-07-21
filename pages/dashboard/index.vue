<template>
  <div class='box-padding w-full'>
	  <div v-show="$fetchState.pending">
		  Fetching your workspaces...
	  </div>
	  <div v-show="!$fetchState.pending">

			<div class='mb-6 border-b border-gray-200 pb-6'>
				<div class='flex justify-between items-center mb-4'>
					<p class='title'>Workspaces</p>
					<nuxt-link to="/dashboard/new-workspace" class='btn btn-indigo text-white font-semibold inline-flex items-center justify-around'>
						<span class='mx-2 sm:mx-5 hidden sm:flex'>New Workspace</span>
						<span class='flex sm:hidden'>New</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</nuxt-link>
				</div>
				<p class='mt-2 subtitle'>
					Each workspace has different users, different custom domains and you can even connect a different Google account.
					<br>In each workspace you can add unlimited boards with unlimited blocks.
				</p>
			</div>

			<div id="workspace list" >
				<div>

					<div v-if="!workspaces.length" class='max-w-xs'>
						<img draggable="false" class='mt-6 w-48 mx-auto' src="/svg/rocket.svg">
						<p class='mt-8 text-center'>You don't have any workspace yet.</p>
						<nuxt-link to="/dashboard/new-workspace" class='btn btn-indigo w-full mt-3'>New Workspace</nuxt-link>
					</div>
				
					<div class='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						<div v-for="workspace in workspaces" :key="workspace.id" class='overflow-hidden p-6 rounded border border-gray-200 bg-slate-50'>
														
							<a :href="`//${workspace.subdomain}.${CHARTMAT_BOARD_BASE_URL}/admin?token=${workspace.login_token}`" class='w-full flex items-center justify-between text-slate-800 hover:text-slate-900'>
								<span class='text-2xl font-bold block truncate'>{{workspace.name}}</span>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>						
							</a>


							<div class='text-sm space-y-4 text-center text-slate-500 mt-3 border-t border-gray-100 pt-3'>
								<p class='flex items-center'>
									<svg class="w-6 h-6 mr-3 flex-shrink-0 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
									{{workspace.subdomain}}
								</p>
								
								<p v-show="workspace.created_by === $auth.user.id" class='flex items-center'>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 flex-shrink-0 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									</svg>
									You are the owner
								</p>
								<p v-show="workspace.created_by !== $auth.user.id" class='flex items-center'>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 flex-shrink-0 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
									</svg>
									You have been added to this workspace
								</p>
								<p class='flex items-center'>
									<svg class='h-6 w-6 mr-3 flex-shrink-0 stroke-current' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48"><defs><path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></defs><clipPath id="b"><use xlink:href="#a" overflow="visible"/></clipPath><path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/><path clip-path="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/><path clip-path="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/><path clip-path="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/></svg>
									<span>{{workspace.token_email || "Not Connected"}}</span>
								</p>
								<p class='flex items-center'>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
									</svg>
									<span>{{workspace.boards.length}} {{workspace.boards.length > 1 ? 'Boards' : 'Board'}}</span>
								</p>
								<div class='flex items-center text-left'>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 flex-shrink-0 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<div>
										<div>
											<p class='block font-medium'>Admins:</p>
											<p v-if="users[workspace.id].admins.length">{{users[workspace.id].admins}}</p>
											<p v-else>None</p>
										</div>
										<div class='mt-2'>
											<p class='block font-medium'>Guests:</p>
											<p v-if="users[workspace.id].guests.length">{{users[workspace.id].guests}}</p>
											<p v-else>None</p>
										</div>										
									</div>
								</div>							
							</div>
						</div>
					</div>
				</div>
			</div>
	  </div>
  </div>
</template>

<script>
export default {
	middleware:"auth",
	layout:"main",
	fetchOnServer: false,
	head() {
      return {
		title: "Workspaces"
	  }
	},
	data(){
		return {
			workspaces:[],
			CHARTMAT_BOARD_BASE_URL: ''
		}
	},
	async fetch (){
		this.workspaces = await this.$axios.$get("/api/workspaces")
		const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');
    	this.CHARTMAT_BOARD_BASE_URL = CHARTMAT_BOARD_BASE_URL;
	},
	computed:{
		role(){
			const arr = this.workspaces.map(w => [w.id, w.users.find(u => u.email).role])
			return Object.fromEntries(arr)
		},
		users(){
			const arr = this.workspaces.map(w => [w.id, {
					admins:w.users.filter(u => u.role === 'admin').map(e => e.email).join(", "), 
					guests:w.users.filter(u => u.role === 'guest').map(e => e.email).join(", ")
				}])
			return Object.fromEntries(arr)
		}
	},
	methods:{

	}
}
</script>

<style>

</style>
<template>
	<div>
		<div v-for="(filter, filter_ix) in filters" :key="filter_ix" v-show="filter.display"
			class='cursor-pointer flex items-center rounded overflow-hidden bg-white'
			:class="filter.active ? 'bg-opacity-80' : 'bg-opacity-60' ">

			<button class='p-1 border-r border-gray-600' @click="filter.active=!filter.active">
				<svg v-show="filter.active" class="font-light h-4 w-4 stroke-current text-teal-500"
					xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"
					role="img" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
					<path stroke-width="1"
						d="M13 19.88c.04.3-.06.62-.28.83c-.4.39-1.03.39-1.42 0L7.29 16.7a.989.989 0 0 1-.29-.83v-5.12L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L13 10.75v9.13M5.04 5L9 10.07v5.51l2 2v-7.53L14.96 5H5.04m12.71 16L15 18l1.16-1.16l1.59 1.59l3.59-3.59l1.16 1.41L17.75 21"
						fill="currentColor"></path>
				</svg>
				<svg v-show="!filter.active" class="font-light h-4 w-4 stroke-current text-red-500"
					xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"
					role="img" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
					<path stroke-width="1"
						d="M14.73 20.83L17.58 18l-2.85-2.83l1.42-1.41L19 16.57l2.8-2.81l1.42 1.41L20.41 18l2.81 2.83l-1.42 1.41L19 19.4l-2.85 2.84l-1.42-1.41M13 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L7.29 16.7a.989.989 0 0 1-.29-.83v-5.12L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L13 10.75v9.13M5.04 5L9 10.06v5.52l2 2v-7.53L14.96 5H5.04z"
						fill="currentColor"></path>
				</svg>
			</button>
			<div>
				<div v-if="filter.display=='switch'" class='rounded px-2 h-6' @click="filter.active=!filter.active">
					{{filter.name}}
				</div>
				<div v-else-if="filter.display=='value'" class='bg-transparent px-2'>

					<datePicker v-if="filter.condition=='date'" :dates="filter.value" @change="filter.value = $event">
					</datePicker>

					<select v-else-if="filter.condition=='='" class='w-full px-2 bg-transparent' v-model="filter.value">
						<option v-for="(v, vix) in get_options(filter.sheet_column)" :key="vix">{{v}}</option>
					</select>

					<div v-else-if="filter.condition=='any_of'" class='group'>
						<div class='truncate max-w-xs' @click="show_multiple_options=filter_ix">
							<p>{{filter.name}}</p>
						</div>
						<div v-show="show_multiple_options!==null" @click="show_multiple_options=null"
							class='h-screen bg-black bg-opacity-20 absolute inset-0 w-screen z-30'></div>
						<div v-show="show_multiple_options==filter_ix" class='z-50 absolute py-2 px-3'>
							<div
								class='p-2 rounded bg-white shadow-lg border border-gray-200 w-full inset-x-3 sm:w-auto sm:inset-auto'>
								<p class='text-lg font-bold mb-2'>{{filter.name}}:</p>
								<ul class='flex flex-wrap gap-3'>
									<li @click="filter.value = addRemoveOption(filter.value, option)"
										class='flex px-1 justify-center items-center rounded-sm py-0.5 text-sm'
										v-for="(option, ix) in get_options(filter.sheet_column)"
										:class="filter.value.split('[(OR)]').map(x => x.trim()).includes(option) ? 'bg-emerald-200 text-emerald-700': 'bg-gray-100 text-gray-500' "
										:key="ix">
										<span class='max-w-xs truncate'>{{option}}</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<input v-else class='px-2 bg-transparent w-full' placeholder="Enter your value here"
						v-model="filter.value">
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapMultiRowFields } from 'vuex-map-fields';
export default {
	props:{

	}
}
</script>

<style>

</style>
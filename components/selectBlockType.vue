<template>
  <div class="p-10">
    <h1 class="text-2xl mb-16 font-bold">Select your block type:</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">
      <div
        id="block-chart"
        v-for="(info, name) in block_types"
        :key="name"
        @click="setBlock(name)"
        :class="{ 'bg-gray-100 cursor-not-allowed': info.coming_soon }"
        class="cursor-pointer rounded-lg bg-white shadow hover:shadow-xl hover:scale-110 duration-500 hover:transform p-6"
      >
        <div class="inline-flex justify-around items-center">
          <div class="rounded-lg bg-teal-50 p-4 -mt-10 shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 stroke-current text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="info.icon"
              />
            </svg>
          </div>
          <p class="text-2xl font-semibold ml-3 capitalize">
            {{ name }}
            <span v-show="info.coming_soon" class="ml-2 text-gray-500 text-sm"
              >Coming Soon!</span
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      block_types: {
        chart: {
          coming_soon: false,
          icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        },
        table: {
          coming_soon: false,
          icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
        },
        form: {
          coming_soon: false,
          icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        },
        grid: {
          coming_soon: false,
          icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
        },
        markdown: {
          coming_soon: false,
          icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
        },
        iframe: {
          coming_soon: false,
          icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        },
        scorecard: {
          coming_soon: false,
          icon: "M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
        },
        map: {
          coming_soon: false,
          icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
        },
        calendar: {
          coming_soon: false,
          icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z",
        },
      },
    };
  },

  methods: {
    setBlock(type) {
      if (!this.block_types[type].coming_soon) {
        this.$store.commit("board/SET_TEMPO_BLOCK", { type: type });
      }
    },
  },
};
</script>

<style>
</style>
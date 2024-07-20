<template>
  <div class="bg-black">
    <nav
      v-if="can_edit"
      class="h-12 shadow sticky py-4 bg-black text-white flex px-3 items-center justify-between top-0 left-0 right-0 z-30 font-normal"
    >
      <div class="inline-flex items-center truncate text-white">
        <nuxt-link to="/admin" class="inline-flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
            />
          </svg>
          <span>Admin</span>
        </nuxt-link>
        <div
          class="h-2 w-2 rounded-full p-1 mx-2"
          style="background-color: #808080 !important"
        ></div>
        <span @click="switchRoute('view')" class="truncate cursor-pointer">
          {{ name || title }}</span
        >
      </div>
      <div class="h-full">
        <ul class="inline-flex items-center h-full capitalize">
          <li
            class="h-full cursor-pointer rounded-full px-2 text-sm inline-flex items-center"
            v-for="item in boardNav"
            :class="
              page === item.page
                ? 'btn-indigo py-4  text-white border-0'
                : 'header-gray'
            "
            @click="switchRoute(item.page)"
            :key="item.name"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="item.icon"
              />
            </svg>
            <span class="ml-2 hidden sm:flex">{{ item.name }}</span>
          </li>
        </ul>
      </div>
    </nav>
    <div class="min-h-screen bg-slate-100">
      <nuxt />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  mounted() {
    this.logUser();
  },
  data() {
    return {
      boardNav: [
        {
          name: "docs",
          page: "docs",
          icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
        },
        {
          name: "new block",
          page: "add",
          icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
          name: "settings",
          page: "settings",
          icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
        },
        {
          name: "embed",
          page: "embed",
          icon: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4",
        },
        {
          name: "Publish",
          page: "publish",
          icon: "M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15",
        },
        {
          name: "spreadsheet",
          page: "spreadsheet",
          icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
        },
      ],
    };
  },
  computed: {
    ...mapState("board", [
      "hero_background",
      "board_background",
      "title",
      "name",
      "page",
      "can_edit",
      "workspace_id",
    ]),
  },
  methods: {
    switchRoute(name) {
      this.open = false;
      switch (name) {
        case "docs":
          window.open("https://help.chartmat.com", "_blank").focus();
          break;
        case "view":
          this.$store.commit("board/SET_TEMPO_BLOCK");
          this.$store.commit("board/UPDATE", { page: "view" });
          break;
        case "add":
          this.$store.commit("board/SET_TEMPO_BLOCK");
          this.$store.commit("board/UPDATE", { page: "add" });
          break;
        case "settings":
          this.$store.commit("board/SET_TEMPO_BLOCK");
          this.$store.commit("board/UPDATE", { page: "settings" });
          break;
        case "embed":
          this.$store.commit("board/SET_TEMPO_BLOCK");
          this.$store.commit("board/UPDATE", { page: "embed" });
          break;
        case "publish":
          this.$store.commit("board/SET_TEMPO_BLOCK");
          this.$store.commit("board/UPDATE", { page: "publish" });
          break;
        case "spreadsheet":
          const url = this.$store.getters["board/spreadsheet_url"];
          window.open(url, "_blank").focus();
          break;
        default:
          this.$store.commit("board/SET_TEMPO_BLOCK");
          this.$router.push(`/${name}`);
          break;
      }
    },
  },
};
</script>

<style scoped>
.header-gray {
  color: #ccc;
}
</style>
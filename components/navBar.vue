<template>
  <div>
    <div class="h-44 md:h-56 bg-slate-900">
      <div
        id="nav"
        class="inline-flex justify-between items-center w-full px-4 sm:px-8 mt-3 md:mt-8 font-semibold text-white"
      >
        <div>
          <img alt="logo" src="/logo.svg" class="w-6 h-6 mr-6" />
        </div>
        <nuxt-link to="/dashboard" class="text-2xl font-bold mr-5">
          Chartmat
        </nuxt-link>
        <div class="space-x-4 hidden md:flex w-full">
          <div
            v-for="link in main_routes"
            :key="link.name"
            class="flex last:justify-end last:w-full nav-items"
          >
            <button
              @click="switchRoute(link.name)"
              :class="{ loading: loadingFeedback && link.name == 'feedback' }"
              class="nav-item"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="link.icon"
                />
              </svg>
              {{ link.name }}
            </button>
          </div>
        </div>
        <!-- <div>
					<svg id="new-stuff" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-300 stroke-current ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
					<script>
						var ps_popover = {
							workspace_id : "e81a3b03-57b0-4667-bbca-d33154f74472",
							selector: "#new-stuff"
						};
					</script>
					<script type="text/javascript" src="https://cdn.productstash.io/js/popover.min.js?v=0.1" defer="defer"></script>
				</div> -->

        <div id="mobile-nav-bar" class="block md:hidden">
          <div
            :class="
              open
                ? 'fixed z-40 p-6 md:p-0 md:static rounded-lg top-5 left-5 right-5 bg-gray-100 md:bg-transparent shadow-2xl md:shadow-none'
                : ''
            "
          >
            <div class="block md:hidden" v-show="!open">
              <a @click="open = !open" class="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </a>
            </div>

            <div v-show="open">
              <div
                class="md:space-x-4 space-y-2 font-semibold block w-full md:inline-flex md:w-auto text-black md:text-white"
              >
                <div v-for="link in main_routes" :key="link.url">
                  <a
                    @click="switchRoute(link.name)"
                    class="opacity-80 py-2 cursor-pointer w-full md:w-auto inline-flex px-2 transition-all capitalize items-center hover:shadow-sm hover:bg-white hover:bg-opacity-40 rounded-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        :d="link.icon"
                      />
                    </svg>
                    {{ link.name }}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            v-show="open"
            @click="open = false"
            class="fixed md:hidden top-0 left-0 h-screen w-screen bg-black opacity-75 z-10"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      open: false,
      loadingFeedback: false,
      main_routes: [
        {
          name: "docs",
          icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
        },
        {
          name: "feedback",
          icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
        },
        {
          name: "marketplace",
          icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        },
        {
          name: "account",
          icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        },
      ],
    };
  },
  computed: {
    ...mapState("board", ["hero_background", "can_edit"]),
    white() {
      return this.isWhite(this.hero_background);
    },
    board_id() {
      return this.$route.params.board_id;
    },
  },
  methods: {
    async loginFeedback() {
      this.loadingFeedback = true;
      let url = "https://next.chartmat.com/chartmat";
      try {
        url = await this.$axios.$post(`/api/auth/loopedin`, {
          returnURL: "https://next.chartmat.com/chartmat",
        });
      } catch (e) {
        // nothing
      }
      this.loadingFeedback = false;
      window.open(url, "_blank").focus();
      // window.location.href = url
    },
    async switchRoute(name) {
      this.open = false;
      switch (name) {
        case "workspaces":
          this.$router.push("/dashboard");
          break;
        case "account":
          this.$router.push("/dashboard/account");
          break;
        case "marketplace":
          this.$router.push("/marketplace");
          break;
        case "docs":
          window.open("https://help.chartmat.com", "_blank").focus();
          break;
        case "feedback":
          await this.loginFeedback();
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

<style>
</style>

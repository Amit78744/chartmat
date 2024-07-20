<template>
  <div>
    <div class="p-10" v-show="!workspace.id">Loading workspace...</div>

    <div v-show="workspace.id">
      <div>
        <div class="bg-slate-900 text-white p-6">
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center">
              <a
                :href="`//${CHARTMAT_BOARD_BASE_URL}/dashboard`"
                class="text-white mr-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 stroke-current"
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
              </a>
              <div class="border-l border-slate-700 pl-3">
                <p class="text-2xl font-bold">{{ workspace.name }} Admin</p>
                <p class="text-sm opacity-80">
                  Manage Users, Settings & Boards for {{ workspace.name }}
                </p>
              </div>
            </div>
            <div class="group">
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 stroke-current text-gray-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <div
                class="hidden group-hover:block absolute rounded p-3 bg-white border border-gray-200 shadow-lg right-4 text-black max-w-sm"
              >
                <p>
                  You are logged in the workspace
                  <b class="bold"> {{ workspace.name }}</b> with the email
                  {{ email }}
                </p>
                <button @click="logout" class="btn btn-red w-full mt-4">
                  Logout
                  <span class="hidden sm:flex"
                    >&nbsp; from {{ workspace.name }}</span
                  >
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="
            !workspace.lifetime_campaign &&
            (workspace.expired || workspace.autocharge_failed)
          "
        >
          <div
            v-if="workspace.expired || workspace.autocharge_failed"
            class="small-error container mx-auto my-10 text-xl font-semibold"
          >
            <div
              v-if="workspace.created_by == $auth.user.id && workspace.expired"
            >
              <p>
                Sorry you cannot access this workspace because your Chartmat
                subscription has expired. Access will be restored once
                subscription is renewed.
              </p>
              <nuxt-link
                class="block btn mx-auto text-lg btn-indigo mt-8 max-w-fit"
                to="/dashboard/account"
                >Renew your plan</nuxt-link
              >
            </div>
            <div
              v-else-if="
                workspace.created_by == $auth.user.id &&
                workspace.autocharge_failed
              "
            >
              <p>
                Please review your payment method from manage subscription in my
                accounts page
              </p>
              <nuxt-link
                class="block btn mx-auto text-lg btn-indigo mt-8 max-w-fit"
                to="/dashboard/account"
              >
                Go to my account</nuxt-link
              >
            </div>
            <div v-else class="p-6">
              <p>
                Sorry you cannot access this workspace because the owner
                Chartmat subscription has expired. Access will be restored once
                subscription is renewed.
              </p>
            </div>
          </div>
        </div>
        <div v-else class="p-6">
          <div>
            <div
              class="sm:flex justify-between items-center w-full border-b border-gray-200 pb-3 mb-3"
            >
              <div class="inline-flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 mr-2 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                  />
                </svg>
                <h1 class="title">
                  {{ workspace.name }} /<span class="text-gray-600">
                    {{ tab }}</span
                  >
                </h1>
              </div>
              <div
                v-if="workspace.can_edit"
                class="flex items-center gap-2 sm:gap-8"
              >
                <button
                  @click="tab = t"
                  v-for="t in ['boards', 'settings']"
                  :key="t"
                  class="font-semibold capitalize"
                >
                  {{ t }}
                </button>
                <button class="btn btn-indigo" @click="tab = 'new'">
                  New Board
                </button>
              </div>
            </div>

            <div
              v-show="tab === 'boards'"
              class="grid grid-cols-1 gap-4 mt-4 max-w-xl"
            >
              <div>
                <div v-if="!workspace.token_email" class="max-w-xs">
                  <img
                    draggable="false"
                    class="mx-auto mt-6 w-40"
                    src="/svg/space.svg"
                  />
                  <p class="mt-8 text-center">
                    This workspace is not connected to Google Sheets
                  </p>
                  <a
                    class="btn btn-yellow w-full mt-3"
                    :href="`//${CHARTMAT_BOARD_BASE_URL}/dashboard/auth?workspace_id=${workspace.id}`"
                    >Connect Google</a
                  >
                </div>

                <div v-else-if="!workspace.boards.length" class="max-w-xs">
                  <img
                    draggable="false"
                    class="w-full mt-6"
                    src="/svg/city.svg"
                  />
                  <p class="mt-8 text-center">
                    This workspace doesn't have any board yet.
                  </p>
                  <button
                    class="btn btn-indigo w-full mt-3"
                    @click="tab = 'new'"
                  >
                    New Board
                  </button>
                </div>
              </div>

              <div
                v-for="board in workspace.boards"
                :key="board.id"
                class="p-3 group bg-slate-50 border border-slate-200 rounded"
              >
                <div class="flex justify-between items-center">
                  <div class="py-1">
                    <div class="inline-flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mr-1 text-gray-700 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p class="font-semibold">
                        {{ board.name || board.title || `Board ${board.id}` }}
                      </p>
                    </div>
                    <div class="flex flex-wrap mt-1">
                      <p
                        v-show="!board.public"
                        class="text-xs font-semibold inline-flex items-center mr-2 rounded-full text-gray-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 mr-2 text-rose-600 stroke-current"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        Private
                      </p>

                      <p
                        v-show="board.public"
                        class="text-xs font-semibold inline-flex items-center mr-2 rounded-full text-gray-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 mr-2 text-teal-600 stroke-current"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                          />
                        </svg>
                        Public
                      </p>

                      <p
                        class="text-xs font-semibold inline-flex items-center mr-2 rounded-full text-gray-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 mr-2 text-emerald-500 stroke-current"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1"
                            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        {{ board.title || board.spreadsheetId }}
                      </p>

                      <p
                        class="text-xs font-semibold inline-flex items-center mr-2 rounded-full text-gray-500"
                      >
                        <svg
                          class="h-5 w-5 mr-2 text-indigo-500 stroke-current"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          ></path>
                        </svg>
                        {{ board.path }}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  class="w-full border-t border-gray-200 py-2 mt-2 text-sm flex items-center justify-end"
                >
                  <button
                    :class="{ loading: cloning_id === board.id }"
                    class="bg-yellow-50 flex items-center border border-yellow-300 text-yellow-700 px-3 font-semibold py-1 rounded mr-3"
                    @click="cloneBoard(board)"
                  >
                    Clone Board
                    <svg
                      class="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </button>
                  <a
                    :href="`//${workspace.subdomain}.${CHARTMAT_BOARD_BASE_URL}/${board.path}`"
                    class="bg-indigo-50 flex items-center border border-indigo-300 text-indigo-700 px-3 font-semibold py-1 rounded"
                  >
                    View Board
                    <svg
                      class="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div v-if="tab === 'settings'" class="max-w-xl">
              <workspaceSettings
                :existing_workspace="workspace"
              ></workspaceSettings>
            </div>

            <div v-if="tab === 'new'">
              <boardNew :workspace="workspace"></boardNew>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  layout: "default",
  fetchOnServer: false,
  data() {
    return {
      tab: "boards",
      cloning_id: null,
      workspace: {},
      user: {},
      CHARTMAT_BOARD_BASE_URL : ''
    };
  },
  async mounted() {
    const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');
    this.CHARTMAT_BOARD_BASE_URL = CHARTMAT_BOARD_BASE_URL;
    
    const { token, embed, section, block_id } = this.$route.query;
    if (token) {
      this.$router.replace({ query: null });
      this.message = "Logging you in...";
      await this.$auth.loginWith("local", { data: { token: token } });
     
    }

    const workspace = await this.$axios
      .$get(`/api/board/workspace`)
      .catch((e) => {
        if (!this.$auth.loggedIn) {
          window.location.href = `//${this.CHARTMAT_BOARD_BASE_URL}/dashboard/auth`;
        } else {
          throw new Error(this.errorMsg(e));
        }
      });
    this.workspace = workspace ?? {};
  },

  methods: {
    logout() {
      this.$auth.logout();
      window.location.href = `//${this.CHARTMAT_BOARD_BASE_URL}/dashboard`;
    },
    async cloneBoard(board) {
      this.cloning_id = board.id;
      const path = board.path.split("-clone-")[0] + `-clone-${+new Date()}`;
      const clone = { template_id: board.id, is_template: false, path: path };
      await this.$axios.$post("/api/board", clone);
      this.$router.push(`/${path}`);
    },
  },
  computed: {
    email() {
      return this.$auth?.user?.email;
    },
  },
};
</script>
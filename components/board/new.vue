<template>
  <div>
    <div v-show="loading_message" class="mt-10">{{ loading_message }}</div>
    <div v-show="!loading_message">
      <div class="mt-6" id="no-google" v-show="!workspace_info.token">
        Google Sheets doesn't seem to be connected. <br />
        Please connect or refresh your Google Sheet integration in you workspace
        settings
      </div>
      <div v-show="workspace_info.token">
        <div class="mt-6" id="board-templates">
          <div>
            <p class="font-semibold text-2xl">Free templates:</p>
            <p class="text-sm text-gray-600">
              By selecting a template we will create a new google sheet in your
              Google Drive account
            </p>
          </div>

          <div class="max-w-mdx my-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button
                :class="{
                  'border-emerald-400 text-emerald-800 bg-emerald-50 hover:bg-emerald-50':
                    is_template && selected_id === template.id,
                }"
                :id="template.id"
                @click="clone_board(template.id, template.path)"
                v-for="template in templates"
                :key="template.id"
                class="group hover:bg-gray-50 cursor-pointer inline-flex justify-between items-center w-full p-4 border-gray-200 border rounded-lg"
              >
                <div
                  class="inline-flex items-center group-hover:transform group-hover:scale-105 duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-teal-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="template.icon"
                    />
                  </svg>
                  <p>{{ template.name || template.title }}</p>
                </div>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="max-w-mdx my-6">
            <p class="font-semibold text-2xl">Templates purchased from Marketplace:</p>
             <p class="text-sm text-gray-600">Templates workspace owner has purchased from the charmat marketplace.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 my-6">
              <button
                :class="{
                  'border-emerald-400 text-emerald-800 bg-emerald-50 hover:bg-emerald-50':
                    is_template && selected_id === template.id,
                }"
                :id="template.id"
                @click="clone_board(template.id, template.path, true)"
                v-for="template in purchased_templates"
                :key="template.id"
                class="group hover:bg-gray-50 cursor-pointer inline-flex justify-between items-center w-full p-4 border-gray-200 border rounded-lg"
              >
                <div
                  class="inline-flex items-center group-hover:transform group-hover:scale-105 duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-teal-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="template.icon"
                    />
                  </svg>
                  <p>{{ template.name || template.title }}</p>
                </div>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="mt-6" id="select-spreadsheet">
          <div class="my-6">
            <p class="font-semibold">
              Alternatively, you can link an existing spreadsheet:
            </p>
          </div>

          <div
            class="max-w-sm rounded-lg border border-gray-200 overflow-hidden"
            :class="{
              'border-emerald-400 text-emerald-800 bg-emerald-50 hover:bg-emerald-50':
                !is_template && selected_id,
            }"
          >
            <div
              @click="createPicker"
              class="group cursor-pointer inline-flex justify-between items-center w-full p-4 hover:bg-gray-50"
            >
              <div
                class="inline-flex items-center group-hover:transform group-hover:scale-105 duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-rose-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
                  />
                </svg>
                <p>{{ this.spreadsheet_name || "Select Spreadsheet" }}</p>
              </div>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="block pb-3">
            <p class="text-lg font-bold">Board Path</p>
            <p>
              Select a board path which will makes it easy to reach it.<br />
              Use <span class="tag px-1">index</span> if you want to show it in
              the homepage of your workspace. You can change this path whenever
              you want.
            </p>
          </div>
          <div class="max-w-2xl my-10 mx-auto shadow-lg">
            <div
              class="w-full flex items-center border border-gray-200 rounded-t-lg overflow-hidden"
            >
              <p class="h-full p-3 bg-gray-100">
                https://{{ workspace.subdomain }}.chartmat.app/
              </p>
              <input
                class="h-full w-full p-3 appearance-none m-0.5"
                placeholder="some-path"
                v-model="slugPath"
              />
            </div>
            <button
              class="w-full p-2 text-center bg-indigo-600 text-white text-lg font-bold rounded-b-lg"
              @click="createBoard"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const slugify = require("slugify");
export default {
  fetchOnServer: false,
  head() {
    return {
      script: [
        {
          src: "https://apis.google.com/js/api.js?onload=loadPicker",
          hid: "picker",
          vmid: "picker",
          defer: true,
          callback: () => this.loadPicker(),
        },
      ],
    };
  },
  props: {
    workspace: {
      default: () => {},
    },
  },
  data() {
    return {
      spreadsheet_name: "",
      workspace_info: {},
      loading_message: "Loading...",
      pickerApiLoaded: false,
      path: "",
      selected_id: null,
      purchased_templates: [],
	  marketplace:false,
    };
  },
  async fetch() {
    this.workspace_info = await this.$axios
      .$get(`/api/board/workspace-info`)
      .catch((e) => (this.loading_message = this.errorMsg(e)));
    this.purchased_templates = await this.$axios.$get(
      "/api/purchased/templates"
    );
    // = purchased_templates.data;
    this.loading_message = null;
  },
  computed: {
    templates() {
      return require("~/assets/files/templates.json");
    },
    is_template() {
      return this.purchased_templates?.find((t) => t.id === this.selected_id) || this.templates.find((t) => t.id === this.selected_id);
    },
    slugPath: {
      get() {
        return this.path;
      },
      set(v) {
        this.path = slugify(v, {
          lower: true,
          strict: true,
          locale: "en",
          trim: true,
        });
      },
    },
  },
  methods: {
    async loadPicker() {
      window.gapi.load("picker", () => {
        this.pickerApiLoaded = true;
      });
    },
    async createPicker() {
      const CHARTMAT_GOOGLE_PICKER_API_KEY = await this.$axios.$get('/api/getENV/CHARTMAT_GOOGLE_PICKER_API_KEY');
      const CHARTMAT_GOOGLE_APP_ID = await this.$axios.$get('/api/getENV/CHARTMAT_GOOGLE_APP_ID');

      if (!this.workspace_info.token) {
        alert(
          "Google Sheets doesn't seem to be connected. Verify your connection in the workspace settings."
        );
      } else if (!this.pickerApiLoaded) {
        alert(
          "We can't load the Google Api. Make sure that you don't use an ad-blocker in this stage"
        );
      } else {
        this.selected_id = null;
        this.spreadsheet_name = null;
        const msg = `To select a spreadsheet you must be logged in to Google with the email: ${this.workspace_info.token_email}. If you are asked to login or experience issues please disable your ad-blocker.`;
        alert(msg);
        const view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("application/vnd.google-apps.spreadsheet");
        const picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          .setAppId(CHARTMAT_GOOGLE_APP_ID)
          .setOAuthToken(this.workspace_info.token)
          .addView(view)
          .addView(new google.picker.DocsUploadView())
          .setDeveloperKey(CHARTMAT_GOOGLE_PICKER_API_KEY)
          .setCallback(this.pickerCallback)
          .build();
        picker.setVisible(true);
      }
    },

    async pickerCallback(data) {
      if (data.action == google.picker.Action.PICKED) {
        const { id, name } = data.docs[0];
        this.selected_id = id;
        this.slugPath = name;
        this.spreadsheet_name = name;
      }
    },
    async clone_board(template_id, path = "", marketplace = false) {
      this.spreadsheet_name = null;
      this.selected_id = template_id;
      this.slugPath = path;
      this.marketplace = marketplace;
    },
    async createBoard() {
      if (!this.slugPath.length) {
        alert("Please add a valid path");
        return;
      }
      if (!this.selected_id) {
        alert("Please select a template or an existing spreadsheet");
        return;
      }
      const restricted_paths = ["admin", "dashboard", "auth", "login"];
      for (const path of restricted_paths) {
        if (this.slugPath.startsWith(path)) {
          alert(`The board path can not start with the word: ${path}`);
          return;
        }
      }
      const existing_paths = this.workspace.boards.map((b) => b.path);
      if (existing_paths.includes(this.slugPath)) {
        alert(
          `This workspace is already using the path: "${this.slugPath}". Please select a unique path.`
        );
        return;
      }
      this.loading_message = this.is_template
        ? "Cloning template..."
        : "Creating new board...";
      const data = this.is_template
        ? { template_id: this.selected_id }
        : { spreadsheetId: this.selected_id };
      data.path = this.slugPath;
      data.is_template = true;
	  data.marketplace = this.marketplace;

      const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');

      const new_id = await this.$axios.$post(`/api/board`, data);
      window.location.href = `//${this.workspace.subdomain}.${CHARTMAT_BOARD_BASE_URL}/${this.slugPath}`;
    },
  },
};
</script>

<style>
</style>
<template>
  <div>
    <div>
      <div class="space-y-8 mt-4">
        <div>
          <p class="font-semibold text-gray-700">Name:</p>
          <p class="text-sm text-gray-600">
            This will help you recognize this workspace from others
          </p>
          <input
            class="my-form mt-1"
            v-model="workspace.name"
            placeholder="Acme Inc"
          />
        </div>

        <div>
          <p class="font-semibold text-gray-700">Subdomain:</p>
          <p class="text-sm text-gray-600">
            This is the subdomain used for this workspace
          </p>
          <div class="flex items-stretch justify-center mt-1">
            <div
              class="px-2 text-sm flex items-center rounded bg-gray-100 border border-gray-200 rounded-r-none border-r-0"
            >
              https://
            </div>
            <input
              class="my-form flex-grow rounded-l-none rounded-r-none"
              v-model="subdomain"
              placeholder="acme"
            />
            <div
              class="px-2 text-sm flex items-center rounded bg-gray-100 border border-gray-200 rounded-l-none border-l-0"
            >
              .chartmat.app
            </div>
          </div>
        </div>

        <div>
          <p class="font-semibold text-gray-700">Custom Domain:</p>
          <p class="text-sm text-gray-600">
            You can link a custom domain to this workspace
          </p>
          <div class="flex gap-3 items-center mt-1" v-if="!workspace.domain">
            <input
              class="my-form"
              v-model="new_domain"
              placeholder="example.com"
            />
            <button
              @click="addDomain"
              class="bg-emerald-50 rounded border border-emerald-500 h-full px-5 py-2 text-sm"
            >
              Add
            </button>
          </div>
          <div v-else class="flex gap-3 items-center mt-1">
            <div class="my-form disabled opacity-60">
              {{ workspace.domain }}
            </div>
            <button
              @click="delete_domain"
              class="bg-red-50 rounded border border-red-500 h-full px-5 py-2 text-sm"
            >
              Delete
            </button>
          </div>

          <div v-if="workspace.domain" class="my-3">
            <div
              v-show="domain_dns == 'loading'"
              class="rounded p-3 text-sm border border-yellow-500 bg-yellow-50"
            >
              Checking DNS Setup...
            </div>
            <div
              v-show="domain_dns == true"
              class="rounded p-3 text-sm border border-green-500 bg-green-50"
            >
              Your domain is setup correctly
            </div>
            <div
              v-show="domain_dns == false"
              class="rounded p-3 text-sm border border-red-500 bg-red-50"
            >
              <p>
                You need to setup the DNS records for the domain
                <span class="font-bold">{{ workspace.domain }}</span
                >:
              </p>

              <div
                class="space-y-3 border border-gray-200 rounded-lg bg-gray-50 my-5"
              >
                <div class="border-b border-gray-200 p-3">
                  <p class="text-sm font-bold mb-2">
                    If you use a subdomain like board-xyz.example.com:
                  </p>
                  <p><b>Record Type:</b> CNAME</p>
                  <p><b>Host/Name:</b> Your subdomain (e.g. board-xyz)</p>
                  <p><b>Value:</b> chartmat.app</p>
                </div>
                <div class="border-b border-gray-200 p-3">
                  <p class="text-sm font-bold mb-2">
                    If you use a root domain like example.com:
                  </p>
                  <p><b>Record Type:</b> A Record</p>
                  <p><b>Host/Name:</b> @</p>
                  <p><b>Value:</b> 76.76.21.21</p>
                </div>
              </div>

              <div>
                It might take up to 72 hours before your CNAME records get
                updated.
              </div>
            </div>
          </div>
        </div>

        <div>
          <p class="font-semibold text-gray-700 mb-2">Login PIN Email:</p>
          <p class="text-sm text-gray-600 mb-2">
            Login PIN will be sent using the email service provider and sender
            email address provided.
            <button
              v-if="!workspace.edit_email_provider"
              class="px-3 text-sm rounded text-blue-600 bg-blue-50 border-blue-400"
              @click="edit_email_provider"
            >
              Edit
            </button>
          </p>

          <fieldset :disabled="!workspace.edit_email_provider">
            <p class=""><span>Email Service Provider</span></p>
            <select
              v-model="workspace.email_service.provider"
              class="mb-3 my-form rounded-l-none text-black"
            >
              <option value="chartmat">Charmat Default</option>
              <option value="postmark">Postmark</option>
            </select>
            <div v-if="workspace.email_service.provider == 'postmark'">
              <div>
                <p class=""><span>Postmark API Key</span></p>
                <input
                  class="my-form mb-3"
                  v-if="workspace.edit_email_provider"
                  v-model="workspace.email_service.postmark_key"
                  placeholder="Your postmark API key"
                />
                <input
                  class="my-form mb-3"
                  v-else
                  :value="email_service.postmark_key"
                />
              </div>
              <div>
                <p class=""><span>Sender Email Address</span></p>
                <input
                  class="my-form mb-3"
                  v-model="workspace.email_service.sender_email"
                  placeholder="Sender email address"
                />
              </div>
                <div>
                <p class=""><span>Sender Name</span></p>
                <input
                  class="my-form mb-3"
                  v-model="workspace.email_service.sender_name"
                  placeholder="Sender name"
                />
              </div>
            </div>
          </fieldset>
          <div v-if="workspace.edit_email_provider">
            <div
              v-show="email_service_msg"
              :class="
                email_status
                  ? 'rounded bg-green-50 border border-green-100 px-2 mb-2'
                  : 'rounded bg-red-50 border border-red-100 px-2 mb-2'
              "
            >
              {{ email_service_msg }}
            </div>
            <button
              v-if="workspace.email_service.provider != 'chartmat'"
              :class="{ loading: sending_email }"
              @click.prevent="test_email"
              class="px-3 py-1 rounded text-blue-600 bg-blue-50 border border-blue-400"
            >
              Send test email
            </button>
            <button
              @click.prevent="saveWorkspace"
              :class="{ loading }"
              class="px-3 py-1 rounded text-blue-600 bg-blue-50 border border-blue-400"
            >
              Save
            </button>
            <button
              @click.prevent="edit_email_provider"
              class="px-3 py-1 rounded text-red-600 bg-red-50 border border-red-400"
            >
              Cancel
            </button>
          </div>
        </div>
        <div>
          <p class="font-semibold text-gray-700">Favicon:</p>
          <p class="text-sm text-gray-600">
            Icon will be used as favicon for all the boards belonging to this
            workspace. Icon must be a square .ico file.<br />
            [Recommended dimension : 32 x 32px]
          </p>
          <div>
            <input
              autocomplete="off"
              placeholder="Upload Icon"
              type="file"
              accept=".ico"
              name="favicon"
              id="favicon"
              @change="update_local_image"
              class="chartmat-file-input bg-transparent focus:bg-white focus:text-black rounded-md-md focus:shadow-md p-2 w-full"
            />
            <br />
            <img
              :src="workspace.favicon"
              v-if="workspace.favicon"
              class="p-3"
              style="max-height: 200px; text-align: center"
            />
            <a
              href="#"
              v-if="workspace.favicon"
              @click.prevent="workspace.favicon = ''"
              class="mx-2 text-indigo-500"
              >Remove favicon</a
            >
          </div>
        </div>

        <div>
          <p class="font-semibold text-gray-700">Users:</p>
          <p class="text-sm text-gray-600">
            Admins can create and edit boards & settings. <br />Guests can only
            view boards and can't edit anything.
          </p>
          <p
            class="rounded bg-yellow-50 p-3 border border-yellow-400 text-sm my-3"
          >
            New users, <b>won't</b> receive a notification email. <br />Once you
            have added them they can simply login with their email and this
            workspace will be available in their account.
          </p>
          <div>
            <div class="my-5">
              <div
                v-for="(user, user_index) of workspace.users"
                :key="user_index"
                class="flex py-1 items-center justify-between border-t first:border-t-0 border-gray-100"
              >
                <div class="flex gap-3">
                  <p class="font-semibold text-indigo-600">{{ user.email }}</p>
                  <div class="inline-flex">
                    <label class="flex items-center mr-4">
                      <input type="radio" value="admin" v-model="user.role" />
                      <div class="ml-2">Admin</div>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" value="guest" v-model="user.role" />
                      <div class="ml-2">Guest</div>
                    </label>
                  </div>
                </div>
                <button
                  class="text-red-600 px-3 text-sm rounded bg-red-50 border border-red-400"
                  @click="editUsers(user.email)"
                >
                  Delete
                </button>
              </div>
            </div>
            <!-- <div class='flex flex-wrap gap-2 py-3'>
						<span v-for="(email) in workspace.admins" :key="email"
							class="px-3 py-0.5 inline-flex items-center rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
							{{email}}
							<button type="button" @click="editAdmins(email)" v-show="email !== $auth.user.email"
								class="flex-shrink-0 -mr-0.5 ml-1.5 inline-flex text-red-500 focus:outline-none focus:text-indigo-700">
								<svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
									<path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
								</svg>
							</button>
						</span>
					</div> -->
            <div
              class="flex items-center border border-gray-200 rounded"
              v-if="
                workspace.plan_limits?.allowed_user_per_workspace >
                workspace.users?.length
              "
            >
              <input
                v-model="new_email"
                type="text"
                placeholder="Type an email to add a user"
                autocomplete="off"
                @keyup.enter="editUsers($event.target.value)"
                ref="new_email"
                class="my-form w-full border-0 rounded-r-none mr-1"
              />
              <svg
                @click="editUsers(new_email)"
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-teal-600 stroke-current mx-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="small-error text-xl font-semibold" v-else>
              <p>
                You reached the number of users you can add.<br />
                In your current plan you can add a maximum of
                {{ workspace.plan_limits?.allowed_user_per_workspace }} users.
              </p>
              <nuxt-link
                class="block btn mx-auto text-lg btn-indigo mt-8"
                to="/dashboard/account"
                >Upgrade your plan</nuxt-link
              >
            </div>
          </div>
        </div>
        <div>
          <p class="font-semibold mb-2">Google Account:</p>
          <div>
            <div v-if="workspace.token_email" class="subtitle mb-3">
              This workspace is connected to the
              <span class="underline">{{ workspace.token_email }}</span> Google
              account
            </div>
            <a
              :href="`//${CHARTMAT_BOARD_BASE_URL}/dashboard/auth?workspace_id=${workspace.id}`"
              class="bg-gray-100 border border-gray-300 text-black btn inline-flex items-center justify-center"
            >
              <svg
                class="h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 48 48"
              >
                <defs>
                  <path
                    id="a"
                    d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                  />
                </defs>
                <clipPath id="b">
                  <use xlink:href="#a" overflow="visible" />
                </clipPath>
                <path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
                <path
                  clip-path="url(#b)"
                  fill="#EA4335"
                  d="M0 11l17 13 7-6.1L48 14V0H0z"
                />
                <path
                  clip-path="url(#b)"
                  fill="#34A853"
                  d="M0 37l30-23 7.9 1L48 0v48H0z"
                />
                <path
                  clip-path="url(#b)"
                  fill="#4285F4"
                  d="M48 48L17 24l-4-3 35-10z"
                />
              </svg>
              <span>{{
                workspace.token_email ? "Refresh Connection" : "Connect Google"
              }}</span>
            </a>
          </div>
        </div>

        <div>
          <p class="font-semibold mb-2">Authorize AppScript:</p>
          <div class="mb-3">
            We need additional permission to execute Macros and Apps Script on
            your Google account.
          </div>
          <a
            class="bg-gray-100 border border-gray-300 px-5 py-2 rounded-md mt-3 text-gray-500 cursor"
            v-if="hasAppScriptAuthorization"
            >App Script Authorization Granted</a
          >
          <div v-else>
            <a
              class="bg-gray-100 border border-gray-300 px-5 py-2 rounded-md mt-3"
              :href="`//${CHARTMAT_BOARD_BASE_URL}/dashboard/auth?workspace_id=${workspace.id}&app_script=true`"
              >Authorize AppScripts</a
            >
            <input
              type="text"
              class="bg-transparent focus:bg-white focus:text-black rounded-md focus:shadow-md p-2 w-full"
            />
          </div>
        </div>
        <div>
          <p class="font-semibold mb-2">Delete Workspace:</p>
          <div>
            This will completely delete this workspace including all the boards
            it contains.
          </div>
          <button class="btn btn-red mt-3" @click="deleteWorkspace">
            Delete Workspace
          </button>
        </div>
      </div>

      <div class="mt-8 border-t border-gray-200 pt-8">
        <button
          class="btn btn-indigo w-full text-lg"
          @click="saveWorkspace"
          :class="{ loading }"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const slugify = require("slugify");
export default {
  props: {
    existing_workspace: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  async mounted() {

    const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');
    this.CHARTMAT_BOARD_BASE_URL = CHARTMAT_BOARD_BASE_URL;

    if (!this.$auth.user) {
      return;
    }
    Object.keys(this.existing_workspace || {}).forEach((k) => {
      this.workspace[k] = this.existing_workspace[k];
      if (k == "email_service") {
        this.email_service = JSON.parse(JSON.stringify(this.existing_workspace[k]));
      }
    });
    if (this.workspace.domain) {
      this.check_dns();
    }
  },
  data() {
    return {
      loading: false,
      new_email: "",
      new_domain: "",
      domain_dns: "loading",

      email_service: undefined,
      email_service_msg: "",
      sending_email: false,
      email_status: false,

      workspace: {
        edit_email_provider: false,

        name: "",
        admins: [],
        users: [],
        palette: ["#ffe438", "#88dd20", "#ffe438", "#88dd20"],
        subdomain: "",
        domain: "",
        favicon: "",
        email_service: {
          provider: "chartmat",
          postmark_key: "",
          sender_email: "",
          sender_name:"",
        },
      },
      CHARTMAT_BOARD_BASE_URL : ''
    };
  },
  computed: {
    hasAppScriptAuthorization() {
      return this.existing_workspace.token_scope?.includes(
        "https://www.googleapis.com/auth/script.scriptapp"
      );
    },
    subdomain: {
      get() {
        return this.workspace.subdomain;
      },
      set(v) {
        this.workspace.subdomain = slugify(v, {
          lower: true,
          strict: true,
          locale: "en",
          trim: true,
        });
      },
    },
  },
  methods: {
    async test_email() {
      this.sending_email = true;
      try {
        this.email_service_msg = "";
        const res = await this.$axios.$post(`/api/test-email`, {
          email_service: this.workspace.email_service,
          to_email: this.$auth.user.email,
        });
        this.email_status = res.success;
        if (!res.success) {
          this.email_service_msg = res.msg;
        } else {
          this.email_service_msg = `Test email has been sent to ${this.$auth.user.email}.`;
        }
      } catch (e) {
        console.log(e);
      }
      this.sending_email = false;
    },

    edit_email_provider() {
      this.workspace.edit_email_provider = !this.workspace.edit_email_provider;
      if (this.workspace.edit_email_provider) {
        // editing
        this.workspace.email_service.postmark_key = "";
      } else {
        // editing canceled
        this.workspace.email_service = JSON.parse(JSON.stringify(this.email_service));
      }
    },
    async update_local_image(file) {
      const vm = this;
      var input = file.target;
      // If not file selected, no change
      if (!input.files[0]) {
        return;
      }
      const file_size = input.files[0].size / 1024;
      if (file_size > 500) {
        alert(
          `Uploaded File size is ${file_size}KB. File size should not exceed 500KB..`
        );
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var dataURL = reader.result;
        var image = new Image();

        //Set the Base64 string return from FileReader as source.
        image.src = dataURL;

        //Validate the File Height and Width.
        image.onload = function () {
          var height = this.height;
          var width = this.width;
          if (height != width) {
            alert("Icon must be square.");
            return;
          }
          vm.workspace.favicon = dataURL;
        };
      };
      reader.readAsDataURL(input.files[0]);
    },

    editUsers(email = "") {
      if (!email.length) {
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert(`The email address: "${email}" is not valid`);
        return;
      }
      const users = JSON.parse(JSON.stringify(this.workspace.users));
      const index = users.findIndex((i) => i.email === email);

      if (index > -1) {
        users.splice(index, 1);
        // this.workspace.users = this.workspace.users.filter(u => u.email === email) // .splice(index, 1)
      } else {
        users.push({ email: email.toLowerCase(), role: "guest" });
      }
      this.$set(this.workspace, "users", JSON.parse(JSON.stringify(users)));
      this.new_email = "";
    },

    editAdmins(email = "") {
      if (!email.length) {
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert(`The email address: "${email}" is not valid`);
        return;
      }
      const arr = this.workspace.admins;
      const index = arr.findIndex((i) => i === email);
      if (index > -1) {
        this.workspace.admins.splice(index, 1);
      } else {
        this.workspace.admins.push(email);
      }
      this.new_email = "";
    },

    async saveWorkspace() {
      if (!this.workspace.name.length) {
        alert("You need to add a valid name for this workspace");
        return;
      }

      if (this.workspace.edit_email_provider) {
        if (this.workspace.email_service.provider == "postmark") {
          if (
            !this.workspace.email_service.sender_email ||
            !this.workspace.email_service.postmark_key
          ) {
            alert("You need to add a valid sender email and postmark api key");
            return;
          }
        }
      }

      if (!this.workspace.subdomain.length) {
        alert("You need to add a valid subdomain");
        return;
      }
      this.loading = true;

      // Upload file
      const uploadResponse = await this.upload_file();

      // Update logo field if logo is uploaded.
      if (uploadResponse["favicon"]) {
        this.workspace.favicon = uploadResponse["favicon"];
      }

      try {
        await this.$axios.$put(`/api/board/workspace`, this.workspace);
        alert("Settings saved");
        this.$router.go();
      } catch (e) {
        console.log(e.message); // alert() comes automatically
      }
      this.loading = false;
    },

    async deleteWorkspace() {
      const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');

      const msg =
        "Are you sure you want to cancel this workspace and all its boards? This action is not reversible!";
      if (confirm(msg)) {
        await this.$axios.$delete(`/api/board/workspace`);
        window.location.href = `//${CHARTMAT_BOARD_BASE_URL}/dashboard`;
      }
    },

    async upload_file() {
      const file_inputs = document.querySelectorAll(".chartmat-file-input");
      const files = {};
      if (file_inputs.length) {
        for (const file of file_inputs) {
          const formData = new FormData();
          formData.append(file.name, file.files[0]);
          const url = await this.$axios.$post("/api/upload-file", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          files[file.name] = url;
        }
      }
      return files;
    },

    async addDomain() {
      //
      const domain = this.new_domain.startsWith("http")
        ? this.new_domain
        : `https://${this.new_domain}`;
      try {
        new URL(domain);
      } catch (e) {
        alert(`The domain ${domain} seems invalid`);
        return;
      }
      await this.$axios.$post("/api/workspaces/custom-domain", { domain });
      alert(
        "Domain added successfully. Remember to setup the correct DNS records"
      );
      this.workspace.domain = domain;
      await this.check_dns();
    },

    async check_dns() {
      this.domain_dns = "loading";
      this.domain_dns = await this.$axios.$get("/api/workspaces/custom-domain");
    },

    async appScripts() {
      const res = await this.$axios.$get("/api/enable-appscripts");
    },

    async delete_domain() {
      await this.$axios.$delete("/api/workspaces/custom-domain");
      alert("Domain Deleted!");
      this.workspace.domain = null;
    },
  },
};
</script>

<style>
</style>
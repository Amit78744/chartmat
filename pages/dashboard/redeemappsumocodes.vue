<template>
  <div class="w-full md:w-2/3 box-padding">
    <div v-show="loginStep == 4">Loading...</div>
    <div class="p-2 md:px-12 md:py-20">
      <div v-show="loginStep == 1">
        <div>
          <h1
            class="text-2xl leading-8 font-extrabold text-gray-900 sm:text-3xl sm:leading-9"
          >
            Hey Sumo-lings!
          </h1>
          <p class="mt-3 text-lg leading-6 text-gray-700">
            Type your email address and AppSumo Codes to get <b>lifetime access</b>. Multiple code can be applied to redeem all at once or you can redeem one to start using base plan and upgrade later by redeeming other codes.
          </p>
        </div>
        <div class="w-full md:w-2/3 sm:w-full">
          <form @submit.prevent="sendMagicLink" class="mt-8 gap-6">
            <div class="">
              <label class="sr-only" for="email-address">Email Address</label>
              <input
                id="email-address"
                name="email"
                autocomplete="on"
                v-model="email"
                aria-label="Email address"
                required
                type="email"
                class="appearance-none w-full px-5 py-3 border border-gray-300 focus:border-emerald-400 text-base leading-6 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 transition duration-150 ease-in-out shadow-lg"
                placeholder="Type your email here"
              />
            </div>
            <div class="mt-4 grid grid-cols-5">
              <label class="sr-only" for="email-address">AppSumo Code</label>
              <div class="col-span-3">
                <input
                  id="email-address"
                  name="code"
                  autocomplete="on"
                  v-model="code"
                  @keydown.enter.prevent="applyCode"
                  aria-label="AppSumo Code"
                  type="text"
                  class="appearance-none w-full px-5 py-3 border border-gray-300 focus:border-emerald-400 text-base leading-6 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 transition duration-150 ease-in-out shadow-lg"
                  placeholder="Type your AppSumo code"
                />
              </div>
              <div class="px-2 col-span-2">
                <button
                  @click="applyCode"
                  type="button"
                  :disabled="verifyingCode"
                  class=" bg-emerald-500 hover:bg-emerald-400 shadow-lg h-full rounded-md text-white w-full px-4"
                >
                  <span v-if="verifyingCode">
                    <svg
                      class="animate-spin h-5 w-5 text-white mx-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                  <span v-else>Redeem</span>
                </button>
              </div>
            </div>

            <div v-if="couponCodeError" class="text-rose-700 px-2 mt-4">
              {{ couponCodeError }}
            </div>

            <div class="my-4">
              <div v-if="appliedCodes.length > 0">
                <div class="flex">
                  <div
                    v-for="(code, index) in appliedCodes"
                    :key="code"
                    class="bg-zinc-200 m-2 px-3 py-2 rounded flex max-w-fit "
                  >
                    <span class="text-md font-medium text-black">
                      {{ code }}
                    </span>
                    <span
                      class="ml-2 text-gray-400 h-4 w-4"
                      @click="removeCode(index)"
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="w-auto rounded-md px-2">
                  No AppSumo codes applied.
                </div>
              </div>
            </div>
            <button
              :disabled="appliedCodes.length == 0"
              type="submit"
              :class="{ loading }"
              class="shadow-lg  w-full mt-4 flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:bg-emerald-400 transition duration-150 ease-in-out"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      <div v-show="loginStep == 2">
        <div class="text-gray-900">
          <svg class="w-24 h-24 fill-current" viewBox="0 0 24 24">
            <path
              d="M13 17H17V14L22 18.5L17 23V20H13V17M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H11V18H4V8L12 13L20 8V14H22V6A2 2 0 0 0 20 4M12 11L4 6H20Z"
            />
          </svg>
          <h2 class="text-4xl font-bold text-gray-900">Email sent!</h2>
          <h3 class="text-xl mt-3 text-gray-800">
            Click on the link in your
            <span class="text-emerald-500 font-semibold tracking-wide">{{
              email
            }}</span>
            inbox to login.
          </h3>
        </div>
      </div>

      <div v-show="loginStep == 3" class="text-gray-800">
        <h2 class="text-4xl font-bold">Logging you in...</h2>
        <h3 class="text-xl mt-3 text-gray-700">One second...</h3>
      </div>
      <div class="small-error mt-10" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
export default {
  layout: "main",
  head() {
    return {
      title: "Chartmat Login",
    };
  },
  data() {
    return {
      loading: false,
      email: "",
      code: "",
      appliedCodes: [],
      couponCodeError: "",
      error: null,
      verifyingCode: false,
      loginStep: 1, // Can be 1, 2, 3 or 4
      query: {},
    };
  },

  methods: {
    removeCode(index) {
      this.appliedCodes.splice(index, 1);
      this.couponCodeError = "";
    },
    applyCode() {
      const vm = this;
      if (vm.appliedCodes.length == 5) {
        vm.couponCodeError = "Maximum 5 AppSumo code can be redeemed at once.";
        return;
      } else if (vm.appliedCodes.includes(vm.code)) {
        vm.couponCodeError = "AppSumo code already applied.";
        return;
      } else if (vm.code.trim() == "") {
        vm.couponCodeError = "AppSumo code can not be empty.";
        return;
      }
      vm.verifyingCode = true;
      vm.$axios
        .post("/api/validate/appsumo_code", {
          coupon_code: vm.code,
        })
        .then((r) => {
          if (!r.data.valid) {
            vm.couponCodeError = r.data.msg.trim();
            return;
          }
          vm.appliedCodes.push(vm.code);
          vm.code = "";
          vm.couponCodeError = "";
        })
        .finally(() => {
          vm.verifyingCode = false;
        });
    },
    async sendMagicLink() {
      const vm = this;
      const valid = /\S+@\S+\.\S+/.test(vm.email);
      if (!valid) {
        vm.error = `${vm.email} is not a valid email address`;
        return;
      }
      const email = vm.email;
      const appsumo_code = vm.appliedCodes;
      vm.loading = true;
      vm.$axios
        .post("/api/billing/appsumo", {
          email: email,
          appsumo_code: appsumo_code,
          action: "activate",
        })
        .then((r) => {
          if (r.data.status == "error") {
            vm.couponCodeError = r.data.msg.trim();
            return;
          }
          vm.loginStep = 2;
        })
        .catch((e) => {
          vm.error = vm.errorMsg(e);
          vm.loginStep = 1;
        });
      vm.loading = false;
      vm.step = 2;
    },
    redirect_to_boards() {
      this.$router.push({ path: "/dashboard", query: {} });
    },
    async convertToken(shortLifeToken) {
      this.error = null;
      this.loginStep = 3;
      try {
        await this.jwt_login(shortLifeToken, "email");
      } catch (e) {
        this.loginStep = 1;
        this.error = this.errorMsg(e);
      }
    },

    async logout() {
      await this.$axios.setToken(false);
      await this.$auth.logout();
      if (this.$sentry) {
        this.$sentry.configureScope((scope) => scope.setUser(null));
      }
      this.loginStep = 1;
      // window.location.href = this.$route.query.next || "/"
    },
  },
};
</script>

<style>
</style>

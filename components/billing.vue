<template>
  <div>
    <script>
      (function (w, r) {
        w._rwq = r;
        w[r] =
          w[r] ||
          function () {
            (w[r].q = w[r].q || []).push(arguments);
          };
      })(window, "rewardful");
    </script>
    <script
      async
      src="https://r.wdfl.co/rw.js"
      data-rewardful="ed7792"
    ></script>


    <div
      v-if="appsumo_plan"
      class="bg-yellow-100 p-3 rounded border border-yellow-400 mb-5"
    >
      <p class="text-2xl font-semibold">
        Lifetime license ({{ appsumo_plan.nice_name }})
      </p>
      <p class="text-sm italic mb-4">
        This account is linked to a lifetime license
      </p>
      <ul class="list list-inside list-disc">
        <li v-for="feature in appsumo_plan.features" :key="feature">
          {{ feature }}
        </li>
      </ul>

      <div
        class="bg-teal-50 p-6 w-full rounded-lg text-center text-lg text-teal-700 border border-teal-700 font-semibold mt-5"
      >
        Need more workspaces? Upgrade to Enterprise with 80% discount with the
        code <span class="tag">AppSumo</span>
      </div>
    </div>

    <div v-if="current_user.paddle_cancel_url">
      <!-- PADDLE.COM -->
      <p>
        You are currently on our discounted
        <b class="font-bold">enterprise</b> plan!
      </p>
      <a
        v-show="current_user.paddle_cancel_url"
        :href="current_user.cancel_url"
        target="_blank"
        class="btn btn-red mt-1"
        >Cancel Subscription</a
      >
    </div>

    <div
      v-if="current_user.stripe_connected && !current_user.lifetime_campaign"
      class="mb-6"
    >
      <!-- STRIPE.COM -->
      <div
        v-if="current_user.stripe_status == 'canceled'"
        class="small-error text-center py-10 px-5 md:p-10 text-xl font-semibold"
      >
        Your current plan has expired. Select a new plan from below to
        resubscribe.
      </div>
      <div v-else>
        <ul class="max-w-xl">
          <li
            class="border-b border-gray-100 py-2 capitalize"
            v-for="(val, key) in items"
            :key="key"
          >
            {{ key | beautify }}: {{ val }}
          </li>
        </ul>
          <!-- :href="user.cancel_url" -->
        <a
          @click="openPortal()"
          target="_blank"
          class="btn btn-green mt-4"
          >Manage Subscription</a
        >
      </div>
    </div>

    <div
      v-if="lifetime_campaign && lifetime_campaign.includes('appsumo')"
      class="bg-yellow-100 p-3 rounded border border-yellow-400 mb-5"
    >
      <p class="text-2xl font-semibold">
        Lifetime license ({{ current_plan }})
      </p>
      <p class="text-sm italic mb-4">
        This account is linked to a lifetime license.
      </p>
      <input
        placeholder="Apply additional AppSumo code"
        v-model="appsumo_code"
        @keydown.enter="upgradePlan"
        class="appearance-none w-full px-5 py-3 border border-gray-300 focus:border-emerald-400 text-base leading-6 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 transition duration-150 ease-in-out shadow-lg"
      />
      <div v-if="couponCodeError" class="text-rose-700 px-2 mt-4">
        {{ couponCodeError }}
      </div>
      <button
        class="mt-4 bg-blue-500 hover:bg-blue-400 shadow-lg h-full rounded-md text-white w-auto p-2"
        @click="upgradePlan"
      >
        <span v-if="upgrading">
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
        <span v-else>Redeem and Upgrade</span>
      </button>
    </div>

    <div
      v-if="lifetime_campaign && lifetime_campaign.includes('chartmat')"
      class="bg-yellow-100 p-3 rounded border border-yellow-400 mb-5"
    >
      <p class="text-2xl font-semibold">
        Lifetime license ({{ current_plan }})
      </p>
      <p class="text-sm italic mb-4">
        This account is linked to a lifetime license.
      </p>
    </div>

    <Pricing
      v-if="
        !appsumo_plan && !current_user.paddle_cancel_url && !lifetime_campaign
      "
      :has_plan="current_plan != 'free'"
      :showtext="showtext"
      :startpage="startpage"
    ></Pricing>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
    },
    showtext:{},
    startpage:{default:false}
  },
  data() {
    return {
      loading_plan: null,
      appsumo_code: "",
      upgrading: false,
      couponCodeError: "",
      email: "",
      appsumo_tiers: [
        {
          name: "chartmat_tier1",
          nice_name: "Tier 1",
          features: [
            "1 workspace",
            "5 users per workspace",
            "All pro plan features",
            "Lifetime access",
          ],
        },
        {
          name: "chartmat_tier2",
          nice_name: "Tier 2",
          features: [
            "3 workspaces",
            "15 users per workspace",
            "All pro plan features",
            "Lifetime access",
          ],
        },
        {
          name: "chartmat_tier3",
          nice_name: "Tier 3",
          features: [
            "10 workspaces",
            "Unlimited users",
            "All pro plan features",
            "Lifetime access",
          ],
        },
        {
          name: "chartmat_tier4",
          nice_name: "Tier 4",
          features: [
            "25 workspaces",
            "Unlimited users",
            "All pro plan features",
            "Lifetime access",
          ],
        },
        {
          name: "chartmat_tier5",
          nice_name: "Tier 5",
          features: [
            "100 workspaces",
            "Unlimited users",
            "All pro plan features",
            "Lifetime access",
          ],
        },
      ],
      pro_features: [
        "Unlimited Boards",
        "Unlimited rows",
        "Add up to 5 team members",
        "Public & private boards",
        "Embed boards & blocks in your site",
      ],
      enterprise_features: [
        "All pro features",
        "Add up to 15 team members",
        "Full API access",
        "Single Sign On",
      ],
      plans: [
        // {
        // 	name:'free',
        // 	price:0,
        // 	features:[
        // 		"Unlimited Board",
        // 		"First 100 rows only",
        // 		"One team members",
        // 		"Public boards only"
        // 	]
        // },
        {
          name: "pro",
          price: 29,
          features: [
            "Unlimited Boards",
            "Unlimited rows",
            "Add up to 5 workspaces",
            "Add up to 5 team members per workspace",
            "Public & private boards",
            "Embed boards & blocks in your site",
            "Custom domain with SSL",
          ],
        },
        {
          name: "enterprise",
          price: 99,
          features: [
            "Unlimited Boards",
            "Unlimited rows",
            "Unlimited Workspaces",
            "Unlimited Team Members",
            "Public & private boards",
            "Embed boards & blocks in your site",
            "Custom domain with SSL",
          ],
        },
      ],
    };
  },
  computed: {
    lifetime_campaign() {
      return this.user?.lifetime_campaign;
    },
    current_user() {
      return this.user ?? {};
    },
    appsumo_plan() {
      const plans = [
        {
          name: "chartmat_tier1",
          nice_name: "Tier 1",
          features: [
            "1 workspace",
            "5 users per workspace",
            "All pro plan features",
            "Lifetime access",
          ],
        },
        {
          name: "chartmat_tier2",
          nice_name: "Tier 2",
          features: [
            "3 workspaces",
            "15 users per workspace",
            "All pro plan features",
            "Lifetime access",
          ],
        },
        {
          name: "chartmat_tier3",
          nice_name: "Tier 3",
          features: [
            "10 workspaces",
            "Unlimited users",
            "All pro plan features",
            "Lifetime access",
          ],
        },
        {
          name: "chartmat_tier4",
          nice_name: "Tier 4",
          features: [
            "25 workspaces",
            "Unlimited users",
            "All pro plan features",
            "Lifetime access",
          ],
        },
        {
          name: "chartmat_tier5",
          nice_name: "Tier 5",
          features: [
            "100 workspaces",
            "Unlimited users",
            "All pro plan features",
            "Lifetime access",
          ],
        },
      ];
      return plans.find((tier) => tier.name === this.user?.plan);
    },
    appsumo_plan_index() {
      return this.appsumo_tiers.findIndex(
        (tier) => tier.name === this.user.plan
      );
    },
    current_plan() {
      const user_plan = this.user?.plan ?? "free";
      if (user_plan.startsWith("chartmat_tier")) {
        return "pro";
      } else {
        return user_plan;
      }
    },
    active() {
      if (!this.user) {
        return false;
      }
      return (
        this.user.plan &&
        this.user.stripe_status !== "cancelled" &&
        this.user.plan !== "free"
      );
    },
    items() {
      return {
        cancel_at: this.user?.stripe_cancel_at || "None",
        next_renewal: this.user?.stripe_current_period_end
          ? new Date(this.user.stripe_current_period_end * 1000)
              .toISOString()
              .slice(0, 10)
          : "None",
        plan: this.user.plan || "free",
      };
    },
  },
  methods: {
    upgradePlan() {
      const vm = this;
      if (!vm.appsumo_code.trim()) {
        vm.couponCodeError = "AppSumo code can not be empty.";
        return;
      }
      vm.upgrading = true;
      vm.$axios
        .post("/api/billing/appsumo", {
          email: vm.user.email,
          appsumo_code: vm.appsumo_code.trim(),
          action: "upgrade",
        })
        .then((r) => {
          if (r.data.status == "error") {
            vm.couponCodeError = r.data.msg.trim();
            return;
          }
          location.reload();
        })
        .catch((e) => {
          vm.error = vm.errorMsg(e);
        })
        .finally(() => {
          vm.upgrading = false;
        });
    },
    async openPortal() {
      window.location.href = await this.$axios.$put(`/api/billing`, {});
    },
    
    async upgrade(plan_name) {
      this.loading_plan = plan_name;
      const email = this.email;
      let rewardful_referral = null;
      try {
        rewardful_referral = Rewardful.referral;
      } catch (e) {}
      const plan_url = await this.$axios.$patch("/api/billing", {
        plan_name,
        email,
        rewardful_referral
      });
      this.loading_plan = null;
      window.location.href = plan_url;
    },
  },
};
</script>

<style>
</style>
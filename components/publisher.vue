<template>
  <ul
    v-if="
      user.stripe_account &&
      user.stripe_account.charges_enabled &&
      user.stripe_account.details_submitted
    "
  >
    <li class="border-b border-gray-100 py-2 capitalize">
      Stripe Account ID : {{ user.stripe_account.id || "-" }}
    </li>
    <li class="border-b border-gray-100 py-2 capitalize">
      Account Status:
      {{ user.stripe_account.payouts_enabled ? "Enabled" : "Disabled" }}
    </li>
    <ThemeButton
      @click.native="userDashboard"
      :spinner="gettingStripSetupURL"
      btn_class="btn btn-green mt-4"
      caption="View dashboard"
    ></ThemeButton>
  </ul>

  <div v-else-if="user.stripe_account">
    <p class="mb-5 p-2 bg-yellow-100 rounded-md">
      Your Stripe Connect account setup is ongoing. The submitted details will be verified by Stripe and the status will be notified to you on your email address. Click the below button to update or submit any additional information.
    </p>
    <ThemeButton
      @click.native="resumeOnBoard"
      :spinner="gettingStripSetupURL"
      btn_class="btn btn-green mt-4"
      caption="Update your account"
    ></ThemeButton>
  </div>
  <div v-else>
    <ThemeButton
      btn_class="btn btn-green mt-4"
      @click.native="connectToStripe"
      :spinner="gettingStripSetupURL"
      caption="Connect stripe"
    ></ThemeButton>
  </div>
</template>

<script>
export default {
  props: ["user"],

  data() {
    return {
      gettingStripSetupURL: false,
    };
  },

  methods: {
    async userDashboard() {
      try {
        const CHARTMAT_STRIPE_PRIVATE_KEY = await this.$axios.$get('/api/getENV/CHARTMAT_STRIPE_PRIVATE_KEY');

        this.gettingStripSetupURL = true;
        const res = await this.$private_api.post(
          `https://api.stripe.com/${this.user.stripe_account.login_links.url}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${CHARTMAT_STRIPE_PRIVATE_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        window.location.href = res.data.url;
      } catch (e) {
        console.error(e);
      } finally {
        this.gettingStripSetupURL = false;
      }
    },
    async resumeOnBoard() {
      try {
        this.gettingStripSetupURL = true;
        const res = await this.$axios.get("/api/publisher", {
          params: {
            account_id: this.user.stripe_account.id,
          },
        });
        window.location.href = res.data.url;
      } catch (e) {
        console.error(e);
      } finally {
        this.gettingStripSetupURL = false;
      }
    },
    async connectToStripe() {
      try {
        this.gettingStripSetupURL = true;
        const res = await this.$axios.get("/api/publisher");
        window.location.href = res.data.url;
      } catch (e) {
        console.error(e);
      } finally {
        this.gettingStripSetupURL = false;
      }
    },
  },
};
</script>
<template>
  <div class="box-padding">
    <div v-show="$fetchState.pending">
      <p>Loading account...</p>
    </div>
    <div v-show="!$fetchState.pending" class="space-y-10">
      <div>
        <h1 class="text-3xl font-bold mb-2">Account</h1>
        <p>
          You are logged in as: {{ $auth.user.email }}
          <a
            href="/dashboard/auth?logout=true"
            class="text-red-600 bg-red-50 border border-red-100 rounded py-1 px-3 text-xs uppercase font-semibold hover:bg-red-100"
            >logout</a
          >
        </p>
      </div>
      <div>
        <div
          class="flex border max-w-fit items-center"
          style="border-radius: 40px"
        >
          <button
            class="px-4 py-2 capitalize cursor-pointer font-medium"
            style="border-radius: 40px"
            :class="{ 'bg-grad text-white': tab == 'billing' }"
            @click.prevent="tab = 'billing'"
          >
            Billing Details
          </button>
          <button
            class="px-4 py-2 capitalize cursor-pointer font-medium"
            style="border-radius: 40px"
            :class="{ 'bg-grad text-white': tab == 'publisher' }"
            @click.prevent="tab = 'publisher'"
          >
            Marketplace Details
          </button>
        </div>
        <!-- <h1 class='text-3xl font-bold mb-2'> Billing </h1> -->
        <div class="mt-8" v-if="tab == 'billing'">
          <div v-if="loading">Loading billing...</div>
          <billing
            :user="user"
            :showtext="false"
            :startpage="false"
            v-else
          ></billing>
        </div>
        <!-- <h1 class='text-3xl font-bold mb-2'> Publisher </h1> -->
        <div class="mt-8" v-if="tab == 'publisher'">
          <div v-if="loading">Loading publisher...</div>
          <publisher
            :user="user"
            :showtext="false"
            :startpage="false"
            v-else
          ></publisher>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: "auth",
  layout: "main",
  fetchOnServer: false,
  head() {
    return {
      title: "Account Settings",
    };
  },
  data() {
    return {
      tab: "billing",
      user: {},
      loading: false,
    };
  },
  async fetch() {
    this.loading = true;
    this.user = await this.$axios.$get("/api/auth/db-user");
    this.loading = false;
  },
};
</script>

<style>
.bg-grad,
.get-started-btn {
  background: linear-gradient(90.04deg, #4f46e5 -5.12%, #00f1f5 116.3%);
  border-radius: 8px;
}
.bg-grad:hover,
.get-started-btn:hover {
  background: linear-gradient(269.94deg, #4f46e5 -2.83%, #00f1f5 114.84%);
  border-radius: 8px;
}
</style>
<template>
  <div class="box-padding">
    <div v-show="$fetchState.pending">
      <p>Loading marketplace...</p>
    </div>
    <div v-show="!$fetchState.pending" class="space-y-10 p-4">
      <div class="grid grid-cols-5">
        <div>
          <h4 class="text-sm text-gray-500 font-semibold uppercase">
            Categories
          </h4>
          <li
            v-for="category of categories"
            :key="category"
            class="list-none text-md capitalize mt-2"
            :class="{ 'font-semibold': active == category }"
          >
            <a href="#" @click.prevent="refreshList(category)">
              {{ category }}
            </a>
          </li>
        </div>
        <div class="col-span-4">
          <div class="w-full">
            <div class="" v-if="loading">Loading available templates...</div>
            <div
              v-else-if="!loading && templates.length == 0"
              class="text-lg font-bold"
            >
              <h5>No templates found for in <u>{{ category }}</u> category.</h5>
            </div>
            <div
              v-else
              class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 px-10 mb-10"
            >
              <TemplateItem :template="t" v-for="t of templates" :key="t.id" class="mb-10"/>
            </div>
          </div>
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
      title: "Marketplace",
    };
  },
  data() {
    return {
      user: {},
      loading: false,
      templates: [],
      category: "",
    };
  },
  async fetch() {
    this.loading = true;
    this.templates = await this.$axios.$get("/api/marketplace/templates");
    this.loading = false;
  },
  methods: {
    async refreshList(category) {
      this.loading = true;
      this.category = category;
      this.templates = await this.$axios.$get("/api/marketplace/templates", {
        params: { category: category },
      });
      this.loading = false;
    },
  },
  computed: {
    categories() {
      return [
        "All templates",
        "AI",
        "Operations & Field",
        "HR & Hiring",
        "Sales & CRM",
        "Portals & Dashboards",
        "Project Management",
        "Event Management",
        "Education & Nonprofits",
        "Personal"
      ];
    },
  },
};
</script>

<style>
</style>
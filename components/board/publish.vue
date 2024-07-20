<template>
  <div class="max-w-lg p-6 bg-white min-h-screen">
    <h1 class="text-2xl font-bold mb-6">
      Publish your board to Chartmat marketplace
    </h1>
    <div v-if="!public">
      <h1>Only public boards can be listed on the marketplace.</h1>
    </div>
    <div v-else>

      <!-- v-if="
          user.stripe_account &&
          user.stripe_account.charges_enabled &&
          user.stripe_account.details_submitted
        " -->

      <form @submit.prevent="makeReviewRequest">
        <p v-if="form.status == 'pending'" class="text-lg bg-yellow-50 px-5 py-2 rounded-md text-center">
          Your board is under review.
        </p>
        <p v-if="form.status == 'published'" class="text-lg bg-green-50 px-5 py-2 rounded-md text-center">
          Your board is published on marketplace.
        </p>

        <fieldset :disabled="form.status">
          <objForm :obj.sync="form" :config="publishForm" />
          <button class="btn btn-indigo" v-if="!form.status">
            <spinner v-if="savingRequest" />
            Request for review
          </button>
        </fieldset>
      </form>

      <!-- <div v-else>
        Seller account is not active, Please setup seller account from
        <a href="/dashboard/account"> Accounts</a>.
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  mounted() {
    const vm = this;
    vm.$axios.$get("/api/board/db-user").then((user) => {
      vm.user = user;
      vm.$axios
        .get(`/api/marketplace/review-request/board`)
        .then((response) => {
          if (response?.data?.reviewRequest) {
            vm.form = response.data.reviewRequest;
          }
        });
    });
  },
  computed: {
    ...mapState("board", ["public"]),
    publishForm() {
      return {
        description: {
          type: "textarea",
        },
        thumbnail: {
          type: "image",
          file_mime_type: "image/png, image/jpeg",
          description:
            "Thumbnail image will be shown as catalog image in marketplace. Recommended size (1920 x 1080)",
        },
        images: {
          type: "images",
          file_mime_type: "image/png, image/jpeg",
          description:
            "Maximum 5 images can be added.  Recommended size (1920 x 1080)",
        },
        category: {
          placeholder: "Select category",
          type: "select",
          options: [
            "AI",
            "Operations & Field",
            "HR & Hiring",
            "Sales & CRM",
            "Portals & Dashboards",
            "Project Management",
            "Event Management",
            "Education & Nonprofits",
            "Personal",
          ],
        },
        is_free: {
          type: "boolean",
          label: "Is free",
          description: "Publish template for free.",
          default: false,
        },
        price: {
          placeholder: "Template price",
          type: "number",
          label: "Price (USD)",
          description: "Amount in USD. Amount can not be less then $5.",
          hide: [["is_free", "==", true]]
        },
      };
    },
    defaultClass() {
      return "appearance-none w-full h-full ring-0 focus:outline-none border-b border-transparent bg-neutral-100 rounded-md py-3 px-3";
    },
  },
  methods: {
    async upload_file() {
      const file_inputs = document.querySelectorAll(".chartmat-file-input");
      const files = {};

      if (file_inputs.length) {
        for (const file of file_inputs) {
          files[file.name] = [];
          for (const f of file.files) {
            const formData = new FormData();
            formData.append(file.name, f);
            const url = await this.$axios.$post("/api/upload-file", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            if (file.files.length > 1) {
              files[file.name].push(url);
            } else {
              files[file.name] = url;
            }
          }
        }
      }
      return files;
    },

    async makeReviewRequest() {
      const vm = this;

      if (!vm.public) {
        alert("Only public boards can be listed on marketplace.");
        return;
      }

      console.log(vm.form);
      if (!vm.form.description || !vm.form.category || (!vm.form.is_free && !vm.form.price)) {
        alert("Please fill all the fields.");
        return;
      }

      // template is free, set price to 0
      if (!vm.form.is_free) {
        if (parseFloat(vm.form.price) < 5) {
          alert("Minimum price should be USD 5.");
          return;
        }
      }else{
        vm.form.price = 0.0;
      }

      vm.form.price = parseFloat(vm.form.price);
      vm.savingRequest = true;

      const uploadResponse = await this.upload_file();
      if (uploadResponse["thumbnail"].length > 0) {
        vm.form.thumbnail = uploadResponse["thumbnail"];
      }

      if (uploadResponse["images"]) {
        if (!vm.form.images) {
          vm.form.images = [];
        }

        if (Array.isArray(uploadResponse["images"])) {
          if (uploadResponse["images"].length > 5) {
            alert("Maximum 5 images can be added.");
            vm.savingRequest = false;
            return;
          }
          vm.form.images.push(...uploadResponse["images"]);
        } else {
          vm.form.images.push(uploadResponse["images"]);
        }
        console.log(vm.form.images);
      }

      if (!vm.form.thumbnail) {
        alert("Please fill all the fields.");
        vm.savingRequest = false;
        return;
      }

      vm.$axios
        .put(`/api/marketplace/review-request/board`, {
          form: {
            ...vm.form,
            preview_url: `${window.location.origin}${window.location.pathname}`,
          },
        })
        .then((response) => {
          alert("Template submitted for review");
          window.location.reload();
        })
        .finally(() => {
          vm.savingRequest = false;
        });
    },
  },
  data() {
    return {
      user: {},
      form: {
        thumbnail: "",
        images: [],
        category: "",
        price: 0.0,
      },
      savingRequest: false,
    };
  },
};
</script>
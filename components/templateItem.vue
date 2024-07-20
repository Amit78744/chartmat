<template>
  <div :key="template.id" class="bg-blueGray-50 text-black rounded-md w-full flex flex-col">
    <Dialog :visible.sync="display" :showHeader="true" header="   " contentStyle="width:1300px; height:700px;"
      :modal="true">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-4">
          <Galleria :value="sliderImages" :showItemNavigators="true" :showThumbnails="false">
            <template #item="slotProps">
              <img :src="slotProps.item" style="
                    min-width: 400px;
                    width: 100%;
                    max-height: 500px;
                    display: block;
                  " class="mb-6" />
            </template>
          </Galleria>
          <p>{{ template.description }}</p>
        </div>
        <div class="col-span-2">
          <h2 class="text-lg font-bold mb-4">{{ template.name }}</h2>
          <h3 class="font-bold text-2xl mb-4" v-if="template.price > 0">
            ${{ template.price }}
          </h3>
          <h3 class="font-bold text-2xl mb-4" v-else>Free</h3>
          <div class="flex mb-6">
          
            <button class="btn btn-indigo mr-2" v-if="(template.price > 0 || (template.workspace_id != 'cuZI5VUKBaSlaONppXiv'))" @click.once="purchaseTemplate">
              <Spinner v-show="preparingPurchaseLink" />Buy Template
            </button>
           
            <button class="btn btn-indigo mr-2" @click="previewTemplate(template.marketplace_preview_path)">
              Preview Template
            </button>
            <a :href="
              'https://docs.google.com/spreadsheets/d/' +
              template.marketplace_sheet_id
            " target="_blank">
              <img src="/template_preview_icon.png" class="ml-2" style="height: 38px" />
            </a>
          </div>
          <div class="mb-6">
            <p class="text-lg font-bold">Creator</p>
            <p class="text-lg mb-6s">{{ template.workspace.name }}</p>
          </div>
          <div class="mb-6">
            <p class="text-lg font-bold">Category</p>
            <p class="text-lg">{{ template.category }}</p>
          </div>
        </div>
      </div>
    </Dialog>

    <a target="_blank" @click.prevent="display = !display">
      <div class="rounded-xl p-8" :style="'background:' + template.catalogue_background + '; width:100%;'">
        <img :src="template.thumbnail" class="W-full shadow-lg" style="aspect-ratio: 1.6" width="100%" />
      </div>
      <div class="font-semibold mt-5 text-lg text-center">
        {{ template.name || template.title }}
      </div>
    </a>
  </div>
</template>


<style>
.p-dialog-header {
  margin-bottom: -3rem !important;
}
</style>

<script>
import Dialog from "primevue/dialog";
import Galleria from "primevue/galleria";

export default {
  computed: {
    sliderImages() {
      return [this.template.thumbnail, ...this.template.images];
    },
  },
  components: {
    Dialog,
    Galleria,
  },
  props: {
    template: {},
  },
  data() {
    return {
      preparingPurchaseLink: false,
      display: false,
    };
  },
  methods: {
    purchaseTemplate() {
      this.preparingPurchaseLink = true;
      this.$axios
        .get(`/api/purchase/template?catalog_id=${this.template.id}`)
        .then((res) => {
          if(res.data?.url){
          window.open(res.data.url, "_self");
          }
          window.location.reload();
        })
        .catch((e) => {
          this.preparingPurchaseLink = false;
        });
    },
    async previewTemplate(url) {
      const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');

      if (CHARTMAT_BOARD_BASE_URL == "localhost:3000") {
        window.open(
          `http://marketplace.${CHARTMAT_BOARD_BASE_URL}/${url}`,
          "_blank"
        );
        return;
      }
      window.open(
        `https://marketplace.${CHARTMAT_BOARD_BASE_URL}/${url}`,
        "_blank"
      );
    },
  },
};
</script>
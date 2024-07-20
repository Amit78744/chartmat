<template>
  <div>
    <div class="absolute w-100 h-100" id="popup">
      <Dialog
        :visible.sync="display"
        :modal="true"
        :baseZIndex="100000"
        class="bg-white p-0"
        v-for="(row, index) in json.filter((a, i) => i == selectedRow)"
        :key="index"
        :closable="false"
      >
        <div class="flex flex-col-reverse md:flex-row md:justify-between">
          <div
            class="
              rounded-lg
              grid
              m-1
              mt-0
              grid-cols-1
              sm:grid-cols-2
              content-center content-start
            "
          >
            <!-- Process Images  -->
            <div v-if="images.length > 0" class="pb-3">
              <div v-for="(ax, ax_index) in images" :key="'element' + ax_index">
                <div class="overflow-hidden px-3 pt-3">
                  <img
                    loading="lazy"
                    class="w-full h-auto bg-contain"
                    :src="row[ax.column]"
                  />
                </div>
              </div>
            </div>
            <!-- Process text & btn -->
            <div
              class="grid-col-1 pb-3"
              :class="{ 'md:col-span-2': images.length == 0 }"
            >
              <div v-for="(ax, ax_index) in texts" :key="'text' + ax_index">
                <div class="px-3 pt-3" :style="{ color: ax.font_color }">
                  <mrk2html
                    :markdown="row[ax.column]"
                    :style="'text-align:' + ax.alignment"
                  ></mrk2html>
                </div>
              </div>
              <div
                class="flex flex-wrap"
                :class="{
                  'justify-start': block.button_group_alignment == 'left',
                  'justify-end': block.button_group_alignment == 'right',
                  'justify-center':
                    !block.button_group_alignment ||
                    block.button_group_alignment == 'center',
                }"
              >
                <div
                  v-for="(ax, ax_index) in buttons"
                  class="max-w-fit"
                  :key="'btn' + ax_index"
                >
                  <div class="pt-3 px-3" v-if="ax.type === 'button'">
                    <a
                      class="btn block"
                      :style="{
                        'background-color': ax.background_color,
                        color: ax.font_color,
                        'border-radius': ax.round_button ? '20px' : '5px',
                      }"
                      @click.prevent="openLink(row[ax.column])"
                      >{{ ax.button_text }}</a
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            @click="display = false"
            class="w-100 flex justify-end mt-3 sm:mt-5 px-3"
          >
            <!-- close -->
            <svg
              class="w-6 h-6 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
        </div>
      </Dialog>
    </div>
    <div class="p-5">
      <div
        class="grid grid-cols-1 cursor-pointer"
        :class="{
          'sm:grid-cols-2': block.columns == 2,
          'sm:grid-cols-3': block.columns == 3,
          'sm:grid-cols-4': block.columns == 4,
        }"
      >
        <div
          v-for="(row, index) in json"
          :key="index"
          class="rounded-lg shadow-lg pb-3 m-2 flex flex-col justify-between"
          :style="{ background: block.element_background_color }"
          @click="
            () => {
              display = !display;
              selectedRow = index;
            }
          "
        >
          <!-- img and text -->
          <div>
            <div
              v-for="(ax, ax_index) in images_n_texts.filter(
                (a) => !a.hide_on_grid
              )"
              :key="'element' + ax_index"
            >
              <div v-if="ax.type === 'image'" class="overflow-hidden">
                <img
                  loading="lazy"
                  class="w-full h-auto object-cover"
                  :src="row[ax.column]"
                  :class="
                    ax.round_image
                      ? 'rounded-full aspect-square px-3 pt-3'
                      : 'aspect-video px-3 pt-3'
                  "
                />
              </div>

              <div
                class="px-3 pt-3"
                v-if="ax.type === 'text'"
                :style="{ color: ax.font_color }"
              >
                <mrk2html
                  :markdown="row[ax.column]"
                  :style="'text-align:' + ax.alignment"
                ></mrk2html>
              </div>
            </div>
          </div>

          <!-- Processing buttons separately -->
          <div>
            <div
              class="flex flex-wrap px-3"
              :class="{
                'justify-start': block.button_group_alignment == 'left',
                'justify-end': block.button_group_alignment == 'right',
                'justify-center':
                  !block.button_group_alignment ||
                  block.button_group_alignment == 'center',
              }"
            >
              <div
                v-for="(ax, ax_index) in block.axis.filter(
                  (a) => !a.hide_on_grid && a.type === 'button'
                )"
                :key="'btn' + ax_index"
                class="max-w-fit mt-3 mr-3"
              >
                <div v-if="ax.type === 'button'">
                  <a
                    class="btn block"
                    :style="{
                      'background-color': ax.background_color,
                      color: ax.font_color,
                      'border-radius': ax.round_button ? '20px' : '5px',
                    }"
                    @click.prevent.stop="openLink(row[ax.column])"
                    >{{ ax.button_text }}</a
                  >
                </div>
              </div>
            </div>
          </div>
          <!-- Buttons -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Dialog from "primevue/dialog";
export default {
  components: { Dialog },

  computed: {
    images_n_texts() {
      return (
        this.block.axis?.filter(
          (a) => a.type === "text" || a.type === "image"
        ) || []
      );
    },
    header() {
      return this.texts[0];
    },
    texts() {
      return this.block.axis?.filter((a) => a.type === "text") || [];
    },
    images() {
      return this.block.axis?.filter((a) => a.type === "image") || [];
    },
    buttons() {
      return this.block.axis?.filter((a) => a.type === "button") || [];
    },
  },
  props: {
    block: {
      type: Object,
    },
    json: {},
    columns: {
      default: [],
    },
  },
  data() {
    return {
      display: false,
      selectedRow: null,
    };
  },
  methods: {
    openLink(link) {
      window.open(link);
    },
  },
};
</script>

<style  scoped>
#popup :deep(.p-dialog-header) {
  display: none;
}

#popup :deep(.p-dialog) {
  padding: 0;
  width: 700px;
  background: #fff;

  @media only screen and (max-width: 600px) {
    width: 95%;
  }
}

#popup :deep(.p-dialog .p-dialog-content) {
  background: rgba(0, 0, 0, 0);
  padding: 0;
  width: 700px;

  @media only screen and (max-width: 600px) {
    width: 100%;
  }
}
</style>
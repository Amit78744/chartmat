<template>
  <div
    class="border rounded-md overflow-hidden"
    :style="{
      'border-color': block_border,
      'box-shadow': `0 4px 6px -1px ${block_shadow}, 0 2px 4px -2px ${block_shadow}`,
    }"
  >
    <div
      v-if="!api_response"
      class="bg-white rounded-lg py-32 shadow text-center h-full"
    >
      Loading data...
    </div>
    <div v-else-if="api_response.error" class="small-error py-32">
      {{ api_response.error }}
    </div>

    <div
      v-else
      :style="{ 'background-color': block.background_color }"
      class="h-full w-full overflow-hidden shadow-lg rounded"
    >
      <p
        v-show="block.title"
        class="text-lg font-bold p-3"
        :class="isWhite(block.background_color) ? 'text-white' : 'text-black'"
      >
        {{ block.title }}
      </p>
      <client-only>
        <component
          ref="block"
          :key="hex"
          :is="`blocks-${block.type}`"
          :block="block"
          :json="api_response.json"
          :columns="api_response.columns"
          :data="api_response.data"
        ></component>
      </client-only>
    </div>
  </div>
</template>

<script>
import blocksChart from "~/components/blocks/chart.vue";
import blocksTable from "~/components/blocks/table.vue";
import blocksGrid from "~/components/blocks/grid.vue";
import blocksForm from "~/components/blocks/form.vue";

import { mapState, mapGetters } from "vuex";
export default {
  props: {
    block: {
      type: Object,
    },
  },
  data() {
    return {
      hex: "show_block",
    };
  },
  computed: {
    ...mapState("board", ["sheets_data", "block_border", "block_shadow"]),
    ...mapGetters("board", ["filtered_data"]),
    api_response() {
      this.hex = JSON.stringify(
        this.filtered_data?.[this.block.sheet_title]?.json
      );
      // this.hex = Math.random()
      return this.filtered_data[this.block.sheet_title];
      // return this.sheets_data[this.block.sheet_title]
    },
  },
  methods: {
    download_csv() {
      if (this.$refs.block.downloadCSV) {
        this.$refs.block.downloadCSV();
      }
    },
  },
};
</script>

<style>
</style>
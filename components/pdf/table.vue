<template>
  <div v-if="api_response">
    <h3 class="pl-4 py-2" style="border-bottom: 1px solid rgb(148 163 184);border-collapse: collapse;">{{ block.title }}</h3>
    <table  cellspacing="0" class="w-full mt-2 h-full border-collapse">
      <thead class="bg-slate-200">
        <tr class="text-left">
          <th
            class="pb-3 px-3"
            v-for="h in block.axis
              .filter((ax) => !ax.hidden)
              .map((ax) => ax.column)"
            :key="h"
          >
            <div class="inline-flex items-center justify-center">
              <span class="text-sm font-semibold">{{ h }}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="">
        <tr
          class="text-gray-600"
          v-for="(row, row_index) in api_response.json"
          :key="row_index"
        >
          <td
            v-for="header in block.axis
              .filter((ax) => !ax.hidden)
              .map((ax) => ax.column)"
            :key="header"
            class="pb-3 px-3 text-sm"
            style="border-bottom: 1px solid rgb(148 163 184);border-collapse: collapse;"
          >
            <mrk2html
              v-if="settings_per_header[header].use_markdown"
              :markdown="row[header]"
            ></mrk2html>
            <div v-else class="break-all">{{ row[header] }}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
 


<script>
import { mapState, mapGetters } from "vuex";
export default {
  props: {
    block: {},
  },
  computed: {
    ...mapState("board", ["sheets_data", "block_border", "block_shadow"]),
    ...mapGetters("board", ["filtered_data"]),
    api_response() {
      return this.filtered_data[this.block.sheet_title];
    },
    settings_per_header() {
      return Object.fromEntries(this.block.axis.map((ax) => [ax.column, ax]));
    },
  },
};
</script>
    

<template>
  <div
    class=""
    :style="'background:' + axis.background_color + ';color:' + axis.font_color"
  >
    <p class="text-3xl font-bold">
      {{ axis.symbol }} {{ calculationResult || "..." }}
    </p>
    <p class="text-sm mt-2">{{ axis.label || axis.source_column }}</p>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  props: {
    axis: {},
    json: {},
  },
  computed: {
    ...mapState("board", ["sheets_data", "spreadsheetId", "sheets"]),

    ...mapGetters("board", ["filtered_data"]),

    calculationResult() {
      let data = this.filtered_data?.[this.axis.source_sheet]?.json;
      let result;
      if (data) {
        switch (this.axis.function) {
          case "last row": {
            result = data.length ? data[data.length - 1][this.axis.source_column] : "";
            break;
          }
          case "first row": {
            result = data.length ? data[0][this.axis.source_column] : "";
            break;
          }

          case "sum":
            result = data.reduce(
              (t, c) =>
                (t =
                  t +
                  (parseFloat(
                    c[this.axis.source_column]?.replace(/[^0-9.-]/g, "")
                  ) || 0)),
              0
            );
            break;

          case "average":
            let entries = data.filter(
              (e) =>
                !Number.isNaN(
                  parseFloat(
                    e[this.axis.source_column]?.replace(/[^0-9.-]/g, "")
                  )
                )
            );
            result =
              entries.reduce(
                (t, c) =>
                  (t =
                    t +
                    (parseFloat(
                      c[this.axis.source_column]?.replace(/[^0-9.-]/g, "")
                    ) || 0)),
                0
              ) / (entries.length || 1);
            break;

          default:
            return 0;
        }

        return Intl.NumberFormat().format(result);
      }
    },
  },
};
</script>
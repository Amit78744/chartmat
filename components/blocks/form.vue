<template>
  <div class="p-3">
    <form @submit.prevent="submit_form">
      <div class="space-y-3">
        <div v-for="(element, index) in block.axis" :key="index">
          <label
            :style="{ color: block.labels_color }"
            class="font-semibold"
            v-show="!element.hide"
            :class="{ disabled: ['_user_email'].includes(element.default) }"
          >
            <p>{{ element.label || element.column }}</p>
            <p class="text-sm opacity-60 font-normal">
              {{ element.description }}
            </p>
          </label>
          <div
            :style="{ 'background-color': block.input_color }"
            class="rounded-md border mt-1"
            :class="
              isWhite(block.input_color) ? 'border-gray-700' : 'border-gray-300'
            "
          >
            <input
              v-if="element.type === 'file'"
              :placeholder="element.placeholder"
              :accept="element.file_mime_type"
              :name="element.column"
              :id="element.column"
              type="file"
              class="chartmat-file-input bg-transparent focus:bg-white focus:text-black rounded-md focus:shadow-md p-2 w-full"
            />
            <formInput
              v-else
              :value.sync="form[element.column]"
              :from_google_sheet="element.from_google_sheet"
              :type="element.type"
              :name="element.column"
              :placeholder="element.placeholder"
              :options="getColumnOptions(element)"
              :source_sheet="element.source_sheet"
            ></formInput>
            <!-- <formInput v-else :value.sync="form[element.column]" :type="element.type" :placeholder="element.placeholder" :options="element.options"></formInput> -->
          </div>
        </div>
      </div>
      <div class="w-full inline-flex items-center justify-end">
        <button
          class="btn btn-green mt-3"
          :class="{ loading: loading }"
          type="submit"
          :style="{
            'color': block.submit_button_text_color,
            'background': block.submit_button_color,
            'border': 'none !important',
          }"
        >
          {{ block.submit_text || "Submit" }}
        </button>
      </div>
    </form>
    <div class="mt-4 relative" v-show="error || success">
      <button
        @click="
          error = null;
          success = null;
        "
        class="rounded bg-red-50 border border-red-100 p-1 inline-flex items-center justify-center absolute -top-2 -right-2"
      >
        <svg
          class="w-4 h-4 fill-current text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
      <div
        class="bg-green-50 text-green-700 border-green-200 rounded-sm text-center p-3 py-2 border"
        v-show="success"
      >
        {{ success }}
      </div>
      <div class="small-error py-2" v-show="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      form: {},
      error: null,
      success: null,
      loading: false,
      uploading_files: false,
    };
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

  computed: {
    ...mapState("board", ["spreadsheetId"]),

    saveBtnStyle() {
      const style = {
        color: block.submit_button_text_color,
        background: block.submit_button_color,
      };
    },
  },

  mounted() {
    const x = {};
    for (const ax of this.block.axis) {
      let val = ax.default ?? "";
      switch (ax.default) {
        case "[(today)]":
          val = new Date().toISOString().substr(0, 10);
          break;
        case "[(user_email)]":
          val = this.$auth?.user?.email || "";
          break;
      }
      x[ax.column] = val;
    }
    this.form = x;
  },
  methods: {
    getColumnOptions(element) {
      const {
        type,
        column,
        options,
        from_google_sheet,
        source_sheet,
        source_column,
      } = element;

      if (type === "select" || type === "multi-select") {
        if (from_google_sheet) {
          if (source_sheet && source_column) {
            return this.options_from_sheet(element).join(",");
          }
        }
        if (!options.length) {
          // If there are no options we will use all values in the column
          const options = [...new Set(this.json.map((j) => j[column]))];
          return options.join(",");
        } else {
          return options; // Already a CSV String
        }
      } else {
        return ""; // No need to return anything since it's not a select input
      }
    },

    async upload_file() {
      const file_inputs = document.querySelectorAll(".chartmat-file-input");
      const files = {};
      if (file_inputs.length) {
        for (const file of file_inputs) {
          const formData = new FormData();
          // Have to filter the files not in the current form
          if (!this.columns.includes(file.name)) {
            continue;
          }
          formData.append(file.name, file.files[0]);
          const url = await this.$axios.$post("/api/upload-file", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          files[file.name] = url;
        }
      }
      return files;
    },

    async submit_form() {
      try {
        const url = window.location.host;
        if (url.startsWith("templates.")) {
          this.error =
            "This is a template, so form submission has been disabled. If you clone this template whenever you submit this form a new row will be added to your spreadsheet";
          return;
        }
        this.error = null;
        this.success = null;
        this.loading = true;
        // Check validations
        for (const ax of this.block.axis) {
          const value = this.form[ax.column];
          if (ax.regex_validation.length) {
            const reg = ax.regex_validation.replace(/^\/|\/$/g, ""); // Leading and trailing slash
            const re = new RegExp(reg, "gi");
            const valid = re.test(value);
            if (!valid) {
              this.error = `The value "${value}" for the input "${ax.column}" doesn't match the regex: ${ax.regex_validation}`;
              this.loading = false;
              return;
            }
          }
        }

        if (sessionStorage.getItem("_id")) {
          this.form["_id"] = sessionStorage.getItem("_id");
        }

        // Submit files first:
        const files = await this.upload_file();
        console.log(files);
        // Submit Form

        const form = this.form;

        await this.$axios.put(
          `/api/board/${this.spreadsheetId}/sheet/${this.block.sheet_title}`,
          { ...form, ...files }
        );

        this.success = this.block.submit_success ?? "Form submitted";
        this.loading = false;
        // Update data
        // await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
        await this.$store.dispatch("board/update_data", {
          sheet_titles: [this.block.sheet_title],
          skip_cache: true,
        });
      } catch (e) {
        this.error = this.errorMsg(e);
        this.loading = false;
      }
    },
    options_from_sheet(axis) {
      const data = this.sheets_data[axis.source_sheet]?.json;
      return data
        ? Array.from(new Set(data.map((d) => d[axis.source_column])))
        : [];
    },
  },
  computed: {
    ...mapState("board", ["sheets_data", "spreadsheetId", "sheets"]),
  },
};
</script>

<style></style>
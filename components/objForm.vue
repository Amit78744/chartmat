<template>
  <div class="">
    <div
      class=""
      v-for="(x, name) in config"
      :key="name"
      v-show="!hide(x.hide)"
    >
      <div class="grid grid-cols-1 sm:grid-cols-3 mt-4 w-full mb-3">
        <div
          class="bg-white capitalize text-black h-full inline-flex mt-3 items-start text-sm font-medium"
        >
          <div class="inline-flex items-center w-full">
            <p
              class="truncate cursor-default"
              :title="x.nice_name || name | beautify"
            >
              <span v-if="x.label">
                {{ x.label }}
              </span>
              <span v-else>
                {{ x.nice_name || name | beautify }}
              </span>
            </p>
            <div
              v-if="x.description"
              v-tooltip="{ value: x.description }"
              class="has-tooltip ml-1 text-gray-200 text-xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 cursor-pointer w-5 stroke-currents fill-current text-gray-500 opacity-50 z-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        <div
          class="sm:col-span-2 p-1 bg-white h-full w-full inline-flex items-center"
        >
          <div
            v-if="x.type === 'select'"
            class="center overflow-hidden bg-neutral-100 rounded-md px-3"
          >
            <select
              v-if="x.options.length"
              :placeholder="x.placeholder"
              :name="name"
              :id="name"
              :value="obj[name]"
              @change="updateValue(name, $event.target.value)"
              class="w-full h-10 appearance-none bg-neutral-100 ring-0 focus:outline-none"
            >
              <option
                v-for="(option, option_index) in x.options"
                :key="option_index"
              >
                {{ option }}
              </option>
            </select>
            <p v-else class="text-gray-400 italic">No options available</p>
          </div>

          <div
            v-else-if="x.type === 'sheet_columns'"
            class="center overflow-hidden bg-neutral-100 rounded-md px-3"
          >
            <select
              v-if="sheetColumns.length"
              :name="name"
              :id="name"
              :value="obj[name]"
              @change="updateValue(name, $event.target.value)"
              class="w-full h-10 appearance-none bg-neutral-100 ring-0 focus:outline-none"
            >
              <option
                v-for="(option, option_index) in sheetColumns"
                :key="option_index"
              >
                {{ option }}
              </option>
            </select>
            <p v-else class="text-gray-400 italic">No options available</p>
          </div>

          <!-- Adding datasources as a type -->
          <div
            v-else-if="x.type === 'datasource'"
            class="center overflow-hidden bg-neutral-100 rounded-md px-3 py-1"
          >
            <!--  -->
            <select
              :name="name + 'sheet'"
              :id="name + 'sheet'"
              :value="obj[name + '_sheet']"
              @change="
                updateDatasourcevalue(name + '_sheet', $event.target.value)
              "
              class="w-full py-1 appearance-none border-r-2 border-gray-200 bg-neutral-100 mr-4 ring-0 focus:outline-none"
            >
              <option v-for="s in sheets" :value="s.title" :key="s.title">
                {{ s.title }}
              </option>
            </select>

            <p v-if="loadingMessage" class="px-2 w-full h-8 appearance-none">
              {{ loadingMessage }}
            </p>

            <select
              v-else
              :name="name + 'column'"
              :id="name + 'column'"
              :value="obj[name + '_column']"
              @change="updateValue(name + '_column', $event.target.value)"
              class="w-full h-8 appearance-none bg-neutral-100 rounded-md py-1 ring-0 focus:outline-none"
            >
              <option
                v-for="n in sheets_data[obj[name + '_sheet']]?.columns"
                :value="n"
                :key="n"
                :selected="n == obj[name + '_column']"
              >
                {{ n }}
              </option>
            </select>
          </div>

          <div
            v-else-if="x.type === 'color'"
            class="center rounded-md w-100 bg-neutral-100 px-1"
          >
            <client-only>
              <colorPicker
                :key="name"
                :color="obj[name]"
                @updateColor="updateValue(name, $event)"
              ></colorPicker>
            </client-only>
          </div>

          <div
            v-else-if="x.type === 'colors'"
            class="center bg-neutral-100 rounded-md"
          >
            <div class="px-1 gap-2 flex items-center flex-wrap">
              <div
                v-for="(color, index) in obj[name]"
                :key="index"
                class="h-10"
              >
                <div class="flex items-stretch">
                  <div class="mr-1">
                    <colorPicker
                      :key="name + index"
                      :color="color"
                      @updateColor="updateColorArray(name, $event, index)"
                    >
                      <button
                        :class="{
                          'disabled opacity-20': obj[name].length === 1,
                        }"
                        @click="updateColorArray(name, null, index)"
                        class="p-0.5 rounded-md bg-rose-50 text-rose-500 ml-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 stroke-current"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </colorPicker>
                    <!-- <input class='w-auto -ml-1 pl-1 focus:outline-none border-b-8' :style="`border-color:${obj[name]}`"  data-jscolor="" :value="color" @change="updateColorArray(name, $event.target.value, index)"> -->
                  </div>
                </div>
              </div>
              <button
                class="rounded-md-lg border border-gray-200 h-8 p-1"
                @click="updateColorArray(name, '#0800FF70', obj[name].length)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-emerald-500 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            v-else-if="x.type === 'boolean'"
            class="center overflow-hidden rounded-md py-2"
          >
            <div
              class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"
            >
              <input
                :id="name"
                :name="name"
                type="checkbox"
                :value="obj[name]"
                :checked="obj[name]"
                @change="updateValue(name, !obj[name])"
                class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                :for="name"
                class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
              ></label>
            </div>
          </div>

          <div
            v-else-if="x.type === 'range'"
            class="center overflow-hidden bg-neutral-100 px-3 rounded-md"
          >
            <input
              :name="name"
              :id="name"
              class="w-full bg-neutral-100 py-4"
              type="range"
              :min="x.min"
              :max="x.max"
              :step="x.step || undefined"
              :value="obj[name]"
              @change="updateValue(name, $event.target.value)"
            />
          </div>

          <div
            v-else-if="x.type === 'array'"
            class="center overflow-hidden px-3"
          >
            <div class="space-y-2">
              <span
                v-for="item in obj[name]"
                :key="item"
                class="mr-2 inline-flex items-center py-0.5 rounded-md-md text-sm font-medium bg-indigo-100 text-indigo-800 break-all"
              >
                {{ item }}
                <button
                  type="button"
                  @click="editArray(name, item)"
                  v-show="!(x.keep || []).includes(item)"
                  class="flex-shrink-0 -mr-0.5 ml-1.5 inline-flex text-red-500 focus:outline-none focus:text-indigo-700"
                >
                  <svg
                    class="h-2 w-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-width="1.5"
                      d="M1 1l6 6m0-6L1 7"
                    />
                  </svg>
                </button>
              </span>
              <input
                v-model="array_input"
                type="text"
                :placeholder="x.placeholder || 'Add an item'"
                autocomplete="off"
                @keyup.enter="editArray(name, $event.target.value)"
                ref="array_input"
                class="flex-grow appearance-none h-full ring-0 focus:outline-none border-b border-transparent"
              />
            </div>
          </div>

          <div v-else-if="x.type === 'number'" class="center overflow-hidden">
            <input
              autocomplete="off"
              :placeholder="x.placeholder || 'Type here'"
              type="text"
              pattern="\d*\.?\d*"
              :name="name"
              :id="name"
              :value="obj[name]"
              @input="updateValue(name, $event.target.value)"
              class="appearance-none w-full h-full ring-0 focus:outline-none border-b border-transparent bg-neutral-100 rounded-md py-3 px-3"
            />
          </div>

          <div
            v-else-if="x.type === 'image'"
            class="center overflow-hidden rounded-md bg-neutral-100 px-3 py-2"
          >
            <div>
              <a
                href="#"
                @click.prevent="updateValue(name, '')"
                class="mx-2 text-indigo-500"
                v-if="obj[name] && x.remove_link"
                >{{ x.remove_caption || "Remove image" }}</a
              >
              <input
                autocomplete="off"
                :placeholder="x.placeholder || 'Upload image'"
                type="file"
                :accept="x.file_mime_type"
                :name="name"
                :id="name"
                @change="update_local_image"
                class="chartmat-file-input bg-transparent focus:bg-white focus:text-black rounded-md-md focus:shadow-md p-2 w-full"
              />
              <br />
              <img
                :src="obj[name]"
                v-if="obj[name]"
                style="max-height: 200px; text-align: center"
              />
            </div>
          </div>

          <div
            v-else-if="x.type === 'images'"
            class="bg-neutral-100 rounded-md px-3 py-2"
          >
            <div class="m-2" v-if="obj[name] && obj[name].length > 0">
              <div class="mb-2">Uploaded images</div>
              <div class="flex flex-wrap">
                <div v-for="(i, index) in obj[name]" :key="i" class="relative">
                  <img :src="i" class="w-12 h-12 object-cover m-2" />
                  <div
                    class="absolute top-0 right-0 h-6 w-6 rounded-full shadow-md hover:bg-slate-100 bg-white"
                    @click="deleteImage(obj[name], index)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="{1.5}"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="m-2" v-if="images_to_upload.length > 0">
              <div class="mb-2">Add more images</div>
              <div class="flex flex-wrap">
                <div v-for="i in images_to_upload" :key="i">
                  <img :src="i" class="w-12 h-12 object-cover m-2" />
                </div>
              </div>
            </div>
            <input
              @change="updatePlaceholderImages"
              :placeholder="placeholder"
              multiple
              :id="id"
              :name="name"
              type="file"
              :class="add_class"
               :accept="x.file_mime_type || 'images/*'"
              class="bg-transparent focus:bg-white focus:text-black rounded-md focus:shadow-md p-2 w-full chartmat-file-input"
            />
          </div>

          <div
            v-else-if="x.type === 'markdowntext'"
            class="center overflow-hidden"
          >
            <markdown-editor
              class="mrk break-normal"
              toolbar="bold italic heading  link  numlist bullist code quote  preview"
              :value="obj[name]"
              @change="updateValue(name, $event)"
            >
            </markdown-editor>
          </div>

          <div v-else-if="x.type === 'textarea'" class="center overflow-hidden">
            <textarea
              autocomplete="off"
              :placeholder="x.placeholder || 'Type here'"
              :name="name"
              :id="name"
              :value="obj[name]"
              :rows="x.rows || 5"
              @input="updateValue(name, $event.target.value)"
              class="appearance-none w-full h-full ring-0 focus:outline-none border-b border-transparent bg-neutral-100 rounded-md py-3 px-3"
            ></textarea>
          </div>

          <div
            class="sm:col-span-2 p-1 bg-white h-full w-full inline-flex items-center"
            v-else-if="x.type === 'kv_pair'"
          >
            <div class="center overflow-hidden rounded-md">
              <dynamicPair
                :existingPairs="obj[name]"
                :sheetColumns="kvPair"
                @change="updateValue(name, $event)"
              />
            </div>
          </div>

          <div v-else class="center overflow-hidden">
            <input
              autocomplete="off"
              :placeholder="x.placeholder || 'Type here'"
              type="text"
              :name="name"
              :id="name"
              :value="obj[name]"
              @input="updateValue(name, $event.target.value)"
              class="appearance-none w-full h-full ring-0 focus:outline-none border-b border-transparent bg-neutral-100 rounded-md py-3 px-3"
            />
          </div>
        </div>
      </div>

      <div
        v-if="name === 'pdf_template'"
        class="rounded bg-yellow-50 border border-yellow-400 p-3 border-t pt-6"
      >
        <p>You can use the following variables in your PDF template:</p>
        <div class="flex flex-wrap gap-2 mt-3">
          <span
            v-for="(name, name_index) in sheetColumns"
            :key="name_index"
            class="bg-gray-900 rounded text-sm font-mono select-all text-yellow-400 px-2 py-0.5"
            >([{{ name }}])</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      array_input: "",
      loadingMessage: "",
      local_image: null,
      images: [],
      images_to_upload: [],
    };
  },
  props: {
    sheetColumns: {},
    obj: {
      type: Object,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.setupColors();
  },
  computed: {
    ...mapState("board", ["sheets", "sheets_data", "palette"]),
    kvPair() {
      return [...this.sheetColumns, "([logged in user email])"];
    },
  },
  methods: {
    testEvent(e) {
      console.log(e);
    },

    async deleteImage(imagesArray, index) {
      imagesArray.splice(index, 1);
    },

    updatePlaceholderImages(e) {
      const vm = this;
      vm.images_to_upload = [];
      for (const f of e.target.files) {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.addEventListener(
          "load",
          function () {
            vm.images_to_upload.push(reader.result);
          },
          false
        );
      }
    },

    async update_local_image(file) {
      const vm = this;
      var input = file.target;
      // If not file selected, no change
      if (!input.files[0]) {
        return;
      }
      const file_size = input.files[0].size / 1024;
      if (file_size > 500) {
        alert(
          `Uploaded File size is ${file_size}KB. File size should not exceed 500KB..`
        );
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var dataURL = reader.result;
        vm.$emit("update:obj", { ...vm.obj, [input.name]: dataURL });
      };
      reader.readAsDataURL(input.files[0]);
    },

    async fetch_data(sheet_title) {
      if (!this.sheets_data[sheet_title]) {
        // Update if not available
        await this.$store.dispatch("board/update_data", {
          sheet_titles: [sheet_title],
        });
      }
    },

    // Specific to datasource type
    async updateDatasourcevalue(key, value) {
      this.loadingMessage = "loading ...";
      await this.fetch_data(value);
      this.loadingMessage = "";
      this.$emit("update:obj", { ...this.obj, [key]: value });
    },

    updateValue(key, value) {
      this.$emit("update:obj", { ...this.obj, [key]: value });
    },

    hide(checks) {
      if (!checks) {
        return false;
      }
      return checks.some((check) => {
        const [name, validator, comparison] = check;
        switch (validator) {
          case "!==":
            return this.obj[name] !== comparison;
          case "==":
            return this.obj[name] === comparison;
          case "!in":
            return !comparison.includes(this.obj[name]);
          case "in":
            return comparison.includes(this.obj[name]);
          default:
            return false;
        }
      });
    },

    editArray(name, item) {
      if (!item || !item.length) {
        return;
      }
      const arr = [...this.obj[name]];
      const index = arr.findIndex((i) => i === item);
      if (index > -1) {
        arr.splice(index, 1);
      } else {
        arr.push(item);
      }
      this.array_input = "";
      this.updateValue(name, arr);
    },
    setupColors() {
      // const colorPickers = this.$refs.color_picker// 'var parent = document.querySelector('#parent');'
      // for (const picker of colorPickers){
      // 	var color_picker = new Picker(picker);
      // 	// color_picker.onChange = () => this.
      // }
      // const JsColor = require("@eastdesire/jscolor")
      // JsColor.presets.default = {
      // 	format:'hexa',
      // 	// palette:['#ffe438', '#88dd20', '#ffe438', '#88dd20'],
      // 	// paletteCols:6,
      // 	previewSize:1,
      // 	borderWidth:0
      // }
      // JsColor.init()
      // JsColor.install()
    },
    async updateColorArray(name, new_color, index) {
      const colors = [...this.obj[name]];
      if (new_color === null) {
        // Remove it
        colors.splice(index, 1);
      } else {
        // Add or edit it
        colors[index] = new_color;
      }
      // It must be await or the last color doesn't get triggered - Make no sense
      await this.updateValue(name, colors);
      this.setupColors();
    },

    // addColor(name, index)
  },
};
</script>

<style>
/* CHECKBOX TOGGLE SWITCH */
/* @apply rules for documentation, these do not work as inline style */
.toggle-checkbox:checked {
  @apply: right-0 border-indigo-600;
  right: 0;
  border-color: rgb(79, 70, 229);
}
.toggle-checkbox:checked + .toggle-label {
  @apply: bg-indigo-600;
  background-color: rgb(79, 70, 229);
}

.p-tooltip-text {
  font-size: 12px;
  max-width: 400px;
  width: max-content;
}
</style>
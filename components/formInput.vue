<template>

    <div v-if="loading">
      <p class="p-2 font-normal">Loading...</p>
    </div>

    <MultiSelect  class="w-full  border-none text-xs" v-else-if="type === 'multi-select'" v-model="selectInput" :options="getOptions(options)" :filter="true"
      @change="editValue" display="chip" appendTo="body">
    </MultiSelect>

    <Dropdown v-model="selectInput" :options="getOptions(options)" v-else-if="type === 'select'"
      :filter="getOptions(options).length > 10" @change="editValue" class="w-full h-9 border-none" appendTo="body">
    </Dropdown>

    <markdown-editor class="mrk break-normal" v-else-if="type === 'markdowntext'"
      toolbar="clean undo redo  bold italic strikethrough heading  link  numlist bullist code quote  preview"
      :value="value" @change="editValue({ value: $event })">
    </markdown-editor>

    <textarea @input="editValue" :value="value" rows="3" :placeholder="placeholder" v-else-if="type === 'textarea'"
      class="bg-transparent focus:bg-white focus:text-black rounded-md focus:shadow-md p-2 w-full -mb-2"></textarea>

    <!-- Using regex for image -->
    <textarea v-else-if="type === 'image' && image_source == 'External URL'" @input="editValue" :value="value"
      :placeholder="placeholder" type="text" oninvalid="setCustomValidity('Please enter valid image url.')"
      oninput="setCustomValidity('')"
      class="bg-transparent focus:bg-white focus:text-black rounded-md focus:shadow-md p-2 w-full"></textarea>
      
    <div v-else-if="type === 'image' && image_source == 'Upload Image'">
      <div class="m-2" v-if="images.length > 0">
        <div class="mb-2">Uploaded images</div>
        <div class="flex flex-wrap">
          <div v-for="(i, index) in images" :key="i" class="relative">
            <img :src="i" class="w-12 h-12 object-cover m-2" />
            <div class="absolute top-0 right-0 h-6 w-6 rounded-full shadow-md hover:bg-slate-100 bg-white"
              @click="deleteImage(index, i)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="{1.5}"
                stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <hr />
      <div class="m-2" v-if="images_to_upload.length > 0">
        <div class="mb-2">Add more images</div>
        <div class="flex flex-wrap">
          <div v-for="(i, index) in images_to_upload" :key="i">
            <img :src="i" class="w-12 h-12 object-cover m-2" />
          </div>
        </div>
      </div>
      <input @change="updatePlaceholderImages" :placeholder="placeholder" multiple :id="id" :name="name" type="file"
        :class="add_class" accept="image/*"
        class="bg-transparent focus:bg-white focus:text-black rounded-md focus:shadow-md p-2 w-full imageUploader" />
    </div>
    <!-- Using regex for number -->
    <input v-else-if="type === 'number'" @input="editValue" :value="value" :placeholder="placeholder" pattern="\d*\.?\d*"
      type="text" oninvalid="setCustomValidity('Please enter valid number.')" oninput="setCustomValidity('')"
      class="bg-transparent focus:bg-white focus:text-black rounded-md focus:shadow-md p-2 w-full" />
    <input v-else @input="editValue" :value="value" :placeholder="placeholder" :type="type"
      class="bg-transparent focus:bg-white focus:text-black rounded-md focus:shadow-md p-2 w-full" />
 
</template>

<script>
import FileUpload from "primevue/fileupload";
import { mapState } from "vuex";
import Dropdown from "primevue/dropdown";
import MultiSelect from 'primevue/multiselect';

export default {
  components: {
    Dropdown,
    FileUpload,
    MultiSelect,
  },
  props: {
    required: {
      type: Boolean,
      default: false,
    },
    add_class: {},
    name: {
      type: String,
    },
    value: {},
    options: {
      type: String, // Forms are always strings
    },
    placeholder: {
      type: String,
      default: "Type here..",
    },
    file_mime_type: {
      type: String,
      default: "*",
    },
    type: {
      type: String,
    },
    input_color: {
      default: "white",
    },
    image_source: {
      default: false,
    },
    source_sheet: {},
    from_google_sheet: {},
  },
  data() {
    return {
      loading: false,
      selectInput: null,
      images: [],
      images_to_upload: [],
    };
  },
  created() {
    if (this.type === 'multi-select') {
      this.selectInput = this.value?.trim() ? this.value?.split(",") : null
    } else {
      this.selectInput = this.value;
    }


    if (this.type === "image" && this.value?.trim()) {
      this.images = this.value.split(",") || [];
    }
    if (this.from_google_sheet && this.source_sheet) {
      const vm = this;

      if (vm.sheets_data[vm.source_sheet]?.json) {
        return;
      }
      vm.loading = true;
      const unwatch = vm.$watch(
        "sheets_data",
        (sheets) => {

          if (sheets[vm.source_sheet]?.json) {
            vm.loading = false;
            unwatch();
          }
        },
        { deep: true }
      );
    }
  },

  methods: {
    async deleteImage(index, url) {
      this.images.splice(index, 1);
      this.$emit("update:value", this.images.join(","));
    },

    async myUploader(event) {
      const formData = new FormData();
      for (let f of event.files) {
        formData.append(f.name, f);
        const url = await this.$axios.$post("/api/upload-file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.images.push(url);
        this.$emit("update:value", this.images.join(","));
      }
    },

    editValue(event) {
      if (Array.isArray(event.value)) {
        this.$emit("update:value", event.value.join(',') || event.target?.value(',') || "");
      } else {
        this.$emit("update:value", event.value || event.target?.value || "");
      }
    },

    getOptions(str = "") {
      if (str.indexOf(",") == -1) {
        return [str]
      }
      return str
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
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
  },
  computed: {
    ...mapState("board", ["sheets_data"]),
  },
};
</script>

<style scoped>
>>>.p-inputtext {
  padding: 0.5rem;
}
</style>
<template>
  <div>
   
    <div
      v-if="showPicker"
      class="absolute top-0 left-0 w-full h-full"
      @click="showPicker = false"
    ></div>
    <div
      ref="color_picker"
      class="rounded-md py-1 text-sm relative inline-flex items-center"
      tabIndex="0"
    >
      <div
        class="h-7 w-7 rounded-ms text-xs border rounded p-4"
        :style="`background-color:${color}`"
        @click.prevent="showPicker = true"
      >
        <div
          class="absolute top-10 left-0"
          style="z-index: 1000"
          v-if="showPicker"
        >
          <Sketch :value="color || '#fff'" @input="update"></Sketch>
        </div>
      </div>
      <div
        class="text-black bg-opacity-50 relative ml-3"
        @click.prevent="showPicker = true"
      >
        {{ color || "Select Color" }}
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import Sketch from "vue-color/src/components/Sketch.vue";
export default {
  props: ["color"],

  components: {
    Sketch,
  },

  mounted() {
    this.$nextTick(() => {
      this.update({ hex8: this.color });
    });
  },

  methods: {
    update(value) {
      this.$emit("updateColor", value.hex8);
    },
  },
  data() {
    return {
      showPicker: false,
      selectedColor: "#fff",
    };
  },
};
</script>
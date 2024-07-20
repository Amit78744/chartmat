<template>
  <button :class="btn_class">
    <span v-if="spinner">
      <svg
        class="animate-spin h-5 w-5 text-white mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>
    <span v-else>{{ caption }}</span>
  </button>
</template>

<style scoped>
.get-started-btn {
  background: linear-gradient(90.04deg, #4f46e5 -5.12%, #00f1f5 116.3%);
  border-radius: 8px;
}
.bg-grad:hover,
.get-started-btn:hover {
  background: linear-gradient(269.94deg, #4f46e5 -2.83%, #00f1f5 114.84%);
  border-radius: 8px;
}
</style>

<script>
export default {
  props: {
    caption: {},
    spinner: {},
    btn_class: {
      default:
        "get-started-btn max-w-content px-5 py-3 text-white text-lg font-normal",
    },
  },
};
</script>
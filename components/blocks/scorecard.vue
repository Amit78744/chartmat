<template>
  <div class="p-5 w-full">
    <div class="grid grid-cols-1" :class="card_class">
      <BlocksIndividualScoreCard
        class="
          my-2
          px-4
          py-6
          mx-2
          border-gray-800
          bg-white
          rounded
          overflow-x-auto
        "
        v-for="(a, i) in block.axis"
        :key="i"
        :axis="a"
        :json="json"
      ></BlocksIndividualScoreCard>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    card_class() {
      return this.block.full_width
        ? `sm:grid-cols-${this.block.axis.length}`
        : this.block.axis.length > 1 ? "sm:grid-cols-2":"sm:grid-cols-1";
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
};
</script>

<style>
</style>
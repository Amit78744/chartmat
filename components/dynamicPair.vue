<template>
  <div>
    <div v-for="(p, i) in pairs" :key="i" class="mb-2 flex items-center">
      <input
        type="text"
        v-model="p.key"
        placeholder="object field"
        class="appearance-none h-full ring-0 focus:outline-none border-b border-transparent bg-neutral-100 rounded-md py-3 px-3 mr-3"
      />
      <select
        v-model="p.value"
        placeholder="Select column"
        class="appearance-none h-11 ring-0 focus:outline-none border-b border-transparent bg-neutral-100 rounded-md py-3 px-3 mr-3"
      >
        <option value="">Select a column</option>
        <option :value="c" v-for="c in sheetColumns" :key="c">
          {{ c }}
        </option>
      </select>

      <button @click="removePair(i)">
        <svg
          class="w-6 h-6 stroke-current text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </button>
    </div>
    <div>
      <button @click="addPair" class="btn btn-indigo btn-sm mt-2 p-1">
        Add mapping
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    existingPairs: {},
    sheetColumns: {},
  },
  mounted() {
    console.log(this.existingPairs);
    if (this.existingPairs) {
      this.pairs = JSON.parse(this.existingPairs);
    }
  },
  data() {
    return {
      pairs: [],
      newPair: { key: "", value: "" },
    };
  },

  watch: {
    existingPairs: function(val) {
      if (val) {
        this.pairs = JSON.parse(val);
      }
    },
    pairs: {
      handler: function (newVal) {
        console.log(newVal);
        this.$emit("change", JSON.stringify(newVal));
      },
      deep: true,
    },
  },
  methods: {
    addPair() {
      this.pairs.push(Object.assign({}, this.newPair));
    },
    removePair(i) {
      this.pairs.splice(i, 1);
    },
  },
};
</script>

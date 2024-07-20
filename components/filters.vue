<template>
  <div>
    <div class="flex flex-wrap items-center gap-3">
      <div
        v-for="(filter, filter_ix) in filters"
        :key="filter_ix"
        v-show="filter.display"
        class="
          cursor-pointer
          flex
          items-center
          rounded
          overflow-hidden
          bg-white
        "
        :class="filter.active ? 'bg-opacity-80' : 'bg-opacity-60'"
      >
        <button
          class="p-1 border-r border-gray-600"
          @click="filter.active = !filter.active"
        >
          <svg
            v-show="filter.active"
            class="font-light h-4 w-4 stroke-current text-teal-500"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="32"
            height="32"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1"
              d="M13 19.88c.04.3-.06.62-.28.83c-.4.39-1.03.39-1.42 0L7.29 16.7a.989.989 0 0 1-.29-.83v-5.12L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L13 10.75v9.13M5.04 5L9 10.07v5.51l2 2v-7.53L14.96 5H5.04m12.71 16L15 18l1.16-1.16l1.59 1.59l3.59-3.59l1.16 1.41L17.75 21"
              fill="currentColor"
            ></path>
          </svg>
          <svg
            v-show="!filter.active"
            class="font-light h-4 w-4 stroke-current text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="32"
            height="32"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1"
              d="M14.73 20.83L17.58 18l-2.85-2.83l1.42-1.41L19 16.57l2.8-2.81l1.42 1.41L20.41 18l2.81 2.83l-1.42 1.41L19 19.4l-2.85 2.84l-1.42-1.41M13 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L7.29 16.7a.989.989 0 0 1-.29-.83v-5.12L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L13 10.75v9.13M5.04 5L9 10.06v5.52l2 2v-7.53L14.96 5H5.04z"
              fill="currentColor"
            ></path>
          </svg>
        </button>
        <div>
          <div
            v-if="filter.display == 'switch'"
            class="rounded px-2 h-6"
            @click="filter.active = !filter.active"
          >
            {{ filter.name }}
          </div>
          <div
            v-else-if="filter.display == 'value'"
            class="bg-transparent px-2"
          >
            <datePicker
              v-if="filter.condition == 'date'"
              :dates="filter.value"
              @change="filter.value = $event"
            ></datePicker>

            <select
              v-else-if="filter.condition == '='"
              class="w-full px-2 bg-transparent"
              v-model="filter.value"
            >
              <option
                v-for="(v, vix) in get_options(filter.sheet_column)"
                :key="vix"
              >
                {{ v }}
              </option>
            </select>

            <div v-else-if="filter.condition == 'any_of'" class="group">
              <div
                class="truncate max-w-xs"
                @click="show_multiple_options = filter_ix"
              >
                <p>{{ filter.name }}</p>
              </div>
              <div
                v-show="show_multiple_options !== null"
                @click="show_multiple_options = null"
                class="
                  h-screen
                  bg-black bg-opacity-20
                  absolute
                  inset-0
                  w-screen
                  z-30
                "
              ></div>
              <div
                v-show="show_multiple_options == filter_ix"
                class="z-50 absolute inset-x-1 py-2 px-3"
              >
                <div
                  class="
                    p-2
                    rounded
                    bg-white
                    shadow-lg
                    border border-gray-200
                    w-full
                  "
                >
                  <div class="mb-2">
                    <p class="text-lg font-bold">{{ filter.name }}:</p>
                    <p
                      class="text-xs text-red-600 block"
                      v-show="!filter.active"
                    >
                      This filter is currently disabled
                    </p>
                  </div>
                  <ul class="flex flex-wrap gap-3">
                    <li
                      @click="
                        filter.value = addRemoveOption(filter.value, option)
                      "
                      class="
                        flex
                        px-1
                        justify-center
                        items-center
                        rounded-sm
                        py-0.5
                        text-sm
                      "
                      v-for="(option, ix) in get_options(filter.sheet_column)"
                      :class="
                        filter.value
                          .split('[(OR)]')
                          .map((x) => x.trim())
                          .includes(option)
                          ? 'bg-emerald-200 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      "
                      :key="ix"
                    >
                      <span class="max-w-xs truncate break-all">{{
                        option
                      }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <input
              v-else
              class="px-2 bg-transparent w-full"
              placeholder="Enter your value here"
              v-model="filter.value"
            />
          </div>
        </div>
      </div>

      <span
        v-if="can_edit"
        class="
          rounded-full
          bg-white
          shadow
          h-8
          w-8
          flex
          items-center
          justify-center
        "
        @click="showFilters = true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 stroke-current text-indigo-600 bg-opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </span>
    </div>
    <div v-if="can_edit">
      <div
        v-show="showFilters"
        @click="showFilters = false"
        class="
          bg-opacity-60
          h-screen
          w-screen
          bg-black
          fixed
          inset-0
          overflow-hidden
          z-10
        "
      ></div>
      <transition name="slide-left">
        <div
          key="filter-editor"
          v-show="showFilters"
          class="
            p-6
            fixed
            overflow-y-scroll
            z-50
            top-0
            left-0
            min-h-screen
            h-full
            rounded-r-lg
            shadow-lg
            bg-white
            right-16
            sm:right-auto sm:w-full sm:max-w-lg
          "
        >
          <div class="mb-5 pb-5 border-b border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <p class="title">Filters</p>
              <div class="has-tooltip w-full flex justify-end">
                <span
                  class="
                    tooltip
                    bg-gray-800
                    rounded
                    p-2
                    mx-4
                    mb-2
                    mt-8
                    text-gray-200 text-sm
                  "
                  >When you save filters they will be in the exact state every
                  time you open this board</span
                >
                <button
                  :class="{ loading: saving_loading }"
                  class="btn btn-green py-0.5"
                  @click="saveFilters"
                >
                  Save Filters
                </button>
              </div>
            </div>
            <p class="subtitle text-sm text-gray-700">
              Create filters to show only the data you need
            </p>
          </div>
          <div class="space-y-6">
            <div v-for="(filter, filter_index) in filters" :key="filter_index">
              <div class="relative">
                <button
                  @click="deleteFilter(filter_index)"
                  class="absolute -right-3 -top-3 shadow bg-red-50 rounded-full"
                >
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
                <div class="rounded-lg overflow-hidden border border-gray-200">
                  <div class="flex border-b border-gray-200 h-10">
                    <div
                      class="
                        truncate
                        flex
                        items-center
                        justify-start
                        px-3
                        w-32
                        bg-slate-100
                        font-semibold
                        text-slate-600
                        border-r
                      "
                    >
                      Name:
                    </div>
                    <input
                      v-model="filter.name"
                      class="px-2 bg-gray-50 w-full"
                    />
                  </div>

                  <div class="flex border-b border-gray-200 h-10">
                    <div
                      class="
                        truncate
                        flex
                        items-center
                        justify-start
                        px-3
                        w-32
                        bg-slate-100
                        font-semibold
                        text-slate-600
                        border-r
                      "
                    >
                      Column:
                    </div>
                    <select
                      class="w-full px-2 bg-gray-50"
                      v-model="filter.sheet_column"
                    >
                      <option
                        v-for="(item, item_index) in sheets_and_columns"
                        :key="item_index"
                        :value="item"
                      >
                        {{ item.sheet }} - {{ item.column }}
                      </option>
                    </select>
                  </div>

                  <div class="flex border-b border-gray-200 h-10">
                    <div
                      class="
                        truncate
                        flex
                        items-center
                        justify-start
                        px-3
                        w-32
                        bg-slate-100
                        font-semibold
                        text-slate-600
                        border-r
                      "
                    >
                      Condition:
                    </div>
                    <select
                      class="w-full px-2 bg-gray-50"
                      v-model="filter.condition"
                    >
                      <option
                        v-for="(condition, condition_index) in conditions"
                        :key="condition_index"
                        :value="condition.val"
                      >
                        {{ condition.name }}
                      </option>
                    </select>
                  </div>

                  <div
                    class="flex border-b border-gray-200 h-10"
                    v-if="
                      ![
                        'today',
                        'tomorrow',
                        'current_week',
                        'next_week',
                      ].includes(filter.condition)
                    "
                  >
                    <div
                      class="
                        truncate
                        flex
                        items-center
                        justify-start
                        px-3
                        w-32
                        bg-slate-100
                        font-semibold
                        text-slate-600
                        border-r
                      "
                    >
                      Value:
                    </div>
                    <div class="bg-gray-50 w-full h-full">
                      <datePicker
                        class="h-full w-full px-2"
                        v-if="filter.condition == 'date'"
                        :dates="filter.value"
                        @change="filter.value = $event"
                      ></datePicker>
                      <select
                        v-else-if="filter.condition == '='"
                        class="w-full h-full px-2 bg-gray-50"
                        v-model="filter.value"
                      >
                        <option
                          v-for="(v, vix) in get_options(filter.sheet_column)"
                          :key="vix"
                        >
                          {{ v }}
                        </option>
                      </select>
                      <input
                        v-else
                        class="px-2 bg-gray-50 w-full h-full"
                        placeholder="Enter your value here"
                        v-model="filter.value"
                      />
                    </div>
                  </div>

                  <div class="flex border-b border-gray-200 h-10 items-center">
                    <div
                      class="
                        truncate
                        h-full
                        flex
                        items-center
                        justify-start
                        px-3
                        w-32
                        bg-slate-100
                        font-semibold
                        text-slate-600
                        border-r
                      "
                    >
                      Active:
                    </div>
                    <label
                      class="px-2 bg-gray-50 w-full h-full flex items-center"
                      ><input
                        type="checkbox"
                        class="mr-2"
                        v-model="filter.active"
                      />
                      {{ filter.active }}
                    </label>
                  </div>

                  <div class="flex h-10">
                    <div
                      class="
                        truncate
                        flex
                        items-center
                        justify-start
                        px-3
                        w-32
                        bg-slate-100
                        font-semibold
                        text-slate-600
                        border-r
                      "
                    >
                      Display as:
                    </div>
                    <select
                      class="px-2 bg-gray-50 w-full"
                      v-model="filter.display"
                    >
                      <option
                        v-for="dis in [null, 'value', 'switch']"
                        :key="dis"
                        :value="dis"
                      >
                        {{ dis ? dis : "Don't display" }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <button
              @click="addFilter()"
              class="
                text-center
                rounded
                bg-emerald-50
                hover:bg-emerald-100
                w-full
                p-2
                text-emerald-600
              "
            >
              Add New Filter
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import { mapMultiRowFields } from "vuex-map-fields";
import { mapGetters, mapState } from "vuex";
export default {
  data() {
    return {
      show_multiple_options: null,
      render_select: null,
      preview_filter_name: null,
      saving_loading: false,
      showFilters: false,
      conditions: [
        { name: "Date Picker", val: "date" },
        { name: "Today", val: "today" },
        { name: "Tomorrow", val: "tomorrow" },
        { name: "Current week", val: "current_week" },
        { name: "Next week", val: "next_week" },
        { name: "Greater Than", val: ">" },
        { name: "Less Than", val: "<" },
        { name: "Equal to", val: "=" },
        { name: "Any of", val: "any_of" },
        { name: "Days in the past", val: "past_days" },
        // {name:"These days in the future", val:"future_days"},
        { name: "Includes", val: "includes" },
        { name: "Doesn't include", val: "not_includes" },
        { name: "Starts with", val: "starts_with" },
        { name: "Doesn't start with", val: "not_starts_with" },
        { name: "Ends with", val: "ends_with" },
        { name: "Doesn't end with", val: "not_ends_with" },
      ],
    };
  },
  computed: {
    ...mapMultiRowFields("board", ["filters"]),
    ...mapState("board", ["sheets_data", "can_edit"]),
    ...mapGetters("board", ["sheets"]),
    store_filters() {
      return JSON.parse(JSON.stringify(this.$store.state.board.filters));
    },
    sheets_and_columns() {
      const final = [];
      const sheets = this.sheets ?? [];
      for (const sheet of sheets) {
        const columns = this.sheets_data?.[sheet]?.columns ?? [];
        for (const column of columns) {
          final.push({ sheet, column });
        }
      }
      return final;
    },
  },
  methods: {
    addRemoveOption(options, new_option) {
      const arr = options.split("[(OR)]").map((x) => x.trim());
      const ix = arr.findIndex((it) => it === new_option);
      if (ix > -1) {
        arr.splice(ix, 1);
      } else {
        arr.push(new_option);
      }
      return [...new Set(arr)].filter((i) => i.length).join("[(OR)]");
    },

    get_options(sheet_column) {
      const { sheet, column } = sheet_column;
      const data = this.sheets_data?.[sheet]?.json ?? [];
      const all = data.map((d) => d[column]);
      return [...new Set(all)];
    },
    addFilter() {
      const empty_filter = {
        name: "",
        active: false,
        sheet_column: { column: null, sheet: null },
        display: "value",
        condition: "=",
        value: "",
      };
      const filters = [...this.store_filters, empty_filter];
      this.$store.commit("board/UPDATE", { filters });
    },
    deleteFilter(index) {
      const f = this.store_filters;
      f.splice(index, 1);
      this.$store.commit("board/UPDATE", { filters: f });
    },
    async saveFilters() {
      this.saving_loading = true;
      await this.$axios.put(`/api/board`, { filters: this.store_filters });
      this.saving_loading = false;
    },
  },
};
</script>
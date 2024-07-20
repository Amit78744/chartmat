<template>
  <div>
    <div
      v-show="loadingMessage"
      class="absolute backdrop-blur backdrop-filter z-10 h-screen w-screen flex items-center justify-center bg-black bg-opacity-50"
    >
      <p class="text-white text-center text-3xl py-20">
        {{ loadingMessage }}
      </p>
    </div>

    <div>
      <div class="grid grid-cols-1 sm:grid-cols-2">
        <div class="border-r-2 border-gray-200 p-6">
          <div class="space-y-6 bg-white p-4 shadow-md">
            <!-- Don't show source incase of iframe & score card -->
            <div v-if="block.type != 'iframe' && block.type != 'scorecard'">
              <div class="pb-6 border-b">
                <p class="text-sm font-semibold mb-1 text-gray-900">
                  Data Source:
                </p>
                <div class="inline-flex w-full items-stretch">
                  <button
                    @click="updateMetadata"
                    class="rounded-l border border-r-0 border-gray-200 py-1 px-2 bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6 stroke-current text-gray-700 hover:text-gray-800"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <select
                    v-model="sheet_title"
                    class="my-form rounded-l-none text-black"
                    @change="change_data_source"
                  >
                    <option v-for="s in sheets" :value="s.title" :key="s.title">
                      {{ s.title }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="space-y-5">
              <div class="space-y-5">
                <!-- Block config -->
                <div class="">
                  <p class="text-sm font-semibold mb-1 text-gray-900">
                    Block Config:
                  </p>
                  <objForm
                    :obj.sync="block"
                    :config="config.block"
                    :key="JSON.stringify(config.block)"
                    :sheetColumns="names"
                  ></objForm>
                </div>

                <!-- Specific for chart -->
                <div v-show="block.type === 'chart'" class="">
                  <p
                    class="text-sm text-slate-700 bg-yellow-50 p-3 border border-yellow-400 rounded"
                  >
                    Charts have one shared X axis and multiple Y axis. <br />
                    The X axis above will be shared with all the Y axes below.
                    Make sure you have selected the right axis if your data
                    doesn't look right.
                  </p>
                </div>

                <!-- Axes Other then scorecard & map -->
                <div
                  v-show="
                    hasAxis && block.type != 'scorecard' && block.type != 'map'
                  "
                  class="border-t pt-6"
                >
                  <p class="text-sm font-semibold text-gray-900">Axes:</p>
                  <div
                    class="inline-flex flex-wrap items-center gap-2 w-full my-3"
                  >
                    <!-- draggable -->
                    <draggable
                      v-model="axis"
                      class="flex flex-row flex-wrap"
                      draggable=".item"
                    >
                      <div
                        class="flex item-center rounded-full p-1 text-sm item m-1"
                        :class="
                          editing_axis_index == column_index
                            ? 'text-white btn-indigo border-0'
                            : 'bg-neutral-100 text-gray-700'
                        "
                        v-for="(config, column_index) in axis"
                        :key="column_index"
                      >
                        <button
                          @click="editing_axis_index = column_index"
                          class="px-2 ring-0 focus:outline-none"
                        >
                          {{ config.column }}
                        </button>
                        <button
                          @click="deleteYAx(column_index)"
                          class="text-red-500 hover:ring-4 ring-red-400 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </draggable>

                    <div
                      v-show="!axis.length"
                      class="text-yellow-400 text-lg mb-1 animate-pulse inline-flex items-center"
                    >
                      <p>Add at least one axis</p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 ml-2 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                    <button
                      @click="addYax"
                      class="rounded-full hover:ring-4 ring-teal-500 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 stroke-current text-teal-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>
                  <objForm
                    v-if="editing_yax"
                    :obj.sync="editing_yax"
                    :config="config.axis"
                    :key="JSON.stringify(config.axis)"
                  ></objForm>
                </div>

                <!-- Map marker config -->
                <div
                  v-show="hasAxis && block.type == 'map'"
                  class="border-t pt-6"
                >
                  <p class="text-sm font-semibold text-gray-900">
                    Map Marker Config:
                  </p>
                  <objForm
                    v-if="editing_yax"
                    :obj.sync="editing_yax"
                    :config="config.axis"
                    :key="JSON.stringify(config.axis)"
                  ></objForm>
                </div>

                <!-- score card config -->
                <div
                  v-show="hasAxis && block.type == 'scorecard'"
                  class="border-t pt-6"
                >
                  <div
                    class="inline-flex flex-wrap items-center gap-2 w-full my-3"
                  >
                    <draggable v-model="axis" class="flex" draggable=".item">
                      <div
                        class="flex item-center rounded-full p-1 text-sm item"
                        :class="
                          editing_axis_index == column_index
                            ? 'btn-indigo text-white border-0'
                            : 'bg-neutral-100  text-gray-700'
                        "
                        v-for="(config, column_index) in axis"
                        :key="column_index"
                      >
                        <button
                          @click="editing_axis_index = column_index"
                          class="px-2 ring-0 focus:outline-none"
                        >
                          {{ config.label || `Card -` + (column_index + 1) }}
                        </button>
                        <button
                          @click="deleteYAx(column_index)"
                          class="text-red-500 hover:ring-4 ring-red-400 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </draggable>
                    <div
                      v-show="!axis.length"
                      class="text-yellow-400 text-lg mb-1 animate-pulse inline-flex items-center"
                    >
                      <p>Add at least one axis</p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 ml-2 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                    <button
                      @click="addYax"
                      class="rounded-full hover:ring-4 ring-teal-500 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 stroke-current text-teal-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>
                  <objForm
                    v-if="editing_yax"
                    :obj.sync="editing_yax"
                    :config="config.axis"
                    :key="JSON.stringify(config.axis)"
                  ></objForm>
                </div>

                <!-- Actions for table block -->
                <div
                  v-if="hasActions && block.type == 'table'"
                  class="border-t pt-6"
                >
                  <p class="text-sm font-semibold text-gray-900">Actions:</p>
                  <div
                    class="inline-flex flex-wrap items-center gap-2 w-full my-3"
                  >
                    <draggable
                      v-model="actions"
                      class="flex flex-row flex-wrap"
                      draggable=".item"
                    >
                      <div
                        class="flex item-center rounded-full p-1 text-sm item m-1"
                        :class="
                          editing_actions_index == column_index
                            ? 'text-white btn-indigo border-0'
                            : 'bg-neutral-100 text-gray-700'
                        "
                        v-for="(config, column_index) in actions"
                        :key="column_index"
                      >
                        <button
                          @click="editing_actions_index = column_index"
                          class="px-2 ring-0 focus:outline-none"
                        >
                          {{ config.title || config.column }}
                        </button>
                        <button
                          @click="deleteActions(column_index)"
                          class="text-red-500 hover:ring-4 ring-red-400 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </draggable>
                    <button
                      @click="addActions"
                      class="rounded-full hover:ring-4 ring-teal-500 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 stroke-current text-teal-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>
                  <objForm
                    v-if="editing_actions"
                    :obj.sync="editing_actions"
                    :config="config.actions"
                    :key="JSON.stringify(config.actions)"
                    :sheetColumns="names"
                  ></objForm>
                </div>

                <div
                  v-if="block.type === 'markdown'"
                  class="rounded bg-yellow-50 border border-yellow-400 p-3 border-t pt-6"
                >
                  <p>You can use the following variables in your markdown:</p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="(name, name_index) in names"
                      :key="name_index"
                      class="bg-gray-900 rounded text-sm font-mono select-all text-yellow-400 px-2 py-0.5"
                      >([{{ name }}])</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-6 min-h-screen"
          :style="{ 'background-color': board_background }"
        >
          <div class="sticky top-16" >
            <block :key="JSON.stringify(block) + random" :block="block"></block>
            <div class="sticky bottom-4" style="z-index:10000">
              <div
                class="grid grid-cols-2 gap-3 mt-5 rounded-lg bg-gray-50 border border-gray-200 p-3"
              >
                <button class="btn btn-red w-full" @click="cancelEdit">
                  Cancel
                </button>
                <button
                  class="btn btn-indigo w-full"
                  @click="saveBlock"
                  :class="{ loading: loadingSave }"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import draggable from "vuedraggable";

export default {
  async mounted() {
    this.sheet_title = this.sheet_title ?? this.sheets[0]?.title;
    this.fetch_data();
  },
  components: {
    draggable,
  },
  data() {
    return {
      editing_axis_index: 0,
      editing_actions_index: 0,
      loadingMessage: null,
      loadingSave: false,
      random: 2,
    };
  },
  computed: {
    ...mapState("board", [
      "tempo_block",
      "sheets_data",
      "board_background",
      "sheets",
      "palette",
    ]),
    ...mapGetters("board", ["sections_array"]),
    hasAxis() {
      return Object.keys(this.config.axis).length > 0;
    },
    hasActions() {
      if (this.block.type == "table") {
        return Object.keys(this.config.actions).length > 0;
      }
    },
    sheet_title: {
      get() {
        return this.block.sheet_title;
      },
      set(v) {
        this.$store.commit("board/MERGE_TEMPO_BLOCK", { sheet_title: v });
      },
    },
    block: {
      get() {
        return this.tempo_block;
      },
      set(v) {
        this.$store.commit("board/MERGE_TEMPO_BLOCK", v);
      },
    },

    config() {
      const configs = require("~/assets/files/blocks.json");
      const config = configs[this.block.type];
      if (this.block.type == "map") {
        return {
          block: this.setDefaultOptions(config.block),
          axis: this.setDefaultOptionsTabColumns(config.axis),
        };
      } else if (this.block.type == "table") {
        return {
          block: this.setDefaultOptions(config.block),
          axis: this.setDefaultOptions(config.axis),
          actions: this.setDefaultOptions(config.actions),
        };
      } else {
        return {
          block: this.setDefaultOptions(config.block),
          axis: this.setDefaultOptions(config.axis),
        };
      }
    },

    names() {
      return this.sheets_data?.[this.sheet_title]?.columns || [];
    },

    available_y_names() {
      const used = this.axis.map((c) => c.column);
      return this.names.filter((name) => !used.includes(name));
    },

    // available_actions_names() {
    //   if (this.block.type == "table") {
    //     const used = this.actions.map((c) => c.column);
    //     return this.names.filter((name) => !used.includes(name));
    //   }
    // },

    axis: {
      get() {
        return this.block.axis;
      },
      set(v) {
        this.$store.commit("board/MERGE_TEMPO_BLOCK", { axis: v });
      },
    },

    actions: {
      get() {
        return this.block.actions || [];
      },
      set(v) {
        this.$store.commit("board/MERGE_TEMPO_BLOCK", { actions: v });
      },
    },

    editing_yax: {
      get() {
        return this.block.axis[this.editing_axis_index] || null;
      },
      set(v) {
        const temp = [...this.axis];
        temp[this.editing_axis_index] = v;
        this.$store.commit("board/MERGE_TEMPO_BLOCK", { axis: temp });
      },
    },

    editing_actions: {
      get() {
        if (this.block.actions) {
          return this.block.actions[this.editing_actions_index] || null;
        }
      },
      set(v) {
        const temp = [...this.actions];
        temp[this.editing_actions_index] = v;
        this.$store.commit("board/MERGE_TEMPO_BLOCK", { actions: temp });
      },
    },
  },

  methods: {
    setDefaultOptions(conf) {
      // Set dynamic options for the configs
      const current = this.editing_yax?.column;
      const dynamic_options = {
        x_axis: this.names,
        column: this.names,
        section: this.sections_array,
        stack_with: [null, ...this.available_y_names],
      };
      for (const [name, val] of Object.entries(dynamic_options)) {
        if (conf.hasOwnProperty(name)) {
          conf[name].options = val;
        }
      }
      return conf;
    },

    // set columns as option for the field
    setDefaultOptionsTabColumns(conf) {
      for (const [name, val] of Object.entries(conf)) {
        if (conf.hasOwnProperty(name)) {
          conf[name].options = this.names;
        }
      }
      return conf;
    },

    async updateMetadata() {
      this.loadingMessage = "Updating Sheets...";
      await this.$store.dispatch("board/update_metadata", {
        board_id: this.$route.params.board_id,
        workspace_id: this.$route.params.workspace_id,
      });
      this.loadingMessage = "Updating Data";
      delete this.sheets_data[this.sheet_title]; // = null
      await this.fetch_data();
      this.random = Math.random();
      this.loadingMessage = null;
    },

    cancelEdit() {
      this.$store.commit("board/SET_TEMPO_BLOCK");
      this.$store.commit("board/UPDATE", { page: "view" });
    },
    change_data_source() {
      this.$store.commit("board/MERGE_TEMPO_BLOCK", {
        sheet_title: this.sheet_title,
      });
      this.fetch_data();
    },
    async fetch_data() {
      this.loadingMessage = `Fetching data for ${this.sheet_title}`;
      if (!this.sheets_data[this.sheet_title]) {
        // Update if not available
        await this.$store.dispatch("board/update_data", {
          sheet_titles: [this.sheet_title],
        });
      }
      this.setEmptyAxis();
      this.loadingMessage = null;
    },
    setEmptyAxis() {
      // Used to update axis names when data source is updated or changes
      const names = this.names;
      const current_x = this.block.x_axis;
      if (!this.names.length) {
        return;
      }
      if (!names.includes(current_x)) {
        this.$store.commit("board/MERGE_TEMPO_BLOCK", { x_axis: names[0] });
      }
      if (!this.axis.length) {
        this.addYax();
        return;
      }
      const updated_names = this.axis.map((ax) => {
        const new_name = names.includes(ax.column) ? ax.column : names[0];
        return { ...ax, column: new_name };
      });
      this.$store.commit("board/MERGE_TEMPO_BLOCK", { axis: updated_names });
    },
    deleteYAx(index) {
      if (this.block.type == "scorecard") {
        if (this.axis.length == 1) {
          alert(`Min 1 card is required.`);
          return;
        }
      }
      const copy = [...this.axis];
      copy.splice(index, 1);
      this.axis = copy;
      this.editing_axis_index = this.axis.length - 1;
    },

    deleteActions(index) {
      if (this.block.type == "table") {
        const copy = [...this.actions];
        copy.splice(index, 1);
        this.actions = copy;
        this.editing_actions_index = this.actions.length - 1;
      }
    },

    addYax() {
      const name = this.available_y_names[0];
      if (this.block.type == "scorecard") {
        if (this.axis.length == 4) {
          alert(`Max 4 cards allowed.`);
          return;
        }
      } else if (name === undefined) {
        alert(
          `You are already using all the available columns:\n(${this.names.join(
            ", "
          )})`
        );
        return;
      }
      const default_config = Object.fromEntries(
        Object.entries(this.config.axis).map((entry) => [
          entry[0],
          entry[1].default_value,
        ])
      );
      default_config.column = name;

      // const colors = ["#003049","#d62828","#f77f00","#fcbf49","#eae2b7"]
      // const random_color = `#${Math.floor(Math.random()*16777215).toString(16)}`
      // const ax_index = this.axis.length
      // for (const color of ["backgroundColor", "borderColor"]){
      // 	if (default_config[color]){
      // 		default_config[color] = this.palette[ax_index] || random_color
      // 	}
      // }

      this.axis = [...this.axis, default_config];
      this.editing_axis_index = this.axis.length - 1;
    },

    addActions() {
      if (this.block.type == "table") {
        const name = `Action-${this.actions?.length + 1 || 1}`;

        const default_config = Object.fromEntries(
          Object.entries(this.config.actions).map((entry) => [
            entry[0],
            entry[1].default_value,
          ])
        );
        default_config.column = name;

        this.actions = [...this.actions, default_config];
        this.editing_actions_index = this.actions.length - 1;
      }
    },

    async saveBlock() {
      this.loadingSave = true;
      const block = this.block;
      await this.$axios.$put(`/api/board/block`, block);
      this.$router.go();
    },
  },
};
</script>

<style>
</style>
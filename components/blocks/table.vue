<template>
  <div class="h-full">
    <ConfirmPopup></ConfirmPopup>

    <Galleria
      :value="images"
      :showThumbnails="false"
      :showIndicators="true"
      :showItemNavigators="true"
      :fullScreen="true"
      :circular="true"
      :visible.sync="image_gallery_popup"
    >
      <template #item="slotProps">
        <img
          :src="slotProps.item"
          :alt="slotProps.item"
          class="w-4/6"
          style="max-height: 700px"
        />
      </template>
    </Galleria>

    <div class="">
      <div class="w-full overflow-x-auto">
        <ClientOnly>
          <DataTable
            :scrollable="block.freeze_actions_column == true"
            class="p-datatable-sm"
            :rowClass="
              () => {
                return 'text-sm';
              }
            "
            ref="dt"
            :loading="loading"
            :value="with_index"
            :paginator="block.paginate"
            :rows="parseInt(block.rows_per_page) || 12"
            filterDisplay="menu"
            :filters.sync="filters"
            :globalFilterFields="headers"
            @row-click="readonly_details"
            :rowHover="true"
            responsiveLayout="scroll"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          >
            <template #header>
              <div class="flex justify-end items-center">
                <Button
                  class="mr-5 btn"
                  v-if="has_add_row_privilage"
                  @click="add_row"
                  :style="
                    'background:' +
                    block.add_row_button_color +
                    ';color:' +
                    block.add_row_text_color
                  "
                  >{{ block.add_row_button_title || "Add Row" }}</Button
                >
                <label class="mr-5">Search</label>
                <div>
                  <div
                    class="mx-auto bg-white focus:bg-white p-0.5 overflow-hidden rounded-lg text-xl border border-gray-200 flex items-center"
                    style=""
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-6 h-6 mx-3 cursor-pointer text-gray-600 stroke-current"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                    <input
                      v-model="filters['global'].value"
                      placeholder="Enter keyword"
                      class="w-full p-2 bg-transparent text-sm placeholder:font-thin placeholder:text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </template>
            <template #empty>
              <p class="text-center">No results to show.</p>
            </template>
            <Column
              v-for="(h, i) in headers"
              :sortable="!lazy"
              :header="h"
              :field="h"
              :sortField="sortField(h)"
              :key="i + 'dataTable'"
              :styles="{
                width:
                  (block.freeze_actions_column
                    ? block.column_width || 200
                    : settings_per_header[h].column_width) + 'px !important',
              }"
            >
              <template #body="slot">
                <div
                  v-if="settings_per_header[h].type == 'image'"
                  class="text-center"
                  @click.prevent.stop="showImagesGallery(slot.data[h])"
                  :style="{
                    width: block.freeze_actions_column
                      ? ''
                      : settings_per_header[h].column_width + 'px !important',
                  }"
                >
                  <div v-if="slot.data[h]">
                    <img
                      class="w-24 mx-auto"
                      :src="i.trim()"
                      v-for="(i, index) in slot.data[h].split(',')"
                      :key="i"
                      v-show="index == '0'"
                    />

                    <div class="mt-2">
                      <span v-if="slot.data[h].split(',').length > 1">
                        +{{ slot.data[h].split(",").length - 1 }} more
                      </span>
                    </div>
                  </div>
                </div>
                <!-- :style="{
                    width:
                      settings_per_header[h].column_width + 'px !important',
                  }" -->
                <a
                  :href="slot.data[h]"
                  target="_blank"
                  class="underline break-all"
                  :style="{
                    width: block.freeze_actions_column
                      ? ''
                      : settings_per_header[h].column_width + 'px !important',
                  }"
                  v-else-if="settings_per_header[h].type == 'url'"
                  >{{
                    limitChars(
                      slot.data[h],
                      settings_per_header[h].character_limit
                    )
                  }}</a
                >
                <!-- :style="{
                    width:
                      settings_per_header[h].column_width + 'px !important',
                  }" -->
                <mrk2html
                  class="break-normal"
                  :style="{
                    width: block.freeze_actions_column
                      ? ''
                      : settings_per_header[h].column_width + 'px !important',
                  }"
                  v-else-if="
                    settings_per_header[h].type == 'markdowntext' ||
                    settings_per_header[h].use_markdown
                  "
                  :markdown="
                    limitChars(
                      slot.data[h],
                      settings_per_header[h].character_limit
                    )
                  "
                ></mrk2html>
                <!-- :style="{
                    width:
                      settings_per_header[h].column_width + 'px !important',
                  }" -->
                <div
                  v-else
                  class="break-normal"
                  :style="{
                    width: block.freeze_actions_column
                      ? ''
                      : settings_per_header[h].column_width + 'px !important',
                  }"
                >
                  {{
                    limitChars(
                      slot.data[h],
                      settings_per_header[h].character_limit
                    )
                  }}
                </div>
              </template>
            </Column>
            <Column
              header="Actions"
              v-show="has_action_privilage && actions"
              :frozen="block.freeze_actions_column"
              alignFrozen="right"
              key="actions-datatable"
            >
              <template #body="slot">
                <div
                  class="flex"
                  :class="{ 'flex-wrap': block.freeze_actions_column }"
                >
                  <div v-if="slot.data.deleting" class="btn mt-3 mr-2">
                    <svg
                      class="animate-spin h-5 w-5 text-red-500 mx-auto mr-5"
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
                    Deleting ...
                  </div>
                  <button
                    v-else
                    :style="
                      'background:' + a.button_color + ';color:' + a.text_color
                    "
                    v-for="(a, i) in actions"
                    :key="i + a.title"
                    class="btn mt-3 mr-2"
                    @click.stop="action(slot, a, i)"
                  >
                    <span
                      v-if="
                        (slot.data.downloading && a.type == 'Download pdf') ||
                        (slot.data.api_processing && a.type == 'API call')
                      "
                    >
                      <svg
                        class="animate-spin h-5 w-5 mx-auto"
                        :style="'color:' + a.text_color"
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
                    <span v-else>{{ a.title }}</span>
                  </button>
                </div>
              </template>
            </Column>
          </DataTable>
        </ClientOnly>
      </div>
      <div
        v-if="expanded_row"
        class="h-full w-full fixed top-0 bottom-0 right-0 flex z-30"
      >
        <div class="w-4/12 bg-black bg-opacity-70" @click="closeSidebar()">
          <div class="flex justify-end p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-red-500 cursor-pointer"
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
          </div>
        </div>
        <transition name="slide-right">
          <div class="w-8/12 bg-white p-3 overflow-y-scroll z-5 pb-6">
            <form @submit.prevent="saveEdits">
              <ul class="space-y-3">
                <li v-for="(val, key) in expanded_row" :key="key">
                  <div v-if="key != '_id'">
                    <span class="font-semibold">{{ key }}</span
                    >:
                    <div
                      v-if="
                        !readonly &&
                        (expand_index == -1 ||
                          duplicate ||
                          editable_fields.includes(key))
                      "
                      class="rounded text-sm border border-gray-200"
                    >
                      <!-- </formInput>settings_per_header[key].options -->
                      <formInput
                        :name="key"
                        :value.sync="edited_data[key]"
                        :type="settings_per_header[key].type"
                        :options="
                          getColumnOptions(key, settings_per_header[key])
                        "
                        :required="settings_per_header[key].required"
                        :image_source="settings_per_header[key].image_source"
                        :add_class="
                          settings_per_header[key].image_source ==
                          'Upload Image'
                            ? 'table-block-upload-image'
                            : ''
                        "
                      ></formInput>
                    </div>

                    <div
                      v-else-if="
                        readonly &&
                        settings_per_header[key].type == 'image' &&
                        val &&
                        val.trim() != ''
                      "
                      class="flex"
                    >
                      <div v-for="i of val.split(',')" :key="i">
                        <img :src="i" class="w-12 h-12 object-cover m-2" />
                      </div>
                    </div>
                    <div
                      v-else-if="
                        !readonly && settings_per_header[key].type == 'image'
                      "
                    >
                      <!-- Do nothing it will in form -->
                    </div>
                    <mrk2html
                      v-else-if="
                        readonly && settings_per_header[key].use_markdown
                      "
                      :markdown="val"
                    ></mrk2html>
                    <div v-else class="break-all">{{ val }}</div>
                  </div>
                </li>
              </ul>
              <button
                v-if="
                  !readonly &&
                  (editable_fields.length ||
                    expand_index == -1 ||
                    duplicate == true)
                "
                type="submit"
                v-show="hasEditable"
                :class="{ loading: saving_edits }"
                class="btn btn-green my-3"
                :style="saveBtnStyle"
              >
                {{ block.submit_button_title || "Save Changes" }}
              </button>
            </form>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import ConfirmPopup from "primevue/confirmpopup";
import Dialog from "primevue/dialog";
import Galleria from "primevue/galleria";

let html2pdf;

import dayjs from "dayjs";
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
import { FilterMatchMode } from "primevue/api";
import Column from "primevue/column";
import { mapState } from "vuex";
export default {
  components: {
    DataTable,
    Column,
    InputText,
    ConfirmPopup,
    Dialog,
    Galleria,
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

  data() {
    return {
      filters: {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      },

      loading: false,
      image_gallery_popup: false,

      success_message: "",
      error_message: "",

      duplicate: false,
      // activeIndex: 1,

      images: [],
      readonly: false,
      expand_index: null,
      rows_per_page: 10,
      filterTerm: "",
      sortBy: {
        name: null,
        ascending: false,
      },

      edited_data: {},
      saving_edits: false,
      with_index:
      this.json
        .map((row, row_index) => ({
          ...row,
          chartmat_row_index: row_index,
          deleting: false,
          downloading: false,
          api_processing: false,
        }))
        .map((row, row_index) => {
          for (const h in row) {
            const colIsDateTime = ["date", "datetime-local", "time"].includes(
              this.block.axis.find((a) => h == a.column)?.type
            );
            if (colIsDateTime) {
              row[h + "_millies"] = dayjs(row[h]).unix();
            }
          }

          return row;
        })
        .filter((r) => {
          if (r["_id"] && sessionStorage.getItem("_id")) {
            return r["_id"] == sessionStorage.getItem("_id");
          }
          return true;
        }),
    };
  },
  mounted() {
    html2pdf = require("html2pdf.js");
  },
  computed: {
    ...mapState("board", [
      "sheets_data",
      "spreadsheetId",
      "user_role",
      "board_background",
    ]),
    saveBtnStyle() {
      const style = {};
      style["color"] = this.block.submit_button_text_color;
      style["background"] = this.block.submit_button_color;
      style["border"] = "none !important";
      return style;
    },
    headers() {
      return this.block.axis.filter((ax) => !ax.hidden).map((ax) => ax.column);
    },
    actions() {
      return this.block.actions;
    },
    hasEditable() {
      return this.block.axis.some((ax) => ax.editable);
    },
    hasHiddenOrEditable() {
      return this.block.axis.some((ax) => ax.hidden || ax.editable);
    },
    settings_per_header() {
      return Object.fromEntries(this.block.axis.map((ax) => [ax.column, ax]));
    },
    search_filtered() {
      const rows = this.json.filter((i) => {
        const values = Object.values(i) || "";
        return JSON.stringify(values)
          .toLowerCase()
          .includes(this.filterTerm.toLowerCase());
      });
      const { name, ascending } = this.sortBy;
      if (!name) {
        return rows;
      } else {
        if (ascending) {
          return rows.sort((a, b) => (a[name] > b[name] ? -1 : 1));
        } else {
          return rows.sort((a, b) => (a[name] < b[name] ? -1 : 1));
        }
      }
    },

    expanded_row() {
      if (this.expand_index !== null) {
        const row = this.with_index[this.expand_index];
        if (!row) {
          return Object.fromEntries(
            this.block.axis.map((ax) => [ax.column, ""])
          );
        }
        return Object.fromEntries(
          this.block.axis.map((ax) => [ax.column, row[ax.column]])
        );
      }
    },

    rows_per_page_values() {
      const divisible_by_10 = Math.floor(this.search_filtered.length / 10);
      const arr = Array.from(Array(divisible_by_10).keys()).map(
        (n) => n * 10 + 10
      ); //.filter(n => n !== 0)
      return arr.length ? arr : [10];
    },

    has_add_row_privilage() {
      const roles = {
        admin: ["Admins", "Admins & Guests", "Everyone"],
        guest: ["Admins & Guests", "Everyone"],
        public: ["Everyone"],
      };
      const role = this.user_role ?? "public";
      const who_can_edit = this.block.add_new_row ?? "None";
      if (this.$auth.user) {
        return roles[role].includes(who_can_edit);
      }
      // For otp based sign-in
      else if (
        who_can_edit == "Everyone" &&
        (this.$store.state.board.sign_in_method == "No sign in" ||
          this.$store.state.board.sign_in_method ==
            "Use password set by admin" ||
          sessionStorage.getItem("permission") == "read-write")
      ) {
        return true;
      }
    },

    has_action_privilage() {
      const roles = {
        admin: ["Admins", "Admins & Guests", "Everyone"],
        guest: ["Admins & Guests", "Everyone"],
        public: ["Everyone"],
      };
      const role = this.user_role ?? "public";
      const who_can_see = this.block.action_button_visibility ?? "None";
      if (this.$auth.user) {
        return roles[role].includes(who_can_see);
      }
      // For otp based sign-in
      else if (
        who_can_see == "Everyone" &&
        (this.$store.state.board.sign_in_method == "No sign in" ||
          this.$store.state.board.sign_in_method ==
            "Use password set by admin" ||
          sessionStorage.getItem("permission") == "read-write")
      ) {
        return true;
      }
    },

    editable_fields() {
      // const is_editable = this.settings_per_header[key].editable ?? "None"
      //POSSIBLE ROLES ARE: ["Admins", "Admins & Guests", "None", "Everyone"],
      const roles = {
        admin: ["Admins", "Admins & Guests", "Everyone"],
        guest: ["Admins & Guests", "Everyone"],
        public: ["Everyone"],
      };
      const role = this.user_role ?? "public";
      const fields = this.block.axis
        .map((ax) => ax.column)
        .filter((key) => {
          const who_can_edit = this.settings_per_header[key].editable ?? "None";
          // For logged in users
          if (this.$auth.user) {
            return roles[role].includes(who_can_edit);
          }
          // For otp based sign-in
          else if (
            who_can_edit == "Everyone" &&
            (this.$store.state.board.sign_in_method == "No sign in" ||
              this.$store.state.board.sign_in_method ==
                "Use password set by admin" ||
              sessionStorage.getItem("permission") == "read-write")
          ) {
            return true;
          }
        });
      return fields;
    },
  },
  methods: {
    async onPage(e) {

      const BEANSTALK_ENDPOINT = await this.$axios.$get('/api/getENV/BEANSTALK_ENDPOINT');

      const params = {
        board: window.location.pathname.replace("/", ""),
        referer: window.location.href,
      };
      this.lazyParams = e;
      this.loading = true;
      const url = `${BEANSTALK_ENDPOINT}/v2/api/board/block/${this.block.id}/${this.spreadsheetId}/sheet/${this.block.sheet_title}?after=${e.first}`;
      const r = await this.$axios.$post(
        url,
        {
          columns: this.block.axis.map((a) => a.column),
          total_records: this.totalRecords,
        },
        { params }
      );
      //  just updating the local data, not the store...
      this.with_index = r.data[this.block.id].rows
        .map((row, row_index) => ({
          ...row,
          // chartmat_row_index: row_index, // This logic has been shifted to the beanstalk
          deleting: false,
          downloading: false,
          api_processing: false,
        }))
        .map((row, row_index) => {
          for (const h in row) {
            const colIsDateTime = ["date", "datetime-local", "time"].includes(
              this.block.axis.find((a) => h == a.column)?.type
            );
            if (colIsDateTime) {
              row[h + "_millies"] = dayjs(row[h]).unix();
            }
          }
          return row;
        })
        .filter((r) => {
          if (r["_id"] && sessionStorage.getItem("_id")) {
            return r["_id"] == sessionStorage.getItem("_id");
          }
          return true;
        });
      this.loading = false;
    },

    options_from_sheet(axis) {
      const data = this.sheets_data[axis.source_sheet]?.json;
      return data
        ? Array.from(new Set(data.map((d) => d[axis.source_column])))
        : [];
    },

    getColumnOptions(k, v) {
      const {
        type,
        column,
        options,
        from_google_sheet,
        source_sheet,
        source_column,
      } = v;

      if (type === "select" || type === "multi-select") {
        if (from_google_sheet) {
          if (source_sheet && source_column) {
            return this.options_from_sheet(v).join(",");
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

    downloadAsPDF(data, template, action) {
      try {
        data.downloading = true;

        for (const column of this.columns) {
          const value = data[column] ?? "";
          template = template.replaceAll(`([${column}])`, value);
        }

        var opt = {
          margin: 15,
          filename: `${Date.now().valueOf()}.pdf`,
          image: { type: "jpeg", quality: 1 },
          html2canvas: {
            scale: 2,
            letterRendering: true,
            useCORS: true,
            imageTimeout: 0,
            allowTaint: true,
          },
          jsPDF: {
            unit: "pt",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: {
            after: ".page-break",
            mode: ["avoid-all", "css", "legacy"],
          },
        };
        this.$nextTick(async () => {
          template = template.replace(
            "</body>",
            "<div style='height:10px'>  </div></body>"
          );
          const body = template;
          await html2pdf().set(opt).from(body).save();
          data.downloading = false;
          this.$toast.add({
            severity: "success",
            summary: "Success",
            detail: action.success_message || "PDF downloaded successfully.",
            life: 3000,
          });
        });
      } catch (e) {
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail:
            action.error_message || "Something went wrong. Please try again.",
          life: 3000,
        });
      }
    },
    limitChars(text, limit) {
      if (limit && text && text.length > limit) {
        return `${text.substr(0, limit)}...`;
      }
      return text;
    },
    showImagesGallery(imagesList) {
      this.image_gallery_popup = true;
      this.images = imagesList
        .split(",")
        .filter((url) => url)
        .map((url) => url.trim());
    },
    sortField(h) {
      return this.with_index &&
        this.with_index.length > 0 &&
        this.with_index[0][h + "_millies"]
        ? h + "_millies"
        : h;
    },

    action(data, action, index) {
      switch (action.type) {
        case "Edit row":
          this.duplicate = false;
          this.success_message =
            action.success_message || "Row edited successfully";
          this.error_message =
            action.error_message || "Something went wrong. Please try again";
          this.expand_row_datatable(data);
          break;

        case "Duplicate row":
          this.duplicate = true;
          this.success_message =
            action.success_message || "Row duplicated successfully";
          this.error_message =
            action.error_message || "Something went wrong. Please try again";
          this.clone_row_datatable(data);
          break;

        case "Delete row":
          const vm = this;
          vm.$confirm.require({
            target: event.currentTarget,
            message: "Are you sure you want to delete this record?",
            icon: "pi pi-exclamation-triangle",
            acceptClass: "text-blue-500",
            accept: () => {
              //callback to execute when user confirms the action
              vm.deleteRow(data.data, action);
            },
            reject: () => {
              //callback to execute when user rejects the action
            },
            onShow: () => {
              //callback to execute when popup is shown
            },
            onHide: () => {
              //callback to execute when popup is hidden
            },
          });
          break;

        case "Open link":
          let link = data.data[action.source_column];
          link = link.startsWith("http") ? link : `http://${link}`;
          window.open(link, "_blank");
          break;

        case "Compose Email":
          window.open(
            `mailto:${data.data[action.source_column]}?subject=Subject`,
            "_blank"
          );
          break;

        case "Copy to clipboard":
          this.$toast.add({
            severity: "success",
            summary: "Success",
            detail: action.success_message || "Copied to clipboard",
            life: 3000,
          });
          const dataToCopy = this.sheets_data[this.block.sheet_title].columns
            .map((c) => data.data[c])
            .join("|");
          navigator.clipboard.writeText(dataToCopy);

          break;

        case "Download pdf":
          this.downloadAsPDF(data.data, action.pdf_template, action);
          break;

        case "API call":
          this.makeAPICall(data.data, index, action);
          break;
      }
    },

    sortTable(name) {
      if (name === this.sortBy.name) {
        this.sortBy.ascending = !this.sortBy.ascending;
      } else {
        this.sortBy = { name: name, ascending: true };
      }
    },

    expand_row(row_index) {
      if (this.hasHiddenOrEditable) {
        this.expand_index = this.expand_index === row_index ? null : row_index;
        this.edited_data = { ...this.expanded_row };
      }
    },

    async makeAPICall(data, action_index, action) {
      const api_processing_index = this.with_index.findIndex(
        (r) => r.chartmat_row_index == data.chartmat_row_index
      );
      this.with_index[api_processing_index].api_processing = true;
      try {
        data["([logged in user email])"] =
          sessionStorage.getItem("email") || this.$auth?.user?.email || "";
        const res = await this.$axios.post(`/api/board/api_call`, {
          id: this.block.id,
          action_index: action_index,
          data: data,
        });
        this.$toast.add({
          severity: "success",
          summary: "Success",
          detail: action.success_message || "Data sent to API",
          life: 3000,
        });
      } catch (e) {
        // alert(e);
        this.$toast.add({
          severity: "error",
          summary: "Success",
          detail:
            action.error_message || "Something went wrong. Please try again.",
          life: 3000,
        });
      }
      this.with_index[api_processing_index].api_processing = false;
    },
    add_row() {
      this.readonly = false;
      this.expand_index = -1;
      this.edited_data = {};
    },

    readonly_details(event) {
      if (this.block.show_details_on_click) {
        this.readonly = true;
        if (this.hasHiddenOrEditable) {
          // this.expand_index = this.expand_index === row_index ? null : row_index;
          this.expand_index =
            this.expand_index === event.data.chartmat_row_index
              ? null
              : event.data.chartmat_row_index;
          this.edited_data = event.data;
        }
      }
    },

    expand_row_datatable(event) {
      // const row_index = event.index;
      this.readonly = false;
      let data = Object.assign({}, event.data);
      if (this.hasHiddenOrEditable) {
        // this.expand_index = this.expand_index === row_index ? null : row_index;
        this.expand_index =
          this.expand_index === data.chartmat_row_index
            ? null
            : data.chartmat_row_index;
        this.edited_data = data;
      }
    },

    clone_row_datatable(event) {
      // const row_index = event.index;
      let data = Object.assign({}, event.data);
      this.readonly = false;
      if (this.hasHiddenOrEditable) {
        // this.expand_index = this.expand_index === row_index ? null : row_index;
        this.expand_index =
          this.expand_index === data.chartmat_row_index
            ? null
            : data.chartmat_row_index;
        this.edited_data = data;
      }
    },

    downloadCSV() {
      // Removes unused columns for this block
      const columns_in_this_block = this.block.axis.map((ax) => ax.column);
      let json = this.search_filtered.map((obj) => {
        const entries = columns_in_this_block.map((column) => [
          column,
          obj[column],
        ]);
        return Object.fromEntries(entries);
      });
      if (!json.length) {
        // Empty data
        alert("Nothing to download!");
        return;
      }
      let fields = Object.keys(json[0]);
      let replacer = function (key, value) {
        return value === null ? "" : value;
      };
      let csv = json.map(function (row) {
        return fields
          .map(function (fieldName) {
            return JSON.stringify(row[fieldName], replacer);
          })
          .join(",");
      });
      csv.unshift(fields.join(","));
      csv = csv.join("\r\n");

      /* The code that downloads the CSD data as a .csv file*/
      let downloadLink = document.createElement("a");
      let blob = new Blob(["\ufeff", csv]);
      let url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "sheet.csv"; //Name the file here
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },

    async deleteRow(data, action) {
      if (
        data.chartmat_row_index != undefined ||
        data.chartmat_row_index != null
      ) {
        // Deletion goes with array index
        const index_to_delete = this.with_index.findIndex(
          (r) => r.chartmat_row_index == data.chartmat_row_index
        );
        this.with_index[index_to_delete].deleting = true;

        try {
          await this.$axios.delete(
            `/api/board/${this.spreadsheetId}/sheet/${this.block.sheet_title}?row=${data.chartmat_row_index}`
          );
          await this.$store.dispatch("board/update_data", {
            sheet_titles: [this.block.sheet_title],
            skip_cache: true,
          });

          this.$toast.add({
            severity: "success",
            summary: "Success",
            detail: action.success_message || "Row deleted successfully",
            life: 3000,
          });
        } catch (e) {
          this.$toast.add({
            severity: "error",
            summary: "Error",
            detail:
              action.error_message || "Something went wrong. Please try again.",
            life: 3000,
          });
        }
      }
    },

    async uploadFile() {
      const file_inputs = document.querySelectorAll(".imageUploader");
      const files = {};
      if (file_inputs.length) {
        for (const file of file_inputs) {
          for (let f of file.files) {
            const formData = new FormData();
            // Have to filter the files not in the current form
            if (!this.columns.includes(file.name)) {
              continue;
            }
            formData.append(f.name, f);
            const url = await this.$axios.$post("/api/upload-file", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            files[file.name] = url + "," + files[file.name] || "";
          }
          files[file.name] = files[file.name]?.trim().replace(",undefined", "");
        }
      }
      return files;
    },

    async saveEdits() {
      // const row = this.final.rows[this.expand_index];
      const row = this.json[this.expand_index];
      // Find duplicates rows so we know which one we need to edit
      const sheets_data = JSON.parse(JSON.stringify(this.sheets_data));
      const non_filtered = sheets_data[this.block.sheet_title]?.json;

      // Find all indexes of this row:
      const indexes = [];
      for (let i = 0; i < non_filtered.length; i++) {
        if (JSON.stringify(non_filtered[i]) === JSON.stringify(row)) {
          indexes.push(i);
        }
      }

      let row_to_be_edited = indexes[0]; //0 // If Row is unique, only one index

      let incoming_data = this.edited_data;
      row_to_be_edited = this.duplicate ? "" : incoming_data.chartmat_row_index; //Raw to be updated at sheet.

      let new_data = Object.assign({}, incoming_data);
      const can_be_edited_axes = this.block.axis
        .filter((ax) => ax.editable && ax.editable !== "None")
        .map((ax) => ax.column);

      if (this.expand_index == -1 || this.duplicate) {
        // duplicate will contain chartmat_row_index of original row
        delete new_data["chartmat_row_index"];
        delete new_data["deleting"];
        delete new_data["api_processing"];
        delete new_data["downloading"];
        // Do nothing
      } else {
        for (const key of Object.keys(new_data)) {
          if (!can_be_edited_axes.includes(key)) {
            delete new_data[key];
          }
        }
      }

      // filter only data where belongs to the cols
      for (const key of Object.keys(new_data)) {
        if (!this.columns.includes(key)) {
          delete new_data[key];
        }
      }

      // Inject email if we have such field in session
      if (sessionStorage.getItem("_id")) {
        new_data["_id"] = sessionStorage.getItem("_id");
      }

      this.saving_edits = true;
      const uploaded = await this.uploadFile();
      // merge content
      const keys = Object.keys(uploaded);
      const files = {};

      for (let key of keys) {
        files[key] = `${new_data[key]}`;
        if (uploaded[key]) {
          files[key] = `${new_data[key]},${uploaded[key]}`;
        }
        if (files[key].trim() != "") {
          files[key] = files[key]
            .split(",")
            .filter((k) => k && k != "undefined")
            .join(",");
        }
      }
      new_data = { ...new_data, ...files };

      try {
        if (Number.isInteger(row_to_be_edited)) {
          await this.$axios.put(
            `/api/board/${this.spreadsheetId}/sheet/${this.block.sheet_title}?row=${row_to_be_edited}`,
            new_data
          );
        } else {
          await this.$axios.put(
            `/api/board/${this.spreadsheetId}/sheet/${this.block.sheet_title}`,
            new_data
          );
        }

        // UPDATE DATA
        this.closeSidebar();
        if (this.duplicate || this.expand_index != -1) {
          this.$toast.add({
            severity: "success",
            summary: "Success",
            detail: this.success_message,
            life: 3000,
          });
        }

        // update current page
        if (this.lazy) {
          await this.onPage(this.lazyParams);
        } else {
          // fallback
          await this.$store.dispatch("board/update_data", {
            sheet_titles: [this.block.sheet_title],
            skip_cache: true,
          });
        }

        this.duplicate = false;
        this.saving_edits = false;
      } catch (e) {
        if (this.duplicate || this.expand_index != -1) {
          this.$toast.add({
            severity: "error",
            summary: "Error",
            detail: this.error_message,
            life: 3000,
          });
        }
      }
    },

    closeSidebar() {
      this.expand_index = null;
      this.edited_data = {};
    },
  },
};
</script>

<style scoped>
>>> .pi {
  font-size: 1rem !important;
}

>>> .p-galleria .p-galleria-item-nav {
  width: 2rem !important;
  height: 2rem !important;
}
>>> .p-galleria .p-galleria-close {
  width: 2rem !important;
  height: 2rem !important;
}
>>> .p-galleria-indicator button {
  width: 0.5rem !important;
  height: 0.5rem !important;
}
</style>
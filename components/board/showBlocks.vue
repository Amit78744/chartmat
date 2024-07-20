<template>
  <div class="min-h-screen" :style="{ 'background-color': board_background }">
    <!-- Header -->
    <div v-show="showHeader" :style="{ 'background-color': hero_background }">
      <!-- Sections menu bar + logo  -->

      <!-- Desktop -->
      <div
        class="hidden md:block border-b"
        style="border-color: rgba(100, 100, 100, 0.25)"
      >
        <div
          class="container hidden md:flex justify-between mx-auto items-center"
        >
          <div class="px-5 py-3 flex w-24">
            <img v-if="logo" class="w-full" :src="logo" />
          </div>
          <div
            class="
              px-5
              py-3
              col-span-8
              items-center
              justify-center
              gap-3
              hidden
              md:flex
            "
          >
            <div>
              <div
                v-show="sections_array.length && !$route.query.section"
                id="select-section"
              >
                <ul
                  class="inline-flex flex-wrap gap-2 whitespace-nowrap w-full"
                >
                  <li
                    v-for="(section, section_index) in all_sections"
                    :key="section_index"
                    @click="current_section = section"
                    :class="section_selector_class(current_section, section)"
                    :style="section_selector_style(current_section, section)"
                    class="px-3 py-1 rounded cursor-pointer select-none"
                  >
                    {{ section }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- Login Avatar -->
          <div class="relative px-5 py-3">
            <div
              v-if="!$auth.user && sign_in_method != 'No sign in'"
              class="relative"
              @click.prevent="showNavbarMenu = !showNavbarMenu"
            >
              <div
                :style="{
                  background: active_section_background_color || '#fff',
                  color: active_section_text_color || '#000',
                }"
                class="
                  m-1
                  mr-2
                  w-10
                  h-10
                  relative
                  flex
                  justify-center
                  items-center
                  rounded-full
                  text-xl
                  uppercase
                  cursor-pointer
                "
              >
                {{ emailFirstLetter }}
              </div>
            </div>
            <div
              v-show="showNavbarMenu"
              class="
                z-10
                absolute
                rounded
                border border-gray-200
                bg-white
                shadow-xl
                mt-3
                right-0
              "
            >
              <ul class="text-sm font-semibold text-gray-700">
                <li class="block cursor-pointer hover:bg-gray-100" v-if="email">
                  <div
                    class="
                      inline-flex
                      w-full
                      items-center
                      px-6
                      py-2
                      border-b border-gray-200
                    "
                  >
                    {{ email }}
                  </div>
                </li>
                <li class="block cursor-pointer hover:bg-gray-100">
                  <div
                    class="
                      inline-flex
                      w-full
                      items-center
                      px-6
                      py-2
                      border-b border-gray-200
                    "
                    @click.prevent="sign_out"
                  >
                    Logout
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <nav
        :style="{ 'background-color': hero_background }"
        id="site-nav"
        class="
          md:hidden
          sticky
          shadow-lg
          top-0
          left-0
          right-0
          z-10
          w-full
          items-center
        "
      >
        <div
          class="flow-root py-3 border-b px-6"
          style="border-color: rgba(100, 100, 100, 0.25)"
        >
          <div class="float-left">
            <img v-if="logo" alt="logo" :src="logo" style="max-height: 30px" />
          </div>
          <button
            class="float-right bg-white rounded-md"
            v-show="sections_array.length && !$route.query.section"
            @click.prevent="showMobileNav = !showMobileNav"
          >
            <div v-if="!showMobileNav">
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="34" height="34" rx="6" fill="#F7F7FF" />
                <rect x="6" y="10" width="22" height="2" rx="1" fill="black" />
                <rect x="6" y="16" width="22" height="2" rx="1" fill="black" />
                <rect x="6" y="22" width="22" height="2" rx="1" fill="black" />
              </svg>
            </div>
            <div v-else>
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="34" height="34" rx="6" fill="#F7F7FF" />
                <g clip-path="url(#clip0_646_4208)">
                  <path
                    d="M9 9L25 25"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M25 9L9 25"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_646_4208">
                    <rect
                      width="18"
                      height="18"
                      fill="white"
                      transform="translate(8 8)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </button>
        </div>
        <div>
          <div>
            <div
              v-show="showMobileNav"
              class="
                px-6
                gap-3
                space-y-3
                sm:space-y-0
                nav-items
                py-6
                w-full
                sm:w-auto sm:flex
              "
            >
              <a
                v-for="(section, section_index) in all_sections"
                :key="section_index"
                @click.prevent="
                  () => {
                    current_section = section;
                    showMobileNav = false;
                  }
                "
                href="#"
                class="nav-item"
                style="opacity: 1"
                :class="section_selector_class(current_section, section)"
                :style="section_selector_style(current_section, section)"
              >
                {{ section }}
              </a>
              <hr
                style="border-color: rgba(100, 100, 100, 0.25)"
                v-if="!$auth.user && sign_in_method != 'No sign in'"
              />
              <a
                href="#"
                class="nav-item italic lowercase"
                style="opacity: 1"
                :class="section_selector_class(current_section, section)"
                :style="section_selector_style(current_section, section)"
                v-if="!$auth.user && sign_in_method != 'No sign in' && email"
                @click.prevent="() => {}"
              >
                {{ email }}
              </a>
              <a
                v-if="!$auth.user && sign_in_method != 'No sign in'"
                href="#"
                class="nav-item"
                style="opacity: 1"
                :class="section_selector_class(current_section, section)"
                :style="section_selector_style(current_section, section)"
                @click.prevent="sign_out"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero + search -->
      <div
        class="px-2 bg-no-repeat bg-center bg-cover"
        :style="{
            'background-image': hero_image_url,
            'background-color': hero_background
          }"
      >
        <div>
          <div
            class="
              grid
              sm:grid-cols-1
              md:grid-cols-3
              gap-4
              items-end
              px-3
              sm:px-6
              container
              mx-auto
            "
            id="board-hero"
          >
            <!-- Hero -->
            <div class="md:col-span-2 md:col-span-2">
              <div
                v-show="hero.length"
                class="text-2xl font-bold mb-6 pt-5"
                :style="{ color: isWhite(hero_background) ? 'white' : 'black' }"
              >
                <client-only>
                  <mrk2html :markdown="hero"></mrk2html>
                </client-only>
              </div>
            </div>
            <!-- Search -->
            <div class="md:col-span-1">
              <div
                v-show="!hide_search"
                class="
                  mx-auto
                  bg-white
                  focus:bg-white
                  p-0.5
                  overflow-hidden
                  w-full
                  mb-6
                  rounded-lg
                  text-xl
                  border border-gray-200
                  shadow-md
                  flex
                  items-center
                "
              >
                <svg
                  class="
                    w-6
                    h-6
                    mx-3
                    cursor-pointer
                    text-gray-600
                    stroke-current
                  "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <input
                  placeholder="Search"
                  class="
                    w-full
                    p-2
                    bg-transparent
                    text-sm
                    placeholder:font-thin placeholder:text-gray-700
                  "
                  v-model.lazy="searchTerm"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="px-5 sm:px-6 py-3 container mx-auto flex justify-end">
          <filters></filters>
        </div>
      </div>
    </div>
    <!-- Boards -->
    <div id="show-board-x" class="px-3 sm:px-6 mt-5 container mx-auto">
      <div
        v-show="!section_blocks.length"
        class="
          py-20
          sm:text-lg
          text-center
          bg-white
          rounded-lg
          shadow
          flex
          items-center
          justify-center
        "
      >
        <div v-if="!section_blocks.length" class="max-w-xs">
          <img
            draggable="false"
            class="mt-6 w-48 mx-auto"
            src="/svg/rocket_1.svg"
          />
          <p class="mt-8 text-center">You don't have any blocks yet!</p>
          <button
            @click="page = 'add'"
            class="btn btn-indigo w-full mt-3"
            v-show="can_edit"
          >
            New Block
          </button>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 2xl:grid-cols-3 gap-6 sm:gap-16 pb-16">
        <div
          v-for="block in section_blocks"
          :key="block.id"
          class="relative group overflow-x-auto"
          @mouseleave="showEditBlockId = null"
          :class="{
            'col-span-full': block.full_width || block.type === 'grid',
          }"
        >
          <!-- User have right to edit block -->
          <div
            v-if="can_edit && !embed"
            class="absolute top-3 right-2 hidden group-hover:block"
          >
            <div
              class="inline-flex items-top justify-center"
              @click-outside="showEditBlockId = null"
            >
              <button
                @click="showEditBlockId = block.id"
                class="w-auto z-10 opacity-70 shadow-inner rounded-full"
                :class="
                  isWhite(block.background_color) ? 'text-white' : 'text-black'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <div
                v-show="showEditBlockId === block.id"
                class="
                  z-10
                  absolute
                  rounded
                  border border-gray-200
                  bg-white
                  shadow-xl
                  mt-8
                  mr-28
                "
              >
                <ul
                  class="text-sm font-semibold text-gray-700"
                  @click="showEditBlockId = null"
                >
                  <li
                    class="block cursor-pointer hover:bg-gray-100"
                    @click="edit_block(block)"
                  >
                    <div
                      class="
                        inline-flex
                        w-full
                        items-center
                        px-6
                        py-2
                        border-b border-gray-200
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </div>
                  </li>
                  <li
                    class="block cursor-pointer hover:bg-gray-100"
                    @click="cloneBlock(block)"
                  >
                    <div
                      class="
                        inline-flex
                        w-full
                        items-center
                        px-6
                        py-2
                        border-b border-gray-200
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Clone
                    </div>
                  </li>
                  <li
                    class="block cursor-pointer hover:bg-gray-100"
                    @click="moveUp(block.id)"
                  >
                    <div
                      class="
                        inline-flex
                        w-full
                        items-center
                        px-6
                        py-2
                        border-b border-gray-200
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
                        />
                      </svg>
                      Move
                    </div>
                  </li>
                  <li
                    v-if="show_download_pdf_option(block)"
                    class="block cursor-pointer hover:bg-gray-100"
                    @click="download(block)"
                  >
                    <div
                      class="
                        inline-flex
                        w-full
                        items-center
                        px-6
                        py-2
                        border-b border-gray-200
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                        ></path>
                      </svg>
                      PDF
                    </div>
                  </li>
                  <li
                    v-if="block.type == 'table' && block.csv_download"
                    class="block cursor-pointer hover:bg-gray-100"
                    @click="download_csv(block)"
                  >
                    <div
                      class="
                        inline-flex
                        w-full
                        items-center
                        px-6
                        py-2
                        border-b border-gray-200
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                        ></path>
                      </svg>
                      CSV
                    </div>
                  </li>
                  <li
                    class="block cursor-pointer hover:bg-gray-100"
                    @click="deleteBlock(block.id)"
                  >
                    <div class="inline-flex w-full items-center px-6 py-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- User don't have right to edit block -->
          <div
            v-else-if="block.type == 'table' || block.type == 'chart'"
            class="absolute top-3 right-2 hidden group-hover:block"
          >
            <div
              class="inline-flex items-center justify-center"
              @click-outside="showEditBlockId = null"
            >
              <button
                @click="showEditBlockId = block.id"
                class="w-auto z-10 opacity-70 shadow-inner rounded-full"
                :class="
                  isWhite(block.background_color) ? 'text-white' : 'text-black'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <div
                v-show="showEditBlockId === block.id"
                class="
                  z-10
                  absolute
                  rounded
                  border border-gray-200
                  bg-white
                  shadow-xl
                  mt-32
                  mr-28
                "
              >
                <ul
                  class="text-sm font-semibold text-gray-700"
                  @click="showEditBlockId = null"
                >
                  <li
                    class="block cursor-pointer hover:bg-gray-100"
                    v-if="show_download_pdf_option(block)"
                    @click="download(block)"
                  >
                    <div
                      class="
                        inline-flex
                        w-full
                        items-center
                        px-6
                        py-2
                        border-b border-gray-200
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                        ></path>
                      </svg>
                      PDF
                    </div>
                  </li>
                  <li
                    v-if="block.type == 'table' && block.csv_download"
                    class="block cursor-pointer hover:bg-gray-100"
                    @click="download_csv(block)"
                  >
                    <div
                      class="
                        inline-flex
                        w-full
                        items-center
                        px-6
                        py-2
                        border-b border-gray-200
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                        ></path>
                      </svg>
                      CSV
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <!-- DOM used by html2Pdf.js for preaparing Canvas Images -->
            <div style="height: 0; overflow: hidden">
              <div style="width: 1100px">
                <PdfTable
                  v-if="block.type == 'table'"
                  :block="block"
                  :ref="'blockId' + block.id"
                >
                </PdfTable>
                <block
                  v-else-if="block.type == 'chart'"
                  :block="block"
                  :ref="'blockId' + block.id"
                ></block>
              </div>
            </div>
            <!-- Block displayed on page. -->
            <block :block="block" :ref="'visible-blockId' + block.id" ></block>
          </div>
          <!-- End -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
let html2pdf;
export default {
  async mounted() {
    html2pdf = require("html2pdf.js");
    this.email = sessionStorage.getItem("email");
    this.emailFirstLetter = this.email ? this.email[0] : "U";

    const { embed, section, block_id } = this.$route.query;

    if(block_id)
    {
      this.showHeader = false;
    }
  },
  props: {
    embed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showEditBlockId: null,
      showMobileNav: false,
      email: null,
      emailFirstLetter: "U",
      showNavbarMenu: false,
      showHeader: true
    };
  },
  computed: {
   

    hero_image_url() {
      const url = this.hero_image;
      return `url("${url}")`;
    },
    ...mapState("board", [
      "blocks",
      "search",
      "hero_background",
      "board_background",
      "logo",
      "hero_image",
      "hero",
      "can_edit",
      "hide_search",
      "active_section_text_color",
      "inactive_section_text_color",
      "active_section_background_color",
    ]),
    ...mapGetters("board", [
      "section_blocks",
      "sections_array",
      "spreadsheet_url",
    ]),

    all_sections() {
      let sections = this.sections_array;
      const hasUnCategorized =
        this.blocks.filter((block) => !sections.includes(block.section))
          .length > 0;
      if (hasUnCategorized) {
        sections = [...sections, "un-categorized"];
      }
      return sections;
    },
    searchTerm: {
      get() {
        return this.search;
      },
      set(search) {
        this.$store.commit("board/UPDATE", { search });
      },
    },
    current_section: {
      get() {
        const section = this.$store.state.board.current_section;
        const final = this.all_sections.includes(section)
          ? section
          : this.all_sections[0];
        this.$store.commit("board/UPDATE", { current_section: final }); // Update
        return final;
      },
      set(v) {
        this.$store.commit("board/UPDATE", { current_section: v });
      },
    },
    sign_in_method() {
      return this.$store.state.board.sign_in_method;
    },
    page: {
      get() {
        return this.$store.state.board.page;
      },
      set(v) {
        this.$store.commit("board/UPDATE", { page: v });
      },
    },
  },
  methods: {
    show_download_pdf_option(block){
      return (block.pdf_download  && (block.type == 'table' || block.type == 'chart'))
    },
    sign_out() {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload(true);
    },
    section_selector_class(current_section, section) {
      // Default logic
      return [
        current_section === section
          ? "bg-opacity-100"
          : `bg-opacity-0 text-gray-400`,
        this.isWhite(this.hero_background)
          ? "bg-white text-black"
          : "bg-black text-white",
      ];
    },
    section_selector_style(current_section, section) {
      return {
        color:
          current_section === section
            ? this.active_section_text_color
            : this.inactive_section_text_color,
        background:
          current_section === section
            ? this.active_section_background_color
            : "",
      };
    },
    edit_block(block) {
      this.$store.commit("board/SET_TEMPO_BLOCK", block);
      this.page = "add";
    },
    async deleteBlock(block_id) {
      this.loading_delete_block_id = block_id;
      if (confirm("Are you sure you want to delete this block?")) {
        this.$store.commit("board/UPDATE", {
          blocks: this.blocks.filter((b) => b.id !== block_id),
        });
        await this.$axios.$delete(`/api/board/block`, {
          data: { id: block_id },
        });
      }
      this.loading_delete_block_id = false;
    },
    async cloneBlock(block) {
      const rand = `${new Date().getUTCMilliseconds().toString()}${Math.round(
        Math.random() * 36 ** 12
      ).toString(36)}`;
      this.$store.commit("board/SET_TEMPO_BLOCK", { ...block, id: rand });
      this.page = "add";
    },

    async download_csv(block) {
      this.$refs[`visible-blockId${block.id}`][0]?.download_csv();
    },

    async download(block) {
      var opt = {
        margin: 15,
        filename: `${block.type}-${block.id}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: {
          unit: "pt",
          format: "a4",
          orientation: "landscape",
        },
        pagebreak: { after: "section", mode: ["avoid-all", "css", "legacy"] },
      };
      this.$nextTick(async () => {
        const body = this.$refs[`blockId${block.id}`][0].$el;
        await html2pdf().set(opt).from(body).save();
      });
    },

    async moveUp(block_id) {
      let blocks = [...this.blocks];
      const section_blocks = this.section_blocks;
      const index = section_blocks.findIndex((block) => block.id === block_id);
      const swap_with_index =
        index == 0 ? section_blocks.length - 1 : index - 1;
      const swap_with = section_blocks[swap_with_index];

      const main_index = blocks.findIndex((block) => block.id === block_id);
      const main_swap_with_index = blocks.findIndex(
        (block) => block.id === swap_with.id
      );

      const tmp = blocks[main_index];
      blocks[main_index] = blocks[main_swap_with_index];
      blocks[main_swap_with_index] = tmp;
      this.$store.commit("board/UPDATE", { blocks });
      await this.$axios.put(`/api/board`, { blocks });
    },
  },
};
</script>

<style>
</style>

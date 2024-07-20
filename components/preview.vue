<template>
  <div>
    <div class="py-6 border-b">
      <div class="text-3xl font-bold inline-flex items-center">
        Board preview
      </div>
    </div>
    <div
      class="pb-6"
      :style="{ 'background-color': board.board_background || '#FAFAFA' }"
    >
      <div :style="{ 'background-color': board.hero_background || '#161819' }">
        <div
          class="hidden md:block border-b"
          style="border-color: rgba(100, 100, 100, 0.25)"
        >
          <div
            class="container hidden md:flex justify-between mx-auto items-center"
          >
            <div class="px-5 py-3 flex w-24">
              <img :src="board.logo" class="w-full" />
            </div>
            <div
              class="px-5 py-3 col-span-8 items-center justify-center gap-3 hidden md:flex"
            >
              <div>
                <div id="select-section" style="">
                  <ul
                    class="inline-flex flex-wrap gap-2 whitespace-nowrap w-full"
                  >
                    <li
                      v-for="(section, section_index) in all_sections"
                      :key="section_index"
                      class="px-3 py-1 rounded cursor-pointer select-none"
                      :class="section_selector_class(all_sections[0], section)"
                      :style="section_selector_style(all_sections[0], section)"
                    >
                      {{ section }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <!-- Login Avatar -->
            <div class="relative px-5 py-3">
              <div v-if="board.sign_in_method != 'No sign in'">
                <div class="relative">
                  <div
                    :style="{
                      background:
                        board.active_section_background_color || '#fff',
                      color: board.active_section_text_color || '#000',
                    }"
                    class="m-1 mr-2 w-10 h-10 relative flex justify-center items-center rounded-full text-xl uppercase cursor-pointer"
                  >
                    U
                  </div>
                </div>
                <div
                  class="z-10 absolute rounded border border-gray-200 bg-white shadow-xl mt-3 right-0"
                >
                  <ul class="text-sm font-semibold text-gray-700">
                    <li class="block cursor-pointer hover:bg-gray-100">
                      <div
                        class="inline-flex w-full items-center px-6 py-2 border-b border-gray-200"
                      >
                        example@email.com
                      </div>
                    </li>
                    <li class="block cursor-pointer hover:bg-gray-100">
                      <div
                        class="inline-flex w-full items-center px-6 py-2 border-b border-gray-200"
                      >
                        Logout
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav
          id="site-nav"
          class="md:hidden sticky shadow-lg top-0 left-0 right-0 z-10 w-full items-center"
          :style="{ 'background-color': board.hero_background || '#161819' }"
        >
          <div
            class="flow-root py-3 border-b px-6"
            style="border-color: rgba(100, 100, 100, 0.25)"
          >
            <div class="float-left">
              <img alt="logo" :src="board.logo" style="max-height: 30px" />
            </div>
            <button
              class="float-right bg-white rounded-md"
              @click="showMobileNav = !showMobileNav"
            >
              <div>
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="34" height="34" rx="6" fill="#F7F7FF"></rect>
                  <rect
                    x="6"
                    y="10"
                    width="22"
                    height="2"
                    rx="1"
                    fill="black"
                  ></rect>
                  <rect
                    x="6"
                    y="16"
                    width="22"
                    height="2"
                    rx="1"
                    fill="black"
                  ></rect>
                  <rect
                    x="6"
                    y="22"
                    width="22"
                    height="2"
                    rx="1"
                    fill="black"
                  ></rect>
                </svg>
              </div>
            </button>
          </div>
          <div>
            <div>
              <div
                v-show="showMobileNav"
                class="px-6 gap-3 space-y-3 sm:space-y-0 nav-items py-6 w-full sm:w-auto sm:flex"
              >
                <a
                  v-for="(section, section_index) in all_sections"
                  :key="section_index"
                  href="#"
                  @click.prevent="() => {}"
                  class="nav-item"
                  style="opacity: 1"
                  :class="section_selector_class(all_sections[0], section)"
                  :style="section_selector_style(all_sections[0], section)"
                >
                  {{ section }}
                </a>
                <hr
                  style="border-color: rgba(100, 100, 100, 0.25)"
                  v-if="board.sign_in_method != 'No sign in'"
                />
                <a
                  @click.prevent="() => {}"
                  class="nav-item italic lowercase"
                  style="opacity: 1"
                  :style="{
                    color:
                      section_index == 0
                        ? board.active_section_text_color
                        : board.inactive_section_text_color,
                    background:
                      section_index == 0
                        ? board.active_section_background_color
                        : '',
                  }"
                  v-if="board.sign_in_method != 'No sign in'"
                >
                  example@email.com
                </a>
                <a
                  v-if="sign_in_method != 'No sign in'"
                  href="#"
                  @click.prevent="() => {}"
                  class="nav-item"
                  style="opacity: 1"
                  :style="{
                    color:
                      section_index == 0
                        ? board.active_section_text_color
                        : board.inactive_section_text_color,
                    background:
                      section_index == 0
                        ? board.active_section_background_color
                        : '',
                  }"
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
        </nav>
        <div
          :style="{
            'background-image': hero_image,
            'background-color': board.hero_background,
          }"
          class="bg-no-repeat bg-center bg-cover"
        >
          <div class="px-2">
            <div
              id="board-hero"
              class="grid sm:grid-cols-1 md:grid-cols-3 gap-4 items-end px-3 sm:px-6 container mx-auto"
            >
              <div class="md:col-span-2 md:col-span-2">
                <div
                  v-show="board?.hero?.length"
                  class="text-2xl font-bold mb-6 pt-5"
                  :style="{
                    color: isWhite(board.hero_background || '#161819') ? 'white' : 'black',
                  }"
                >
                  <client-only>
                    <mrk2html :markdown="board.hero"></mrk2html>
                  </client-only>
                </div>
              </div>
              <div class="md:col-span-1"></div>
            </div>
          </div>
          <div class="px-5 sm:px-6 py-3 container mx-auto flex justify-end">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <div
                  class="cursor-pointer flex items-center rounded overflow-hidden bg-white bg-opacity-60"
                >
                  <button class="p-1 border-r border-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      aria-hidden="true"
                      role="img"
                      width="32"
                      height="32"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 24 24"
                      class="font-light h-4 w-4 stroke-current text-red-500"
                    >
                      <path
                        stroke-width="1"
                        d="M14.73 20.83L17.58 18l-2.85-2.83l1.42-1.41L19 16.57l2.8-2.81l1.42 1.41L20.41 18l2.81 2.83l-1.42 1.41L19 19.4l-2.85 2.84l-1.42-1.41M13 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L7.29 16.7a.989.989 0 0 1-.29-.83v-5.12L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L13 10.75v9.13M5.04 5L9 10.06v5.52l2 2v-7.53L14.96 5H5.04z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </button>
                  <div>
                    <div class="bg-transparent px-2">
                      <input
                        placeholder="Enter your value here"
                        class="px-2 bg-transparent w-full"
                      />
                    </div>
                  </div>
                </div>
                <span
                  class="rounded-full bg-white shadow h-8 w-8 flex items-center justify-center"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="h-5 w-5 stroke-current text-indigo-600 bg-opacity-70"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    ></path>
                  </svg>
                </span>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="px-3 sm:px-6 mt-5 container mx-auto">
        <div class="">
          <div
            class="py-20 sm:text-lg text-center bg-white rounded-lg shadow flex items-center border justify-center"
            :style="{
              'border-color': board.block_border || '#f5f5f5f9',
              'box-shadow': `0 4px 6px -1px ${
                board.block_shadow || '#d9d9d995'
              }, 0 2px 4px -2px ${board.block_shadow || '#d9d9d995'}`,
            }"
          >
            <div class="max-w-xs">
              <img
                draggable="false"
                src="/svg/rocket_1.svg"
                class="mt-6 w-48 mx-auto"
              />
              <p class="mt-8 text-center">Your blocks appear here!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["board"],
  data() {
    return {
      showMobileNav: false,
    };
  },
  methods: {
    section_selector_class(current_section, section) {
      // Default logic
      return [
        current_section === section
          ? "bg-opacity-100"
          : `bg-opacity-0 text-gray-400`,
        this.isWhite(this.board.hero_background || "#161819")
          ? "bg-white text-black"
          : "bg-black text-white",
      ];
    },
    section_selector_style(current_section, section) {
      return {
        color:
          current_section === section
            ? this.board.active_section_text_color
            : this.board.inactive_section_text_color,
        background:
          current_section === section
            ? this.board.active_section_background_color
            : "",
      };
    },
  },
  computed: {
    hero_image() {
      const url = this.board.hero_image;
      return `url("${url}")`;
    },
    all_sections() {
      return this.board?.sections?.trim()
        ? this.board?.sections?.split(",")
        : ["unassigned"];
    },
  },
};
</script>
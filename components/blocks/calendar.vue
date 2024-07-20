<template>
  <div>
    <div class="w-full overflow-x-auto">
      <div class="h-full p-5">
        <FullCalendar :options="calendarOptions" ref="calender"></FullCalendar>
        <div v-if="expand_row" style="z-index:10000" class="h-full w-full fixed top-0 bottom-0 right-0 flex">
          <div class="w-4/12 bg-black bg-opacity-70" @click="expand_index = null">
            <div class="flex justify-end p-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 cursor-pointer" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <transition name="slide-right">
            <div class="w-8/12 bg-white p-3 overflow-y-scroll z-5 pb-6">
              <ul class="space-y-3">
                <li v-for="(val, key) in expand_row" :key="key">
                  <div v-if="key != '_id'">
                    <span class="font-semibold">{{ key }}</span>:
                    <div v-if="
                      settings_per_header[key].type == 'image' &&
                      val &&
                      val.trim() != ''
                    " class="flex">
                      <div v-for="i of val.split(',')" :key="i">
                        <img :src="i" class="w-12 h-12 object-cover m-2" />
                      </div>
                    </div>

                    <mrk2html v-else-if="settings_per_header[key].use_markdown" :markdown="val"></mrk2html>
                    <div v-else class="break-all">{{ val }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";

const calenderViewMap = {
  Month: "dayGridMonth",
  Week: "timeGridWeek",
  Day: "timeGridDay",
};

export default {
  components: {
    FullCalendar,
  },
  props: {
    block: {},
    json: {},
    columns: {
      default: [],
    },
  },

  created() {
    const vm = this;
    this.calendarOptions.events = this.json.map(function (r, i) {
      return {
        ...r,
        title: r[vm.block.event_title_column],
        start: vm.parseDateTime(r[vm.block.start_time_column]),
        end: vm.parseDateTime(r[vm.block.end_time_column]),
        id: parseInt(i),
      };
    });
  },

  watch: {
    block_date: {
      handler(val) {
        const vm = this;
        vm.$nextTick(() => {
          vm.$refs["calender"]?.getApi().gotoDate(val)
        })
      },
      immediate: true
    },
    json(val) {
      const vm = this;
      this.calendarOptions.events = val.map(function (r, i) {
        return {
          ...r,
          title: r[vm.block.event_title_column],
          start: vm.parseDateTime(r[vm.block.start_time_column]),
          end: vm.parseDateTime(r[vm.block.end_time_column]),
          id: parseInt(i),
        };
      });
    },
  },

  data() {
    return {
      expand_index: null,
      calendarOptions: {
        timeZone:"UTC",
        schedulerLicenseKey: "0282943859-fcs-1688175953",
        initialView: calenderViewMap[this.block.default_calendar_view],
        events: [],
        eventMaxStack: 3,
        dayMaxEventRows: true,
        views: {
          timeGrid: {
            dayMaxEventRows: 3,
          },
          dayGridMonth:{
            titleFormat: { year: 'numeric', month: 'long'}
          }
        },
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        eventClick: this.handleEventClick,
      },
    };
  },

  methods: {
    handleEventClick(clickInfo) {
      this.expand_index = parseInt(clickInfo.event.id);
    },
    parseDateTime(dateTime) {
      const possibleFormats = [
        'YYYY-MM-DDTHH:mm', // Your preferred format
        'YYYY-MM-DD HH:mm:ss', // Example: 2024-06-13 12:43:00
        'YYYY-MM-DD hh:mm:ss A', // Example: 2024-06-13 12:43:00 PM
        'MM/DD/YYYY HH:mm:ss', // Example: 06/13/2024 12:43:00
        'MM/DD/YYYY hh:mm:ss A', // Example: 06/13/2024 12:43:00 PM
        'YYYY-MM-DD', // Just date without time
        'MM/DD/YYYY', // Just date without time
        'DD-MM-YYYY', // Date in the format 21-06-2024
        'HH:mm', // Just time in 24-hour format without seconds
        'h:mm:ss A', // Just time with AM/PM
        'HH:mm:ss', // Just time without AM/PM
      ];

      let parsedDateTime = null;
      for (const format of possibleFormats) {
        parsedDateTime = dayjs(dateTime, format, true);
        if (parsedDateTime.isValid()) {
          break;
        }
      }

      if (!parsedDateTime.isValid()) {
        console.error('Invalid date/time format:', dateTime);
        return null; // or handle the error in another way
      }

      return parsedDateTime.format('YYYY-MM-DDTHH:mm');
    }
  },

  computed: {
    block_date() {
      if (this.block.default_calendar_month == "Selected month" && this.block.calender_month && parseInt(this.block.calender_year) > 1970) {
        return new Date(this.block.calender_year, parseInt(this.block.calender_month) - 1,1).toISOString();
      }
      return new Date();
    },

    settings_per_header() {
      return Object.fromEntries(this.block.axis.map((ax) => [ax.column, ax]));
    },
    expand_row() {
      if (this.expand_index !== null) {
        const row = this.json[this.expand_index];
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
  },
};
</script>

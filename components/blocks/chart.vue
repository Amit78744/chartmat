<template>
  <div class="p-3">
    <div v-show="chart_error" class="small-error">
      {{ chart_error }}
    </div>
    <div class="h-[400px]">
      <canvas
        v-show="!chart_error"
        ref="chart_js"
        height="400px"
        width="auto"
        class="z-0"
      ></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
import ChartDataLabels from "chartjs-plugin-datalabels";

export default {
  props: {
    block: {
      type: Object,
      required: true,
    },
    json: {
      type: Array,
      required: true,
    },
    columns: {
      default: [],
    },
  },
  data() {
    return {
      chart_error: null,
      chart: null,
    };
  },
  mounted() {
    try {
      Chart.register(...registerables, ChartDataLabels);
      this.plotChart();
    } catch (e) {
      this.chart_error = e.message;
    }
  },
  methods: {
    plotChart() {
      const block = JSON.parse(JSON.stringify(this.block));
      const json = JSON.parse(JSON.stringify(this.json));
      const x_name = block.x_axis;

      const customStepSize = this.block.CustomStepSize ? { stepSize: this.block.StepSize } : {};

      const indexAxis = block.axis[0].type == "horizontal-bar" ? "y" : "x";

      const labels = json.map((j) => j[block.x_axis]); // Labels are always in x-axis
      //   const labels = [1, 2, 3, 4, 5, 6, 7];
      const timestamp_labels = [];
      // Note : date time is set to false
      // const isDateTime = false;
      
      const chart_options = {
        data: {
          labels: [...new Set(labels)],
          datasets: block.axis.map((ax) => {
            console.log(ax)
            const y_name = ax.column;
            const { duplicateXAxis, decimal } = ax;

            // Set type of the chart
            ax.type = ["bar", "horizontal-bar"].includes(ax.type)
              ? "bar"
              : ax.type;

            let merged = this.editJson(
              duplicateXAxis,
              x_name,
              y_name,
              json,
              decimal
            );

            const tensions = { line: 0.0, radar: 0.1 };

            return {
              label: y_name,
              data: merged.map((item) => item[y_name]),
              tension: tensions[ax.type] ?? 0,
              borderRadius: 4,
              datalabels: {
                color: block.font_color,
                formatter(value, context) {
                  switch (ax.internal_labels) {
                    case "None":
                      return "";
                    case "Name":
                      return context.chart.data.labels[context.dataIndex];
                    case "Value":
                      return value;
                    case "Name and value":
                      return `${
                        context.chart.data.labels[context.dataIndex]
                      }:  ${value}`;
                    default:
                      return "";
                  }
                },
              },
              indexAxis: indexAxis,
              // ...ax,
              type: ax.type,
              backgroundColor: ax.backgroundColor,
              borderColor: ax.borderColor,
              borderWidth: ax.borderWidth,
              internalLabels: ax.internalLabels,
              column:ax.column,
            };
          }),
        },
        options: {
          cutout: "50%",
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              // left: 40
            },
          },
          plugins: {
            legend: {
              display: block.legendPosition !== "hidden",
              position: block.legendPosition,
              labels: { color: block.font_color },
            },
          },
          scales: {
            x: {
              stacked: block.stackAxis,
              ticks: { 
                color: this.block.font_color,
                ...customStepSize // Include custom step size if enabled
              },
              type: indexAxis == "y" ? "linear" : "category",
              grid: {
                display: block.grid.includes("X"),
                color: block.grid_color,
              },
              display: block.showScaleLabel.includes("X"),
              beginAtZero: block.beginAtZero.includes("X"),
            },
            y: {
              stacked: block.stackAxis,
              ticks: { 
                color: this.block.font_color,
                ...customStepSize // Include custom step size if enabled
              },
              type: indexAxis == "x" ? "linear" : "category",
              grid: {
                display: block.grid.includes("Y"),
                color: block.grid_color,
              },
              display: block.showScaleLabel.includes("Y"),
              beginAtZero: block.beginAtZero.includes("Y"),
            },
          },
        },
      };
      // chart_options.options.scales.r = chart_options.options.scales.y

      const ref = this.$refs.chart_js;
      new Chart(ref.getContext("2d"), chart_options);
    },

    editJson(edit_type, x_name, y_name, json, decimal) {
      let obj = {};
      const counts = {};
      json.forEach((item) => {
        const current = obj[item[x_name]];
        if (current) {
          obj[item[x_name]][y_name] =
            current[y_name] + this.getNumber(item[y_name], decimal);
        } else {
          obj[item[x_name]] = {
            ...item,
            [y_name]: this.getNumber(item[y_name], decimal),
          };
        }
        counts[item[x_name]] = (counts[item[x_name]] ?? 0) + 1;
      });

      const valuesArr = Object.values(obj);
      if (edit_type === "average") {
        const averages = valuesArr.map((obj) => ({
          ...obj,
          [y_name]: obj[y_name] / counts[obj[x_name]],
        }));
        return averages;
      }
      return valuesArr;
    },
    getNumber(n, decimal) {
      let y = 0;
      if (n === undefined) {
        y = 0;
      } else if (decimal === ",") {
        y = n
          .toString()
          .replace(/[^-,\d]/g, "")
          .replace(/,+/g, ".");
      } else {
        y = n.toString().replace(/[^-0-9.]+/g, "");
      }
      return parseFloat(y);
    },
  },
};
</script>
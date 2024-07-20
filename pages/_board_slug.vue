<template>
  <div>
    <Toast position="top-right" />
    <boardShow></boardShow>
  </div>
</template>

<style scoped>
.p-toast{
  opacity:1 !important;
}

</style>

<script>
import Toast from "primevue/toast";
export default {
  layout: "board",
  components: {
    Toast,
  },
};
</script>
<template>
  <div class="flex flex-col justify-center items-center max-w-2xl mx-auto">
    <h1 class="text-4xl font-bold">Payment Failed!</h1>
    <p class="text-2xl mt-2">
      Your payment could not be processed. Please try again later. If the issue
      persist, please contact support for additional help.
    </p>
    <a href="/dashboard" class="btn btn-indigo mt-2">Go to Dashboard</a>
  </div>
</template>

<script>
export default {
  name: "PaymentSuccessPage",
  layout: "main",
};
</script>

<template>
  <div class=" flex flex-col justify-center items-center max-w-2xl mx-auto">
    <h1 class="text-4xl font-bold">Payment Success!</h1>
    <p class="text-2xl mt-2">Your payment has been processed successfully. Go to New Boards page to use the purchased template for creating boards on your workspace.</p>
    <a href="/dashboard" class="btn btn-indigo mt-2">Go to Dashboard</a>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccessPage',
  layout: "main",
}
</script>

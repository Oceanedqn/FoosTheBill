<template>
  <div class="flex flex-col min-h-screen">
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <Header />
    <div class="w-full max-w-6xl mx-auto mt-2 p-6 bg-white shadow-lg rounded-lg flex-grow">
      <NuxtPage />
    </div>
  </div>
</template>


<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>

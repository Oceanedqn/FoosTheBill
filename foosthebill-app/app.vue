<template>
  <div class="flex flex-col min-h-screen">
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />

    <template v-if="isAuthenticated">
      <Header />
      <div class="w-full max-w-6xl mx-auto mt-2 p-6 bg-white shadow-lg rounded-lg flex-grow">
        <NuxtPage />
      </div>
    </template>
    <template v-else>
      <div class="w-full max-w-6xl mx-auto flex-grow">
        <NuxtPage />
      </div>
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth.store'

const authStore = useAuthStore()

// Verify if the user is authenticated
const isAuthenticated = computed(() => authStore.isLoggedIn)
</script>

<style></style>

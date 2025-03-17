<template>
  <div class="flex flex-col min-h-screen">
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />

    <template v-if="isAuthenticated">
      <Header />
      <div class="w-full max-w-6xl mx-auto mt-2 p-6 bg-white shadow-lg rounded-lg flex-grow overflow-y-auto">
        <NuxtPage />
      </div>
    </template>

    <template v-else>
      <div class="w-full max-w-6xl mx-auto flex-grow overflow-y-auto">
        <NuxtPage />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth.store'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isLoggedIn)
</script>

<template>
  <div class="flex flex-col h-screen">
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <ToastContainer />

    <ClientOnly>
      <template v-if="isAuthenticated">
        <Header />
        <div class="flex-grow w-full max-w-6xl p-6 mx-auto mt-2 overflow-y-auto bg-white rounded-lg shadow-lg">
          <NuxtPage />
        </div>
      </template>

      <template v-else>
        <div class="flex-grow w-full max-w-6xl mx-auto overflow-y-auto">
          <NuxtPage />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth.store'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isLoggedIn)
</script>

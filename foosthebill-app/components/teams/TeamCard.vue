<template>
  <div v-if="team"
    class="relative flex flex-col items-center p-6 bg-white rounded-lg shadow-lg bg-primary hover:shadow-xl">
    <div class="flex flex-col items-center w-full mb-2">
      <h3 class="mb-2 text-xl font-semibold">
        <span v-if="isMyTeam">{{ $t('your_team') }} </span>{{ team.name }}
      </h3>
      <div class="flex flex-col space-y-2">
        <!-- Joueur 1 -->
        <div class="text-sm">
          <i class="pr-2 fa-solid fa-user"></i> {{ team.participant1.name }} {{ team.participant1.firstname }}
        </div>
        <!-- Joueur 2 ou bouton rejoindre -->
        <div class="flex items-center text-sm">
          <span v-if="team.participant2">
            <i class="pr-2 fa-solid fa-user"></i>{{ team.participant2.name }} {{ team.participant2.firstname }}
          </span>
          <div v-else>
            <button v-if="!isUserHasAlreadyTeam" @click="joinTeam?.(team.id)"
              class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-primary-dark">
              {{ $t('join_team') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  team: Object,
  isMyTeam: Boolean,
  isUserHasAlreadyTeam: Boolean,
  joinTeam: Function,
});
</script>

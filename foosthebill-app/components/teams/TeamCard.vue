<template>
  <div v-if="team"
    class="relative flex flex-col items-center p-6 bg-white rounded-lg shadow-lg bg-primary hover:shadow-xl">
    <div class="relative flex flex-col items-center w-full mb-2">
      <div v-if="team.isMyTeam"
        class="absolute top-0 right-0 flex items-center px-2 py-1 text-sm font-semibold text-white rounded-full bg-primary">
        <button v-if="!isMatches" @click="handleQuitTeam?.(team.id)"><i class="cursor-pointer fa-solid fa-right-to-bracket"></i></button>
      </div>
      </div>
      <div class="flex flex-col p-6">
      <h3 class="mb-2 text-xl font-semibold">
        {{ team.name }}
      </h3>
      <div class="flex flex-col space-y-2">
        <!-- Affichage des joueurs si la liste des joueurs existe -->
        <div v-if="team.players && team.players.length > 0">
          <div v-for="(player, index) in team.players" :key="index" class="text-sm">
            <i class="pr-2 fa-solid fa-user"></i> {{ player.name }} {{ player.firstname }}
          </div>
        </div>

        <!-- Si le nombre de joueurs est inférieur à 2, afficher le bouton "Rejoindre" -->
        <div v-if="team.players && team.players.length < 2">
          <button v-if="!team.isMyTeam && !isRegister && !isMatches" @click="joinTeam?.(team.id)"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-primary-dark">
            {{ $t('join_team') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { ITeam } from './../../models/Team';


defineProps({
  team: Object as () => ITeam,
  isMyTeam: Boolean,
  joinTeam: Function,
  isRegister: Boolean,
  handleQuitTeam: Function,
  isMatches: Boolean
});



</script>

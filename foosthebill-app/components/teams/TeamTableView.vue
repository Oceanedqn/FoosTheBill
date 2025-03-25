<template>
    <div v-if="teams.length" class="w-full max-w-6xl overflow-x-auto rounded-t-2xl">
        <table class="min-w-full table-auto">
            <thead>
                <tr class="text-white bg-primary">
                    <th class="px-4 py-2 text-center">{{ $t('team_name') }}</th>
                    <th class="px-4 py-2 text-center">{{ $t('player') }} 1</th>
                    <th class="px-4 py-2 text-center">{{ $t('player') }} 2</th>
                    <th v-if="isMatches" class="px-4 py-2 text-center">{{ $t('score') }}</th>
                    <th v-if="isMatches" class="px-4 py-2 text-center">{{ $t('classement') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="team in props.teams" :key="team.id" class="border-b border-gray-300">
                    <td class="px-4 py-1 md:text-center sm:text-left whitespace-nowrap">
                        {{ team.name }}
                    </td>
                    <td class="px-4 py-1 md:text-center sm:text-left whitespace-nowrap">
                        <i class="pr-2 fa-solid fa-user"></i>
                        <!-- Affichage du premier joueur de l'équipe -->
                        {{ team.players[0]?.name }} {{ team.players[0]?.firstname }}
                    </td>
                    <td class="flex items-center justify-center px-4 py-1 whitespace-nowrap">
                        <span v-if="team.players[1]">
                            <i class="pr-1 fa-solid fa-user"></i>
                            {{ team.players[1]?.name }} {{ team.players[1]?.firstname }}
                        </span>
                        <div v-else class="flex items-center justify-center">
                            <button v-if="!isRegister && !isMatches" @click="props.handleJoinTeam(team.id)"
                                class="flex items-center justify-center px-4 py-1 text-white rounded-lg cursor-pointer bg-primary-light hover:bg-primary-dark">
                                <i class="pr-1 fa-solid fa-user-plus"></i>
                                <span class="hidden sm:inline">{{ $t('join_team') }}</span>
                                <span class="inline sm:hidden">{{ $t('join') }}</span>
                            </button>
                        </div>
                    </td>
                    <!-- Affichage du score -->
                    <td v-if="isMatches" class="px-4 py-1 text-center">
                        <!-- Affichage du score de l'équipe -->
                        {{ team.points || 0 }}
                    </td>
                    <!-- Affichage de la position -->
                    <td v-if="isMatches" class="px-4 py-1 text-center">
                        <!-- Affichage de la position de l'équipe -->
                        {{ team.position || 0 }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else>{{ $t('no_team') }}</div>
</template>

<script setup lang="ts">
import type { ITeamRanking } from '~/models/Team';

const props = defineProps({
    teams: {
        type: Array as () => ITeamRanking[],
        required: true,
    },
    handleJoinTeam: {
        type: Function,
        required: true,
    },
    isMatches: {
        type: Boolean,
        required: true,
        default: false
    },
    isRegister: {
        type: Boolean,
        required: true,
        default: false
    },
});
</script>

<template>
    <div v-if="teams.length" class="w-full max-w-6xl overflow-x-auto rounded-t-2xl">
        <table class="min-w-full table-auto">
            <thead>
                <tr class="text-white bg-primary">
                    <th class="px-4 py-2 text-center">{{ $t('team_name') }}</th>
                    <th class="px-4 py-2 text-center">{{ $t('player') }} 1</th>
                    <th class="px-4 py-2 text-center">{{ $t('player') }} 2</th>
                    <th v-if="props.isMatches" class="px-4 py-2 text-center">{{ $t('score') }}</th>
                    <th v-if="props.isMatches" class="px-4 py-2 text-center">{{ $t('classement') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="team in props.teams" :key="team.id" class="border-b border-gray-300">
                    <td class="px-4 py-1 md:text-center sm:text-left whitespace-nowrap">
                        {{ team.name }}
                    </td>
                    <td class="px-4 py-1 md:text-center sm:text-left whitespace-nowrap">
                        <i class="pr-2 fa-solid fa-user"></i>
                        {{ team.participant1?.name }} {{ team.participant1?.firstname }}
                    </td>
                    <td class="flex items-center justify-center px-4 py-1 whitespace-nowrap">
                        <span v-if="team.participant2">
                            <i class="pr-1 fa-solid fa-user"></i>
                            {{ team.participant2.name }} {{ team.participant2.firstname }}
                        </span>
                        <div v-else class="flex items-center justify-center">
                            <button v-if="!props.isUserHasAlreadyTeam" @click="props.handleJoinTeam(team.id)"
                                class="flex items-center justify-center px-4 py-1 text-white rounded-lg cursor-pointer bg-primary-light hover:bg-primary-dark">
                                <i class="pr-1 fa-solid fa-user-plus"></i>
                                <span class="hidden sm:inline">{{ $t('join_team') }}</span>
                                <span class="inline sm:hidden">{{ $t('join') }}</span>
                            </button>
                        </div>
                    </td>
                    <td v-if="props.isMatches && tournamentRankings" class="px-4 py-1 text-center">
                        <!-- Display points if the team is in the rankings -->
                        {{ getScore(team.id) }}
                    </td>
                    <td v-if="props.isMatches && tournamentRankings" class="px-4 py-1 text-center">
                        <!-- Display ranking position if the team is in the rankings -->
                        {{ getRankingPosition(team.id) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else>{{ $t('no_team') }}</div>
</template>

<script setup lang="ts">
import type { ITeam } from '~/models/Team';
import type { ITournamentRankings } from '~/models/Ranking';

const props = defineProps({
    teams: {
        type: Array as () => ITeam[],
        required: true,
    },
    isUserHasAlreadyTeam: {
        type: Boolean,
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
    tournamentRankings: {
        type: Object as () => ITournamentRankings,
        required: false
    }
});

// How to obtain the team's ranking score
function getScore(teamId: string): number | string {
    if (props.tournamentRankings) {
        const ranking = props.tournamentRankings!.rankings.find(ranking => ranking.team.id === teamId);
        return ranking ? ranking.points : '-';
    }
    return ''

}

// How to obtain the team's position in the rankings
function getRankingPosition(teamId: string): number | string {
    if (props.tournamentRankings) {
        const ranking = props.tournamentRankings!.rankings.find(ranking => ranking.team.id === teamId);
        return ranking ? ranking.position : '-';
    }
    return ''

}
</script>

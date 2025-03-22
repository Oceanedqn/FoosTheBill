<template>
    <div v-if="props.teams.length" class="grid w-full max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        <div v-for="team in teams" :key="team!.id">
            <TeamCard :team="team!" :isMyTeam="team!.isMyTeam" :isUserHasAlreadyTeam="props.isUserHasAlreadyTeam"
                :joinTeam="props.handleJoinTeam" />
        </div>
    </div>
    <div v-else>{{ $t('no_team') }}</div>
</template>

<script setup lang="ts">
import TeamCard from '~/components/teams/TeamCard.vue';
import type { ITeam } from '~/models/Team';


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
});
</script>

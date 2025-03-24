<template>
    <div v-if="tournamentDetails?.tournament" class="flex items-center gap-4">
        <button v-if="!props.tournamentDetails?.tournament.isRegister && !props.tournamentDetails?.tournament.isMatches"
            @click="props.openModalTeam"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
            {{ $t('create_team') }} <i class="pl-2 fa-solid fa-user-group"></i>
        </button>
        <button v-if="props.tournamentDetails?.tournament.isMatches"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-secondary-dark"
            @click="props.seeMatches">{{ $t('see_matches') }}<i class="pl-2 fa-solid fa-trophy"></i>
        </button>
        <button v-if="props.isAdmin && !props.tournamentDetails?.tournament.isMatches"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-secondary-dark"
            @click="props.handleCreateMatches">{{ $t('create_matches') }}<i class="pl-2 fa-solid fa-trophy"></i>
        </button>
        <button v-if="props.isAdmin && !props.tournamentDetails?.tournament.isMatches"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-secondary-dark"
            @click="props.openModalTeams">{{ $t('create_teams') }}<i class="pl-2 fa-solid fa-people-group"></i>
        </button>
    </div>
</template>

<script setup lang="ts">
import type { ITournamentDetails } from '~/models/Tournament';

const props = defineProps({
    isAdmin: Boolean,
    tournamentDetails: Object as () => ITournamentDetails,
    openModalTeam: Function as PropType<(e: MouseEvent) => void>,
    openModalTeams: Function as PropType<(e: MouseEvent) => void>,
    handleCreateMatches: Function as PropType<(e: MouseEvent) => void>,
    seeMatches: Function as PropType<(e: MouseEvent) => void>
});
</script>

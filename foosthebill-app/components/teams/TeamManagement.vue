<template>
    <div class="flex items-center gap-4">
        <button v-if="!props.isUserHasAlreadyTeam && !props.isMatches" @click="props.openModal"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
            {{ $t('create_team') }} <i class="pl-2 fa-solid fa-people-group"></i>
        </button>
        <button v-if="props.isMatches"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-secondary-dark"
            @click="props.seeMatches">{{ $t('see_matches') }}<i class="pl-2 fa-solid fa-trophy"></i>
        </button>
        <button v-if="props.isAdmin && !props.isMatches"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-secondary-dark"
            @click="props.handleCreateMatches">{{ $t('create_matches') }}<i class="pl-2 fa-solid fa-trophy"></i>
        </button>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    isUserHasAlreadyTeam: Boolean,
    isAdmin: Boolean,
    isMatches: Boolean,
    tournamentTeams: Object,
    openModal: Function as PropType<(e: MouseEvent) => void>,
    handleCreateMatches: Function as PropType<(e: MouseEvent) => void>,
    seeMatches: Function as PropType<(e: MouseEvent) => void>
});
</script>

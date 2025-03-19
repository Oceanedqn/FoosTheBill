<template>
    <div class="flex items-center gap-4">
        <button v-if="!isUserHasAlreadyTeam" @click="openModal"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
            {{ $t('create_team') }} <i class="pl-2 fa-solid fa-people-group"></i>
        </button>
        <button v-if="!isUserHasAlreadyTeam && tournamentTeams?.teams?.length > 0" @click="joinTeamAutomatically"
            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
            {{ $t('join_team_automatically') }} <i class="pl-2 fa-solid fa-user-plus"></i>
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    isUserHasAlreadyTeam: Boolean,
    tournamentTeams: Object,
    openModal: Function,
    joinTeamAutomatically: Function
});
</script>

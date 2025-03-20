<template>
    <div v-if="teams.length" class="grid w-full max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        <div v-for="team in teams" :key="team.id"
            class="relative flex flex-col items-center p-4 bg-white rounded-lg shadow-lg hover:shadow-xl"
            :class="{ 'border-2 shadow-primary border-primary-light': team.isMyTeam }">
            <div class="flex flex-col items-center w-full mb-2">
                <h3 class="mb-2 text-xl font-semibold">{{ team.name }}</h3>
                <div class="flex flex-col items-center space-y-2">
                    <div class="text-sm">
                        <i class="pr-2 fa-solid fa-user"></i> {{ team.participant1?.name }} {{
                            team.participant1?.firstname }}
                    </div>
                    <div class="flex text-sm">
                        <span v-if="team.participant2">
                            <i class="pr-2 fa-solid fa-user"></i> {{ team.participant2.name }}
                        </span>
                        <div v-else>
                            <button v-if="!isUserHasAlreadyTeam" @click="handleJoinTeam(team.id)"
                                class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary-light hover:bg-primary-dark">
                                <i class="pr-1 fa-solid fa-user-plus"></i>{{ $t('join_team') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>{{ $t('no_team') }}</div>
</template>

<script setup>
const props = defineProps({
    teams: {
        type: Array,
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

<template>
    <div v-if="tournament" class="relative flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl">
        <div class="relative flex flex-col items-center w-full p-3 text-white bg-primary"
            :class="{ 'bg-primary-dark': tournament.isRegister }">
            <div
                class="absolute flex items-center px-2 py-1 text-sm font-semibold transform -translate-y-1/2 bg-white rounded-full top-1/2 right-2 text-primary">
                {{ tournament.participant_number }} <i class="pl-1 fa-solid fa-person"></i>

            </div>
            <!-- Tournament name -->
            <h2 class="text-xl font-semibold text-center">{{ tournament.name }}</h2>
        </div>
        <div class="flex flex-col p-6 pt-2 bg-white">
            <!-- Tournament start date -->
            <p class="mb-4 text-sm text-gray-500">
                <i class="pr-1 fa-solid fa-calendar-day"></i>
                {{ formatDate(tournament.start_date) }}
            </p>

            <!-- Tournament description -->
            <p class="pb-3 text-sm text-gray-600">
                {{ tournament.description.length > 47 ? tournament.description.slice(0, 47) + '...' :
                    tournament.description }}
            </p>

            <!-- Button to join or view tournament -->
            <button @click="joinTournament(tournament.id)"
                class="w-full px-4 py-2 mt-auto text-white rounded-lg cursor-pointer bg-primary-light hover:bg-primary-dark">
                {{ tournament.isRegister ? $t('see_matches') : $t('join') }}
                <i class="ml-1 fa-solid"
                    :class="tournament.isRegister ? 'fa-calendar-days' : 'fa-hand-point-right'"></i>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps({
    tournament: {
        type: Object,
        required: false,
    },
});

const router = useRouter();

const formatDate = (startDate: string | Date): string => {
    return new Date(startDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const joinTournament = (tournamentId: string): void => {
    router.push(`/tournaments/${tournamentId}`);
};
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
    opacity: 1;
}
</style>

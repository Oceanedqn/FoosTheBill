<template>
    <div class="relative flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl">
        <div class="relative flex flex-col items-center w-full p-4 text-white bg-primary"
            :class="{ 'bg-primary-dark': tournament.isRegister }">
            <div
                class="absolute flex items-center px-3 py-1 text-sm font-semibold bg-white rounded-full top-2 right-2 text-primary">
                {{ tournament.participant_number }} <i class="pl-1 fa-solid fa-person"></i>
                <div
                    class="absolute p-2 mb-2 text-sm text-white transition-opacity duration-300 transform -translate-x-1/2 bg-black rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
                    {{ tournament.participant_number }} {{ $t('register_in_tournament') }}
                </div>
            </div>
            <!-- Tournament name -->
            <h2 class="mt-2 text-xl font-semibold text-center">{{ tournament.name }}</h2>
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
                {{ tournament.isRegister ? $t('see') : $t('join') }}
                <i class="ml-1 fa-solid"
                    :class="tournament.isRegister ? 'fa-calendar-days' : 'fa-hand-point-right'"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
    tournament: {
        type: Object,
        required: false,
    },
});

const router = useRouter();

const formatDate = (startDate) => {
    return new Date(startDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const joinTournament = (tournamentId) => {
    router.push(`/tournaments/${tournamentId}`);
};
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
    opacity: 1;
}
</style>

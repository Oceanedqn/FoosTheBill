<template>
    <div v-if="tournament" class="relative flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl">
        <div class="relative flex flex-col items-center w-full p-3 border-b-2 text-dark border-primary">
            <div
                class="absolute flex items-center px-2 py-1 text-sm font-semibold text-white transform -translate-y-1/2 rounded-full bg-primary top-1/2 right-2">
                {{ tournament.participantNumber }} <i class="pl-1 fa-solid fa-person"></i>

            </div>
            <!-- Tournament name -->
            <h2 class="text-xl font-semibold text-center">{{ tournament.name }}</h2>
        </div>
        <div class="flex flex-col p-6 pt-2 bg-white">
            <!-- Tournament start date -->
            <p class="mb-4 text-sm text-gray-500">
                <i class="pr-1 fa-solid fa-calendar-day"></i>
                {{ formatDate(tournament.startDate) }}
            </p>

            <!-- Tournament description -->
            <p class="pb-3 text-sm text-gray-600">
                {{ tournament.description.length > 47 ? tournament.description.slice(0, 47) + '...' :
                    tournament.description }}
            </p>

            <!-- Button to join or view tournament -->
            <button @click="joinTournament(tournament)"
                class="px-4 py-2 mt-auto text-white rounded-lg cursor-pointer bg-primary-light hover:bg-primary-dark">
                {{ tournament.isMatches ? $t('see_matches') : (tournament.isRegister ? $t('see_tournament') :
                    $t('join')) }}
                <i class="ml-1 fa-solid"
                    :class="tournament.isMatches ? 'fa-calendar-days' : (tournament.isRegister ? 'fa-trophy' : 'fa-hand-point-right')"></i>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { ITournament } from '~/models/Tournament';

const props = defineProps({
    tournament: {
        type: Object as () => ITournament,
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

const joinTournament = (tournament: ITournament) => {
    if (tournament.isMatches) {
        router.push(`/tournaments/${tournament.id}/matches`);
    } else {
        router.push(`/tournaments/${tournament.id}`);
    }
}
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
    opacity: 1;
}
</style>

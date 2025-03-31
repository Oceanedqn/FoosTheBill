<template>
    <div v-if="props.tournaments" class="w-full text-center calendar">
        <div class="flex items-center justify-between mb-2 header">
            <button @click="changeMonth(-1)" class="px-4 py-2 border rounded-full cursor-pointer border-primary">
                <i class="fa-solid fa-caret-left text-primary"></i>
            </button>
            <span class="text-lg font-semibold">{{ format(currentDate, 'MMMM yyyy', { locale: fr }) }}</span>
            <button @click="changeMonth(1)" class="px-4 py-2 border rounded-full cursor-pointer border-primary">
                <i class="fa-solid fa-caret-right text-primary"></i>
            </button>
        </div>

        <div class="grid w-full grid-cols-7 gap-2">
            <div v-for="day in daysOfWeek" :key="day" class="font-bold day">
                {{ day }}
            </div>
            <div v-for="day in calendarDays" :key="day.toString()"
                class="flex flex-col items-center w-full h-24 p-2 text-center text-white rounded-lg cursor-pointer bg-primary/50"
                :class="{ 'bg-secondary-light/50': day.getMonth() !== currentDate.getMonth() }"
                @click="openTournamentsModal(day)">

                <div class="w-full text-lg font-bold">{{ format(day, 'd') }}</div>
                <div class="w-full overflow-auto">
                    <div v-for="tournament in getTournamentsForDay(day)" :key="tournament.id"
                        class="p-1 mt-1 text-xs bg-white rounded-md cursor-pointer text-primary"
                        :class="{ 'text-secondary': day.getMonth() !== currentDate.getMonth() }"
                        @click.stop="openTournamentDetails(tournament)">
                        {{ tournament.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modale pour afficher la liste des tournois d'un jour -->
    <div v-if="showTournamentsModal"
        class="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black/50">
        <div class="relative p-6 text-center bg-white rounded-lg w-96">
            <span class="absolute text-xl cursor-pointer top-2 right-3 hover:text-primary"
                @click="closeTournamentsModal">&times;</span>
            <h2 class="text-lg font-semibold">{{ format(selectedDate!, 'PPP', { locale: fr }) }}</h2>

            <div v-if="selectedTournaments.length > 0">
                <ul class="mt-4 space-y-2">
                    <li v-for="tournament in selectedTournaments" :key="tournament.id"
                        class="p-2 text-white cursor-pointer bg-primary hover:bg-primary-light rounded-xl"
                        @click="openTournamentDetails(tournament)">
                        {{ tournament.name }}
                    </li>
                </ul>
            </div>
            <p v-else class="mt-4 text-gray-500">{{ $t('no_tournament_day') }}</p>
        </div>
    </div>

    <!-- Modale pour afficher les détails d'un tournoi -->
    <div v-if="showTournamentDetails"
        class="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black/50">
        <div class="relative p-6 text-center bg-white rounded-lg w-96">
            <span class="absolute text-xl cursor-pointer top-2 right-3 hover:text-primary"
                @click="closeTournamentDetails">&times;</span>
            <h2 class="text-lg font-semibold">{{ selectedTournament?.name }}</h2>
            <p class="mt-2 text-gray-600">{{ $t('date') }} : {{ format(selectedTournament?.startDate!, 'dd MMMM yyyy', {
                locale: fr
            }) }}</p>
            <p class="mt-2 text-gray-600">{{ $t('description') }} :
                {{ selectedTournament?.description }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { addMonths, startOfMonth, endOfMonth, getDay, eachDayOfInterval, format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import type { ITournament } from '~/models/Tournament';

const props = defineProps({
    tournaments: {
        type: Array as () => ITournament[],
        required: true,
    },
});

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const showTournamentsModal = ref(false);
const showTournamentDetails = ref(false);
const selectedTournaments = ref<ITournament[]>([]);
const selectedTournament = ref<ITournament | null>(null);

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const calendarDays = computed(() => {
    const start = startOfMonth(currentDate.value);
    const end = endOfMonth(currentDate.value);
    const prevMonthEnd = new Date(start.getFullYear(), start.getMonth(), 0);

    let startDay = getDay(start);
    startDay = startDay === 0 ? 6 : startDay - 1;

    const prevDays = eachDayOfInterval({
        start: new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - startDay + 1),
        end: prevMonthEnd
    });

    const currentDays = eachDayOfInterval({ start, end });

    const remainingDays = 42 - (prevDays.length + currentDays.length);
    const nextDays = eachDayOfInterval({
        start: addMonths(start, 1),
        end: new Date(start.getFullYear(), start.getMonth() + 1, remainingDays)
    });

    return [...prevDays, ...currentDays, ...nextDays];
});

const changeMonth = (offset: number) => {
    currentDate.value = addMonths(currentDate.value, offset);
};

// Ouvrir la modale avec les tournois du jour sélectionné
const openTournamentsModal = (day: Date) => {
    selectedDate.value = day;
    selectedTournaments.value = getTournamentsForDay(day);
    showTournamentsModal.value = true;
};

// Fermer la modale de la liste des tournois
const closeTournamentsModal = () => {
    showTournamentsModal.value = false;
};

// Ouvrir la modale des détails d'un tournoi
const openTournamentDetails = (tournament: ITournament) => {
    selectedTournament.value = tournament;
    showTournamentDetails.value = true;
};

// Fermer la modale des détails du tournoi
const closeTournamentDetails = () => {
    showTournamentDetails.value = false;
};

// Récupérer les tournois pour un jour donné
const getTournamentsForDay = (day: Date) => {
    return props.tournaments.filter(tournament =>
        format(new Date(tournament.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
};
</script>

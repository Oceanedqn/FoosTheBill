<template>
    <div class="flex flex-col min-h-screen">
        <TournamentTitle :title="$t('tournament')" :isAdmin="isAdmin" />

        <!-- Button to create a new tournament (only visible for admins) -->
        <div class="flex flex-col items-center justify-between w-full mb-6 sm:flex-row">
            <div class="w-full sm:w-1/3">
                <input v-model="searchQuery" type="text" :placeholder="$t('search_tournament') + '...'"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg" @input="filterTournaments" />

            </div>
            <div class="flex justify-end w-full mt-4 space-x-2 sm:w-auto sm:mt-0 ">
                <div v-if="isAdmin">
                    <button @click="openModal"
                        class="px-4 py-2 mr-10 text-white rounded-lg shadow-md cursor-pointer bg-secondary hover:bg-secondary-dark">
                        <div class="flex items-center text-center">
                            {{ $t('create') }} <i class="pl-2 fa-solid fa-futbol"></i>
                        </div>
                    </button>
                </div>
                <ViewToggleButton :isGridView="isGridView" @update:isGridView="setGridView" />
            </div>
        </div>

        <!-- Tournament Cards -->
        <div v-if="isAdmin" class="pb-16">
            <div class="flex pb-4 space-x-1">
                <h2 class="mb-2 text-2xl font-bold text-title-text">{{ $t('i_am_organizing') }}</h2>
                <i class="pt-1 fa-solid fa-certificate text-primary"></i>
            </div>

            <div v-if="isGridView">
                <div v-if="filteredOrganizingTournaments.length"
                    class="relative grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <TournamentCard v-for="tournament in filteredOrganizingTournaments" :key="tournament.id"
                        :tournament="tournament" />
                </div>
                <div v-else>
                    {{ $t('no_tournament') }}
                </div>
            </div>
            <TournamentTableView v-else :tournaments="filteredOrganizingTournaments" />

        </div>

        <!-- Tournament Cards -->
        <div class="pb-16">
            <h2 class="pb-4 mb-2 text-2xl font-bold text-title-text">{{ $t('i_am_participating') }}</h2>
            <div v-if="isGridView">
                <div v-if="filteredParticipatingTournaments.length"
                    class="relative grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <TournamentCard v-for="tournament in filteredParticipatingTournaments" :key="tournament.id"
                        :tournament="tournament" />
                </div>
                <div v-else class="w-full text-gray-500">
                    {{ $t('no_tournament') }}
                </div>

            </div>
            <TournamentTableView v-else :tournaments="filteredParticipatingTournaments" />

        </div>
        <div class="pb-16">
            <!-- Tournament Cards -->
            <h2 class="pb-4 mb-2 text-2xl font-bold text-title-text">{{ $t('tournaments_list') }}</h2>
            <div v-if="isGridView">
                <div v-if="filteredTournamentsList.length"
                    class="relative grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <TournamentCard v-for="tournament in filteredTournamentsList" :key="tournament.id"
                        :tournament="tournament" />
                </div>
                <div v-else class="w-full text-gray-500">
                    {{ $t('no_tournament') }}
                </div>

            </div>
            <TournamentTableView v-else :tournaments="filteredTournamentsList" />

        </div>


        <!-- Modal for Create Tournament -->
        <ModalCreateTournament :show="isModalOpen" :closeModal="closeModal" :fetchTournaments="fetchTournaments" />

    </div>
</template>

<script setup lang="ts">
import { Role } from '~/models/User';
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '~/stores/auth.store';
import { createTournament, getTournaments } from '~/services/tournament.service';
import TournamentTitle from '~/components/tournaments/TournamentTitle.vue';
import TournamentCard from '~/components/tournaments/TournamentCard.vue';
import ModalCreateTournament from '~/components/modals/ModalCreateTournament.vue';
import TournamentTableView from '~/components/tournaments/TournamentTableView.vue';
import type { ITournament } from '~/models/Tournament';


const authStore = useAuthStore();
const isModalOpen = ref(false);
const newTournament = ref({
    name: '',
    description: '',
    start_date: '',
});
const searchQuery = ref('');
const tournaments = ref<ITournament[]>([]);

const filteredOrganizingTournaments = ref<ITournament[]>([]);
const filteredParticipatingTournaments = ref<ITournament[]>([]);
const filteredTournamentsList = ref<ITournament[]>([]);


const isAdmin = ref(false);
const userId = ref<string | null>(null);
const isGridView = ref<boolean>(false);


onMounted(async () => {
    await authStore.initialize();
    isAdmin.value = authStore.user?.role === Role.ADMIN;
    userId.value = authStore.user?.id ?? null;
    whichView();
    await fetchTournaments();
});

const whichView = () => {
    const storedView = localStorage.getItem('viewType');
    if (storedView) {
        isGridView.value = storedView === 'grid';
    }
};

// Mettre à jour localStorage lorsque isGridView change
watch(isGridView, (newValue) => {
    localStorage.setItem('viewType', newValue ? 'grid' : 'table');
});

// Mise à jour de la vue
const setGridView = (value: boolean) => {
    isGridView.value = value;
};
// Function to fetch tournaments with token
const fetchTournaments = async () => {
    const token = authStore.accessToken;
    if (token) {
        try {
            const response = await getTournaments(token);
            tournaments.value = response;
            filterTournaments();
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        }
    }
};

// Filter tournaments where the user is the organizer
const organizingTournaments = computed(() => {
    return tournaments.value.filter(tournament => tournament.admin.id === userId.value);
});

// Filter tournaments where the user is a participant
const participatingTournaments = computed(() => {
    return tournaments.value.filter(tournament => tournament.isRegister);
});

// Filter tournaments where the user is neither a participant nor the organizer
const tournamentsList = computed(() => {
    return tournaments.value.filter(tournament => !tournament.isRegister);
});


// Watch for changes in authentication state (like token update)
watch(() => authStore.accessToken, async (newToken) => {
    if (newToken) {
        await fetchTournaments();
    }
});

// Filter tournaments based on search input
const filterTournaments = () => {
    const search = searchQuery.value.trim().toLowerCase();

    // Filtrer tout d'abord les catégories sans recherche (par défaut, tout s'affiche)
    filteredOrganizingTournaments.value = organizingTournaments.value;
    filteredParticipatingTournaments.value = participatingTournaments.value;
    filteredTournamentsList.value = tournamentsList.value;

    // Si une recherche est effectuée, appliquez le filtrage sur toutes les listes
    if (search) {
        filteredOrganizingTournaments.value = organizingTournaments.value.filter(tournament =>
            tournament.name.toLowerCase().includes(search)
        );

        filteredParticipatingTournaments.value = participatingTournaments.value.filter(tournament =>
            tournament.name.toLowerCase().includes(search)
        );

        filteredTournamentsList.value = tournamentsList.value.filter(tournament =>
            tournament.name.toLowerCase().includes(search)
        );
    }
};

// Handle creating a tournament
const handleCreateTournament = async () => {
    try {
        const tournamentData = {
            ...newTournament.value,
            start_date: new Date(newTournament.value.start_date),  // Conversion en Date
        };
        await createTournament(tournamentData);
        await fetchTournaments();
    } catch (error) {
        console.error('Creation failed', error);
        alert('invalid infos');
    } finally {
        closeModal();
    }
};

// Modal controls
const openModal = () => {
    isModalOpen.value = true;
};
const closeModal = () => {
    isModalOpen.value = false;
};
</script>
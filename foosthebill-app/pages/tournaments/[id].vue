<template>
    <div class="flex flex-col min-h-screen">
        <!-- Title -->
        <div class="flex items-center justify-center mb-8 space-x-1">
            <h1 class="text-4xl font-bold text-title-text">{{ $t('tournament') }}</h1>
            <i v-if="isAdmin" class="fa-solid fa-certificate text-primary"></i>
        </div>

        <!-- Tournament Details Section -->
        <div class="w-full p-6 mb-6 border-2 rounded-lg shadow-md border-primary shadow-primary">
            <h2 class="mb-4 text-3xl font-semibold"> {{ tournamentTeams?.tournament.name }} </h2>
            <p class="mb-2 text-gray-600"> {{ tournamentTeams?.tournament.description }} </p>
            <p class="mb-4 text-sm text-gray-500">
                <i class="pr-1 fa-solid fa-calendar-day"></i>
                {{ new Date(tournamentTeams?.tournament.start_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }) }}
            </p>

            <!-- Team Management Section -->
            <div class="flex items-center gap-4">
                <button @click="openModal"
                    class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
                    {{ $t('create_team') }}<i class="pl-2 fa-solid fa-people-group"></i>
                </button>
                <button @click="joinTeamAutomatically"
                    class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
                    {{ $t('join_team_automatically') }}<i class="pl-2 fa-solid fa-user-plus"></i>
                </button>
            </div>
        </div>

        <!-- Search Bar Section -->
        <div class="mb-8">
            <input v-model="searchQuery" type="text" :placeholder="$t('search_team')"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-md sm:w-1/2"
                @input="filterTournamentTeams" />
        </div>

        <!-- Teams List Section -->
        <div class="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div v-for="team in filteredTeams" :key="team.id"
                class="flex flex-col items-center p-4 rounded-lg shadow-lg bg-background">
                <div class="flex flex-col items-center w-full mb-2">
                    <h3 class="mb-2 text-xl font-semibold">{{ team.name }}</h3>
                    <div class="flex flex-col space-y-2">
                        <div class="text-sm">
                            <strong>{{ $t('player') }} 1:</strong> {{ team.participant1?.name || 'Non assigné' }}
                        </div>
                        <div class="text-sm">
                            <strong>{{ $t('player') }} 2:</strong> {{ team.participant2 ? team.participant2.name : 'Non'
                                + ' assigné' }}

                        </div>
                    </div>
                </div>

                <!-- Join Team Button if no player 2 -->
                <div v-if="!team.participant2" class="mt-4">
                    <button @click="joinTeam(team.id)"
                        class="px-4 py-2 text-white rounded-lg bg-primary hover:bg-primary-dark">
                        {{ $t('join_team') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal Directement sur la Page -->
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black/50">
            <div class="p-6 bg-white rounded-lg shadow-lg w-96">
                <h2 class="mb-4 text-xl font-semibold">{{ $t('create_team') }}</h2>
                <form @submit.prevent="handleCreateTeam">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('name') }}</label>
                        <input v-model="newTeam.name" type="text" :placeholder="$t('team_name')"
                            class="w-full px-4 py-2 mb-4 border rounded-lg" />
                    </div>

                    <div class="mb-4">
                        <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('participant') }}
                            2 (optionnel)</label>
                        <input v-model="newTeam.participant2" type="text" :placeholder="$t('participant')"
                            class="w-full px-4 py-2 mb-4 border rounded-lg" />
                    </div>


                    <div class="flex justify-end space-x-2">
                        <button @click="closeModal"
                            class="px-4 py-2 bg-gray-300 rounded-lg cursor-pointer hover:bg-gray-400">
                            {{ $t('cancel') }}
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
                            {{ $t('create') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getTournament, getTournamentTeams } from '~/services/tournament';
import { createTeam } from '~/services/team';
import { getUsers } from '~/services/user';
import { useAuthStore } from '~/stores/auth.store'; // Store to get user info

const router = useRouter();
const route = useRoute();

const tournamentTeams = ref(null);
const users = ref([]);

const newTeam = ref({
    name: '',
    participant2: null,
});

const filteredTeams = ref([]);
const searchQuery = ref('');
const authStore = useAuthStore();
const showModal = ref(false);
const isAdmin = ref(false);

// Fetch tournament details and teams when the component is mounted
onMounted(async () => {
    await authStore.initialize();
    isAdmin.value = authStore.user?.role === 'ADMIN';
    await fetchTournamentTeams();
    await fetchUsers();
});

const fetchTournamentTeams = async () => {
    const tournamentId = route.params.id;
    const token = authStore.accessToken;
    if (token) {
        try {
            const response = await getTournamentTeams(tournamentId, token);
            tournamentTeams.value = response.data;
            filterTournamentTeams();  // Refresh the filtered teams after fetching
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }
};

const fetchUsers = async () => {
    const token = authStore.accessToken;
    if (token) {
        try {
            const response = await getUsers(token);
            users.value = response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }
};

watch(() => authStore.accessToken, async (newToken) => {
    if (newToken) {
        await fetchTournament();
        await fetchTeams();
        await fetchUsers();
    }
});

// Filter teams based on the search query
const filterTournamentTeams = () => {
    if (searchQuery.value.trim() === '') {
        // Si la requête de recherche est vide, afficher toutes les équipes
        filteredTeams.value = [...tournamentTeams.value.teams];
    } else {
        // Filtrer les équipes par nom de l'équipe, nom, prénom des participants
        filteredTeams.value = tournamentTeams.value.teams.filter((team) => {
            const searchTerm = searchQuery.value.toLowerCase();
            return (
                // Recherche sur le nom de l'équipe
                team.name.toLowerCase().includes(searchTerm) ||
                // Recherche sur le nom et prénom du participant1
                (team.participant1?.name && team.participant1.name.toLowerCase().includes(searchTerm)) ||
                (team.participant1?.firstname && team.participant1.firstname.toLowerCase().includes(searchTerm)) ||
                // Recherche sur le nom et prénom du participant2
                (team.participant2?.name && team.participant2.name.toLowerCase().includes(searchTerm)) ||
                (team.participant2?.firstname && team.participant2.firstname.toLowerCase().includes(searchTerm))
            );
        });
    }
};

const handleCreateTeam = async () => {
    // Vérifie si le nom de l'équipe est renseigné
    if (!newTeam.value.name.trim()) {
        alert('Le nom de l\'équipe est requis');
        return;
    }

    const tournamentId = route.params.id;


    try {
        await createTeam(newTeam.value, tournamentId);
        await fetchTournamentTeams();

    } catch (error) {
        console.error('Erreur lors de la création', error);
        alert('Échec de la création');
    } finally {
        closeModal();
    }
};

const joinTeamAutomatically = async () => {
    try {
        console.log('Joining team automatically...');
    } catch (error) {
        console.error('Error joining team automatically:', error);
    }
};

const joinTeam = async (teamId) => {
    try {
        console.log(`Joining team with ID: ${teamId}`);
    } catch (error) {
        console.error('Error joining team:', error);
    }
};

const openModal = () => {
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};
</script>

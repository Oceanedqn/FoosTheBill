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

            <div v-if="myTeam" class="p-4 mb-4 bg-gray-100 border-2 rounded-lg shadow-lg">
                <h3 class="text-2xl font-semibold">Votre équipe : {{ myTeam.name }}</h3>
                <div>
                    <p><i class="fa-solid fa-user"></i> {{ myTeam.participant1.name }} {{ myTeam.participant1.firstname
                    }}</p>
                    <p v-if="myTeam.participant2"><i class="fa-solid fa-user"></i> {{ myTeam.participant2.name }} {{
                        myTeam.participant2.firstname }}</p>
                </div>
            </div>

            <!-- Team Management Section -->
            <div class="flex items-center gap-4">
                <button v-if="!isUserHasAlreadyTeam" @click="openModal"
                    class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
                    {{ $t('create_team') }}<i class="pl-2 fa-solid fa-people-group"></i>
                </button>
                <button v-if="!isUserHasAlreadyTeam && tournamentTeams?.teams?.length > 0"
                    @click="joinTeamAutomatically"
                    class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
                    {{ $t('join_team_automatically') }}<i class="pl-2 fa-solid fa-user-plus"></i>
                </button>
            </div>
        </div>

        <!-- Search Bar Section -->
        <div class="flex flex-col items-center justify-between w-full mb-8 sm:flex-row">
            <!-- Barre de recherche à gauche -->
            <div class="w-full sm:w-1/3">
                <input v-model="searchQuery" type="text" :placeholder="$t('search_team')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg" @input="filterTournamentTeams" />
            </div>

            <!-- Groupe des boutons à droite -->
            <div class="flex justify-end w-full mt-4 space-x-2 sm:w-auto sm:mt-0 ">
                <button @click="isGridView = true"
                    :class="{ 'bg-primary text-white': isGridView, 'bg-gray-200': !isGridView }"
                    class="px-4 py-2 transition rounded-lg cursor-pointer hover:bg-primary-dark hover:text-white">
                    <i class="pr-1 fa-solid fa-grip"></i>{{ $t('grid_view') }}
                </button>
                <button @click="isGridView = false"
                    :class="{ 'bg-primary text-white': !isGridView, 'bg-gray-200': isGridView }"
                    class="px-4 py-2 transition rounded-lg cursor-pointer hover:bg-primary-dark hover:text-white">
                    <i class="pr-1 fa-solid fa-table-list"></i>{{ $t('table_view') }}
                </button>
            </div>
        </div>

        <!-- Teams List Section -->
        <div class="w-full max-w-6xl mb-4">
            <!-- Teams List Section - Grid View -->
            <div v-if="isGridView" class="grid w-full max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
                <div v-for="team in filteredTeams.filter(t => t.id !== myTeam?.id)" :key="team.id"
                    class="relative flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl"
                    :class="{ 'border-2 shadow-primary border-primary-light': team.isMyTeam }">

                    <div class="flex flex-col items-center w-full mb-2">
                        <h3 class="mb-2 text-xl font-semibold">{{ team.name }}</h3>
                        <div class="flex flex-col space-y-2">
                            <div class="text-sm">
                                <i class="pr-2 fa-solid fa-user"></i> {{ team.participant1?.name }} {{
                                    team.participant1?.firstname }}
                            </div>
                            <div class="flex items-center text-sm">
                                <span v-if="team.participant2"><i class="pr-2 fa-solid fa-user"></i>{{
                                    team.participant2.name }}</span>
                                <div v-else>
                                    <button v-if="!isUserHasAlreadyTeam" @click="handleJoinTeam(team.id)"
                                        class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-primary-dark">
                                        {{ $t('join_team') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Teams List Section - Table View -->
            <div v-if="!isGridView" class="w-full max-w-6xl overflow-x-auto rounded-t-2xl">
                <table class="min-w-full table-auto">
                    <thead>
                        <tr class="text-white bg-primary">
                            <th class="px-4 py-2 text-center">{{ $t('team_name') }}</th>
                            <th class="px-4 py-2 text-center">{{ $t('player') }} 1</th>
                            <th class="px-4 py-2 text-center">{{ $t('player') }} 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="team in filteredTeams.filter(t => t.id !== myTeam?.id)" :key="team.id" class="border-b border-gray-300">
                            <!-- Empêche le retour à la ligne dans la cellule -->
                            <td class="px-4 py-1 md:text-center sm:text-left whitespace-nowrap">
                                {{ team.name }}
                            </td>
                            <td class="px-4 py-1 md:text-center sm:text-left whitespace-nowrap">
                                <i class="pr-2 fa-solid fa-user"></i>
                                {{ team.participant1?.name }} {{ team.participant1?.firstname }}
                            </td>
                            <td class="flex items-center justify-center px-4 py-1 whitespace-nowrap">
                                <span v-if="team.participant2">
                                    <i class="pr-1 fa-solid fa-user"></i>
                                    {{ team.participant2.name }} {{ team.participant1?.firstname }}
                                </span>
                                <div v-else class="flex items-center justify-center">
                                    <button v-if="!isUserHasAlreadyTeam" @click="joinTeam(team.id)"
                                        class="flex items-center justify-center px-4 py-1 text-white rounded-lg cursor-pointer bg-primary-light hover:bg-primary-dark">
                                        <i class="pr-1 fa-solid fa-user-plus"></i>
                                        <span class="hidden sm:inline">{{ $t('join_team') }}</span>
                                        <span class="inline sm:hidden">{{ $t('join') }}</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
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
import { Role } from '~/models/User';
import { useRouter, useRoute } from 'vue-router';
import { getTournamentTeams, checkIfUserInTeam } from '~/services/tournament.service';
import { createTeam, joinExistingTeam } from '~/services/team.service';
import { getUsers } from '~/services/user.service';
import { useAuthStore } from '~/stores/auth.store';

// Router and auth store
const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();

// Reactive variables
const showModal = ref(false);
const isAdmin = ref(false);
const tournamentTeams = ref(null);
const users = ref([]);
const newTeam = ref({
    name: '',
    participant2: null,
});
const filteredTeams = ref([]);
const searchQuery = ref('');
const isUserHasAlreadyTeam = ref(false);
const isGridView = ref(true);
const myTeam = ref(null);


// Fetch tournament details and teams when the component is mounted
onMounted(async () => {
    await authStore.initialize();
    isAdmin.value = authStore.user?.role === Role.ADMIN;

    await fetchTournamentTeams();
    await fetchUsers();
    await checkIfUserHasAlreadyInTeam();
});

// Fetch all teams of a tournament
const fetchTournamentTeams = async () => {
    const tournamentId = route.params.id;
    const token = authStore.accessToken;
    if (token) {
        try {
            const response = await getTournamentTeams(tournamentId, token);
            tournamentTeams.value = response.data;

            fetchMyTeam();
            filterTournamentTeams();  // Refresh the filtered teams after fetching
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }
};

const fetchMyTeam = () => {
    const myTeamFiltered = tournamentTeams.value?.teams.find(team => team.isMyTeam);
    myTeam.value = myTeamFiltered;  // Récupérer la team "isMyTeam"
}

// Fetch users
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

// Check if the user is in a team
const checkIfUserHasAlreadyInTeam = async () => {
    const tournamentId = route.params.id;
    const token = authStore.accessToken;
    isUserHasAlreadyTeam.value = (await checkIfUserInTeam(tournamentId, token)).isInTeam;
};

// Watch for changes to the access token
watch(() => authStore.accessToken, async (newToken) => {
    if (newToken) {
        await fetchTournamentTeams();
        await fetchUsers();
    }
});

// Filter teams based on the search query
const filterTournamentTeams = () => {
    if (searchQuery.value.trim() === '') {
        // If the search query is empty, show all teams
        filteredTeams.value = [...tournamentTeams.value.teams];
    } else {
        // Filter teams based on team name or player names
        filteredTeams.value = tournamentTeams.value.teams.filter((team) => {
            const searchTerm = searchQuery.value.toLowerCase();
            return (
                // Search by team name
                team.name.toLowerCase().includes(searchTerm) ||
                // Search by participant1's name and firstname
                (team.participant1?.name && team.participant1.name.toLowerCase().includes(searchTerm)) ||
                (team.participant1?.firstname && team.participant1.firstname.toLowerCase().includes(searchTerm)) ||
                // Search by participant2's name and firstname
                (team.participant2?.name && team.participant2.name.toLowerCase().includes(searchTerm)) ||
                (team.participant2?.firstname && team.participant2.firstname.toLowerCase().includes(searchTerm))
            );
        });
    }
};

// Handle creating a team
const handleCreateTeam = async () => {
    // Check if the team name is provided
    if (!newTeam.value.name.trim()) {
        alert('Le nom de l\'équipe est requis');
        return;
    }

    const tournamentId = route.params.id;
    try {
        const response = await createTeam(newTeam.value, tournamentId);
        await fetchTournamentTeams();

        if (response && response.statusCode === 201) {
            const successMessage = response.message || 'Succès';
            await checkIfUserHasAlreadyInTeam();
        } else {
            const errorMessage = response?.message || 'Erreur inconnue';
            alert(`Erreur lors de la création de l'équipe : ${errorMessage}`);
        }
    } catch (error) {
        console.error('Erreur lors de la création', error);
        alert('Échec de la création de l\'équipe. Veuillez réessayer plus tard.');
    } finally {
        closeModal();
    }
};

// Handle joining a team
const handleJoinTeam = async (teamId) => {
    try {
        const response = await joinExistingTeam(teamId);
        await fetchTournamentTeams();
        if (response && response.statusCode === 200) {
            const successMessage = response.message || 'Succès';
            await checkIfUserHasAlreadyInTeam();
        } else {
            const errorMessage = response?.message || 'Erreur inconnue';
            alert(`Erreur lors de la mise à jour de l'équipe : ${errorMessage}`);
        }
    } catch (error) {
        console.error('Error joining team:', error);
    }
};

// Open modal
const openModal = () => {
    showModal.value = true;
};

// Close modal
const closeModal = () => {
    showModal.value = false;
};
</script>

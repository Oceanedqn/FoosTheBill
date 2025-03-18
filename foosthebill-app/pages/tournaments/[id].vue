<template>
    <div class="min-h-screen flex flex-col">
        <!-- Title -->
        <div class="flex items-center justify-center space-x-1 mb-8">
            <h1 class="text-4xl font-bold text-title-text">{{ $t('tournament') }}</h1>
            <i v-if="isAdmin" class="fa-solid fa-certificate text-primary"></i>
        </div>

        <!-- Tournament Details Section -->
        <div class="w-full border-2 border-primary shadow-primary shadow-md rounded-lg p-6 mb-6">
            <h2 class="text-3xl font-semibold mb-4"> {{ tournament?.name }} </h2>
            <p class="text-gray-600 mb-2"> {{ tournament?.description }} </p>
            <p class="text-gray-500 text-sm mb-4">
                <i class="fa-solid fa-calendar-day pr-1"></i>
                {{ new Date(tournament?.start_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }) }}
            </p>

            <!-- Team Management Section -->
            <div class="flex gap-4 items-center">
                <button @click="openModal"
                    class="px-4 py-2 bg-primary cursor-pointer text-white rounded-lg hover:bg-primary-dark">
                    {{ $t('create_team') }}<i class="fa-solid fa-people-group pl-2"></i>
                </button>
                <button @click="joinTeamAutomatically"
                    class="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark">
                    {{ $t('join_team_automatically') }}<i class="fa-solid fa-user-plus pl-2"></i>
                </button>
            </div>
        </div>

        <!-- Search Bar Section -->
        <div class="mb-8">
            <input v-model="searchQuery" type="text" :placeholder="$t('search_team')"
                class="px-4 py-2 border border-gray-300 rounded-lg shadow-md w-full sm:w-1/2" @input="filterTeams" />
        </div>

        <!-- Teams List Section -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
            <div v-for="team in filteredTeams" :key="team.id"
                class=" p-4 rounded-lg shadow-lg flex flex-col items-center bg-background">
                <div class="flex flex-col items-center w-full mb-2">
                    <h3 class="text-xl font-semibold mb-2">{{ team.name }}</h3>
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
                        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                        {{ $t('join_team') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal Directement sur la Page -->
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50">
            <div class="bg-white rounded-lg p-6 w-96 shadow-lg">
                <h2 class="text-xl font-semibold mb-4">{{ $t('create_team') }}</h2>
                <form @submit.prevent="handleCreateTeam">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('name') }}</label>
                        <input v-model="newTeam.name" type="text" :placeholder="$t('team_name')"
                            class="w-full px-4 py-2 border rounded-lg mb-4" />
                    </div>

                    <div class="mb-4">
                        <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('participant') }}
                            2 (optionnel)</label>
                        <input v-model="newTeam.participant2" type="text" :placeholder="$t('participant')"
                            class="w-full px-4 py-2 border rounded-lg mb-4" />
                    </div>
                </form>

                <div class="flex justify-end space-x-2">
                    <button @click="closeModal" class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                        {{ $t('cancel') }}
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                        {{ $t('create') }}
                    </button>
                </div>
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

const tournament = ref(null);
const teams = ref([]);
const users = ref([]);

const newTeam = ref({
    name: '',
    participant2: '',
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
    await fetchTournament();
    await fetchTeams();
    await fetchUsers();
});

const fetchTournament = async () => {
    const tournamentId = route.params.id;
    const token = authStore.accessToken;
    if (token) {
        try {
            const response = await getTournament(tournamentId, token);
            tournament.value = response.data;
        } catch (error) {
            console.error('Error fetching tournament details:', error);
        }
    }
};

const fetchTeams = async () => {
    const tournamentId = route.params.id;
    const token = authStore.accessToken;
    if (token) {
        try {
            const response = await getTournamentTeams(tournamentId, token);
            teams.value = response.data;
            filterTeams();  // Refresh the filtered teams after fetching
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
const filterTeams = () => {
    if (searchQuery.value.trim() === '') {
        filteredTeams.value = [...teams.value];
    } else {
        filteredTeams.value = teams.value.filter((team) =>
            team.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }
};

const handleCreateTeam = async () => {
    const tournamentId = route.params.id;

    try {
        await createTeam(newTeam);
        await fetchTeams(tournamentId);
    } catch (error) {
        console.error('Creation failed', error);
        alert('Invalid info');
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

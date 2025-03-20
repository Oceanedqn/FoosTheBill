<template>
    <div class="flex flex-col min-h-screen">
        <TournamentTitle :title="$t('tournament')" :isAdmin="isAdmin" />
        <div class="w-full p-6 mb-6 border-2 rounded-lg shadow-md border-primary shadow-primary">
            <div class="flex flex-col gap-6 md:flex-row">
                <div class="md:w-2/3">
                    <h2 class="mb-4 text-3xl font-semibold">{{ tournamentTeams?.tournament.name }}</h2>
                    <p class="mb-2 text-gray-600">{{ tournamentTeams?.tournament.description }}</p>
                    <p class="mb-4 text-sm text-gray-500">
                        <i class="pr-1 fa-solid fa-calendar-day"></i>
                        {{ new Date(tournamentTeams?.tournament.start_date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }) }}
                    </p>
                </div>
                <div v-if="myTeam" class="md:w-1/3">
                    <TeamCard :team="myTeam" :isMyTeam="true" :isUserHasAlreadyTeam="isUserHasAlreadyTeam"
                        :joinTeam="handleJoinTeam" />
                </div>
            </div>
            <TeamManagement :isUserHasAlreadyTeam="isUserHasAlreadyTeam" :tournamentTeams="tournamentTeams"
                :openModal="openModal" :joinTeamAutomatically="joinTeamAutomatically" />
        </div>

        <div class="flex flex-col items-center justify-between w-full mb-6 sm:flex-row">
            <div class="w-full sm:w-1/3">
                <input v-model="searchQuery" type="text" :placeholder="$t('search_team')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg" @input="filterTournamentTeams" />
            </div>
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
            <TeamGridView v-if="isGridView && filteredTeams.length" :teams="filteredTeams.filter(t => t.id !== myTeam?.id)"
                :isUserHasAlreadyTeam="isUserHasAlreadyTeam" :handleJoinTeam="handleJoinTeam" />
            
            <!-- Teams List Section - Table View -->
            <TeamTableView v-if="!isGridView" :teams="filteredTeams.filter(t => t.id !== myTeam?.id)"
                :isUserHasAlreadyTeam="isUserHasAlreadyTeam" :handleJoinTeam="handleJoinTeam" />
        </div>

        <!-- Modal Directement sur la Page -->
        <ModalCreateTeam v-if="showModal" :show="showModal" :closeModal="closeModal"
            :fetchTournamentTeams="fetchTournamentTeams" :checkIfUserHasAlreadyInTeam="checkIfUserHasAlreadyInTeam" :users="users" />

    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Role } from '~/models/User';
import { useRouter, useRoute } from 'vue-router';
import { getTournamentTeams, checkIfUserInTeam, getUsersNotInTournament } from '~/services/tournament.service';
import { joinExistingTeam } from '~/services/team.service';
import { useAuthStore } from '~/stores/auth.store';
import TournamentTitle from '~/components/tournaments/TournamentTitle.vue';
import TeamCard from '~/components/teams/TeamCard.vue';
import TeamManagement from '~/components/teams/TeamManagement.vue';
import TeamGridView from '~/components/teams/TeamGridView.vue';
import TeamTableView from '~/components/teams/TeamTableView.vue';
import ModalCreateTeam from '~/components/modals/ModalCreateTeam.vue';

// Router and auth store
const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();

// Reactive variables
const showModal = ref(false);
const isAdmin = ref(false);
const tournamentTeams = ref(null);
const users = ref([]);
const filteredTeams = ref([]);
const searchQuery = ref('');
const isUserHasAlreadyTeam = ref(false);
const myTeam = ref(null);
const isGridView = ref(false);


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
            filterTournamentTeams();
            await checkIfUserHasAlreadyInTeam();
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }
};

const fetchMyTeam = () => {
    const myTeamFiltered = tournamentTeams.value?.teams.find(team => team.isMyTeam);
    myTeam.value = myTeamFiltered;  // Récupérer la team " isMyTeam" } // Fetch users const fetchUsers=async ()=> {
};

const fetchUsers = async () => {
    const tournamentId = route.params.id;
    const token = authStore.accessToken;
    if (token) {
        try {
            const response = await getUsersNotInTournament(tournamentId, token);
            users.value = response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }
}

// Check if the user is in a team
const checkIfUserHasAlreadyInTeam = async () => {
    const tournamentId = route.params.id;
    const token = authStore.accessToken;
    const response = await checkIfUserInTeam(tournamentId, token);
    isUserHasAlreadyTeam.value = response.isInTeam;
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

// Handle joining a team
const handleJoinTeam = async (teamId) => {
    try {
        await joinExistingTeam(teamId);
        await fetchTournamentTeams();
        await checkIfUserHasAlreadyInTeam();
    } catch (error) {
        console.error('Error joining team:', error);
    }
};

const joinTeamAutomatically = () => {
    // Ton code ici pour rejoindre une équipe automatiquement
    console.log('Join team automatically');
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

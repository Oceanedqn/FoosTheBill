<template>
    <div v-if="tournamentTeams" class="flex flex-col">
        <TournamentTitle :title="$t('tournament')" :isAdmin="isAdmin" />
        <div class="w-full p-6 mb-6 border-2 rounded-lg shadow-md border-primary shadow-primary">
            <div class="flex flex-col gap-6 mb-4 md:flex-row">
                <div class="md:w-2/3">
                    <h2 class="mb-4 text-3xl font-semibold">{{ tournamentTeams?.tournament.name }}</h2>
                    <p class="mb-2 text-gray-600">{{ tournamentTeams?.tournament.description }}</p>
                    <p class="mb-4 text-sm text-gray-500">
                        <i class="pr-1 fa-solid fa-calendar-day"></i>
                        {{ new Date(tournamentTeams?.tournament.start_date!).toLocaleDateString('fr-FR', {
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
                :openModalTeam="openModalTeam" :openModalTeams="openModalTeams" :isAdmin="isAdmin"
                :isMatches="tournamentTeams.tournament.isMatches" :seeMatches="seeMatchs"
                :handleCreateMatches="handleCreateMatches" />
        </div>

        <div class="flex flex-col items-center justify-between w-full mb-6 sm:flex-row">
            <div class="w-full sm:w-1/3">
                <input v-model="searchQuery" type="text" :placeholder="$t('search_team')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg" @input="filterTournamentTeams" />
            </div>
            <div class="flex justify-end w-full mt-4 space-x-2 sm:w-auto sm:mt-0 ">
                <ViewToggleButton :isGridView="isGridView" @update:isGridView="setGridView" />
            </div>
        </div>
        <!-- Teams List Section -->
        <div class="w-full max-w-6xl mb-4">
            <!-- Teams List Section - Grid View -->
            <TeamGridView v-if="isGridView && filteredTeams.length" :teams="filteredTeams"
                :isUserHasAlreadyTeam="isUserHasAlreadyTeam" :handleJoinTeam="handleJoinTeam" />
            <!-- Teams List Section - Table View -->
            <TeamTableView v-if="!isGridView" :teams="filteredTeams" :isUserHasAlreadyTeam="isUserHasAlreadyTeam"
                :handleJoinTeam="handleJoinTeam" :isMatches="tournamentTeams.tournament.isMatches"
                :tournamentRankings="tournamentRankings" />
        </div>

        <!-- Modal Directement sur la Page -->
        <ModalCreateTeam v-if="showModalTeam" :show="showModalTeam" :closeModalTeam="closeModalTeam"
            :fetchTournamentTeams="fetchTournamentTeams" :users="users" />

        <ModalCreateTeams v-if="showModalTeams" :show="showModalTeams" :closeModalTeams="closeModalTeams"
            :fetchTournamentTeams="fetchTournamentTeams" :users="users" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { IUser } from '~/models/User';
import { Role } from '~/models/User';
import { useRouter, useRoute } from 'vue-router';
import { getTournamentTeams, getUsersNotInTournament, createMatchesTournament } from '~/services/tournament.service';
import { joinExistingTeam } from '~/services/team.service';
import { useAuthStore } from '~/stores/auth.store';
import TournamentTitle from '~/components/tournaments/TournamentTitle.vue';
import TeamCard from '~/components/teams/TeamCard.vue';
import TeamManagement from '~/components/teams/TeamManagement.vue';
import TeamGridView from '~/components/teams/TeamGridView.vue';
import TeamTableView from '~/components/teams/TeamTableView.vue';
import ModalCreateTeam from '~/components/modals/ModalCreateTeam.vue';
import ModalCreateTeams from '~/components/modals/ModalCreateTeams.vue';
import type { ITournamentWithTeams } from '~/models/Tournament';
import type { ITeam } from '~/models/Team';
import ViewToggleButton from '~/components/ViewToggleButton.vue';
import { showAlertToast } from "@/utils/toast.utils";
import { getRankingsByTournamentId } from '~/services/ranking.service';
import type { ITournamentRankings } from '~/models/Ranking';

const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();
const showModalTeam = ref<boolean>(false);
const showModalTeams = ref<boolean>(false);
const isAdmin = ref<boolean>(false);
const tournamentTeams = ref<ITournamentWithTeams>();
const users = ref<IUser[]>([]);
const filteredTeams = ref<ITeam[]>([]);
const searchQuery = ref<string>('');
const isUserHasAlreadyTeam = ref<boolean>(false);
const myTeam = ref<ITeam>();
const isGridView = ref<boolean>(false);

const tournamentRankings = ref<ITournamentRankings>()


// Fetch tournament details and teams when the component is mounted
onMounted(async () => {
    await authStore.initialize();
    isAdmin.value = authStore.user?.role === Role.ADMIN;

    await fetchTournamentTeams();
    if (!tournamentTeams.value?.tournament.isMatches) {
        await fetchUsers();
    }

    await handleGetRankings();
    whichView();
});

const handleCreateMatches = async () => {
    if (tournamentTeams.value && tournamentTeams.value?.teams.length < 2) {
        showAlertToast("not_enough_teams");
        return;
    }

    const tournamentId = route.params.id as string;
    const token = authStore.accessToken;
    if (token) {
        try {
            await createMatchesTournament(tournamentId, tournamentTeams.value!.teams, token);
            await getTournamentTeams(tournamentId, token);
            tournamentTeams.value!.tournament.isMatches = true;
            await handleGetRankings()
            showSuccessToast('create_matches_ok');
        } catch (error) {
            showAlertToast('create_matches_error');
        }
    }

}

const handleGetRankings = async () => {
    const tournamentId = route.params.id as string;
    const token = authStore.accessToken;
    if (tournamentTeams.value!.tournament.isMatches == true && token) {
        try {
            tournamentRankings.value = await getRankingsByTournamentId(tournamentId);
        } catch (error) {
            console.error('Error fetching rankings:', error);
        }
    }
}

watch(isGridView, (newValue) => {
    localStorage.setItem('viewType', newValue ? 'grid' : 'table');
});


const setGridView = (value: boolean) => {
    isGridView.value = value;
};

const whichView = () => {
    const storedView = localStorage.getItem('viewType');
    if (storedView) {
        isGridView.value = storedView === 'grid';
    }
};

// Fetch all teams of a tournament
const fetchTournamentTeams = async () => {
    const tournamentId = route.params.id as string;
    const token = authStore.accessToken;
    if (token) {
        try {
            tournamentTeams.value = await getTournamentTeams(tournamentId, token);
            fetchMyTeam();
            filterTournamentTeams();
            await fetchUsers();
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }
};

const fetchMyTeam = () => {
    const myTeamFiltered = tournamentTeams.value?.teams.find(team => team.isMyTeam);
    myTeam.value = myTeamFiltered;
};

const fetchUsers = async () => {
    const tournamentId = route.params.id as string;
    const token = authStore.accessToken;
    if (token) {
        try {
            users.value = await getUsersNotInTournament(tournamentId, token);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }
}

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
        filteredTeams.value = [...tournamentTeams.value!.teams];
    } else {
        // Filter teams based on team name or player names
        filteredTeams.value = tournamentTeams.value!.teams.filter((team) => {
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
const handleJoinTeam = async (teamId: string) => {
    try {
        await joinExistingTeam(teamId);
        await fetchTournamentTeams();
        await fetchUsers();
    } catch (error) {
        console.error('Error joining team:', error);
    }
};

const seeMatchs = () => {
    const tournamentId = route.params.id;
    router.push(`/tournaments/${tournamentId}/matches`);
};

// Open modal
const openModalTeam = () => {
    showModalTeam.value = true;
};

// Close modal
const closeModalTeam = () => {
    showModalTeam.value = false;
    fetchUsers();
};

const openModalTeams = () => {
    showModalTeams.value = true;
};

// Close modal
const closeModalTeams = () => {
    showModalTeams.value = false;
    fetchUsers();
};
</script>

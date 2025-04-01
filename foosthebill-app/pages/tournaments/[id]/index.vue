<template>
    <div v-if="tournamentDetails" class="flex flex-col">
        <TournamentTitle :title="$t('tournament')" :isAdmin="isAdmin" />
        <div class="w-full p-6 mb-6 border-2 rounded-lg shadow-md border-primary shadow-primary">
            <div class="flex flex-col gap-6 mb-4 md:flex-row">
                <div class="md:w-2/3">
                    <h2 class="mb-4 text-3xl font-semibold">{{ tournamentDetails?.tournament.name }}</h2>
                    <p class="mb-2 text-gray-600">{{ tournamentDetails?.tournament.description }}</p>
                    <p class="mb-4 text-sm text-gray-500">
                        <i class="pr-1 fa-solid fa-calendar-day"></i>
                        {{ new Date(tournamentDetails?.tournament.startDate!).toLocaleString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }) }}
                    </p>
                </div>
                <div v-if="myTeam" class="md:w-1/3">
                    <TeamCard :team="myTeam" :isMyTeam="true" :handleJoinTeam="handleJoinTeam"
                        :isRegister="tournamentDetails.tournament.isRegister"
                        :isMatches="tournamentDetails.tournament.isMatches" :handleQuitTeam="handleQuitTeam"
                        :handleRemoveTeam="handleRemoveTeam" :isAdmin="isAdmin" />
                </div>
            </div>
            <TeamManagement :tournamentDetails="tournamentDetails" :openModalTeam="openModalTeam"
                :openModalTeams="openModalTeams" :isAdmin="isAdmin" :seeMatches="seeMatchs"
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
                :handleJoinTeam="handleJoinTeam" :isRegister="tournamentDetails.tournament.isRegister"
                :handleQuitTeam="handleQuitTeam" :isMatches="tournamentDetails.tournament.isMatches"
                :handleRemoveTeam="handleRemoveTeam" :isAdmin="isAdmin" />
            <!-- Teams List Section - Table View -->
            <TeamTableView v-if="!isGridView" :teams="filteredTeams" :handleJoinTeam="handleJoinTeam"
                :isMatches="tournamentDetails.tournament.isMatches" :handleRemoveTeam="handleRemoveTeam"
                :handleQuitTeam="handleQuitTeam" :isRegister="tournamentDetails.tournament.isRegister"
                :isAdmin="isAdmin" />
        </div>

        <!-- Modal Directement sur la Page -->
        <ModalCreateTeam v-if="showModalTeam" :show="showModalTeam" :closeModalTeam="closeModalTeam"
            :fetchTournamentDetails="fetchTournamentDetails" :users="tournamentDetails.users" />

        <ModalCreateTeams v-if="showModalTeams" :show="showModalTeams" :closeModalTeams="closeModalTeams"
            :fetchTournamentDetails="fetchTournamentDetails" :users="tournamentDetails.users" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Role } from '~/models/User';
import { useRouter, useRoute } from 'vue-router';
import { createMatchesTournament, getTournamentDetails } from '~/services/tournament.service';
import { joinExistingTeam, quitTeam, removeTeam } from '~/services/team.service';
import { useAuthStore } from '~/stores/auth.store';
import TournamentTitle from '~/components/tournaments/TournamentTitle.vue';
import TeamCard from '~/components/teams/TeamCard.vue';
import TeamManagement from '~/components/teams/TeamManagement.vue';
import TeamGridView from '~/components/teams/TeamGridView.vue';
import TeamTableView from '~/components/teams/TeamTableView.vue';
import ModalCreateTeam from '~/components/modals/ModalCreateTeam.vue';
import ModalCreateTeams from '~/components/modals/ModalCreateTeams.vue';
import type { ITeam, ITeamRanking, ITeamScore } from '~/models/Team';
import ViewToggleButton from '~/components/ViewToggleButton.vue';
import { showAlertToast, showSuccessToast } from "@/utils/toast.utils";
import type { ITournamentDetails } from '~/models/Tournament';

const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();
const showModalTeam = ref<boolean>(false);
const showModalTeams = ref<boolean>(false);
const isAdmin = ref<boolean>(false);
const tournamentDetails = ref<ITournamentDetails>();
const filteredTeams = ref<ITeamRanking[]>([]);
const searchQuery = ref<string>('');
const myTeam = ref<ITeam>();
const isGridView = ref<boolean>(false);


onMounted(async () => {
    await authStore.initialize();
    isAdmin.value = authStore.user?.role === Role.ADMIN;
    await fetchTournamentDetails();
    whichView();
});

const handleCreateMatches = async () => {
    if (tournamentDetails.value && tournamentDetails.value?.teams.length < 2) {
        showAlertToast("not_enough_teams");
        return;
    }

    const tournamentId = route.params.id as string;
    try {
        await createMatchesTournament(tournamentId, tournamentDetails.value!.teams);
        await fetchTournamentDetails();
        tournamentDetails.value!.tournament.isMatches = true;
        showSuccessToast('create_matches_ok');
    } catch (error) {
        showAlertToast('create_matches_error');
    }


}

const handleQuitTeam = async (teamId: string) => {
    try {
        await quitTeam(teamId);
        await fetchTournamentDetails();
        showSuccessToast('quit_team_ok');
    } catch (error) {
        showAlertToast('quit_team_error');
    }
};

const handleRemoveTeam = async (teamId: string) => {
    try {
        await removeTeam(teamId);
        await fetchTournamentDetails();
        showSuccessToast('remove_team_ok');
    } catch (error) {
        showAlertToast('remove_team_error');
    }
};

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
const fetchTournamentDetails = async () => {
    const tournamentId = route.params.id as string;
    try {
        tournamentDetails.value = await getTournamentDetails(tournamentId);
        fetchMyTeam();
        filterTournamentTeams();
    } catch (error) {
        console.error('Error fetching teams:', error);
    }

};

const fetchMyTeam = () => {
    const myTeamFiltered = tournamentDetails.value?.teams.find(team => team.isMyTeam);
    myTeam.value = myTeamFiltered;
};

// Watch for changes to the access token
watch(() => authStore.accessToken, async (newToken) => {
    if (newToken) {
        await fetchTournamentDetails();
    }
});

// Filter teams based on the search query
const filterTournamentTeams = () => {
    if (searchQuery.value.trim() === '') {
        // If the search query is empty, show all teams
        filteredTeams.value = [...tournamentDetails.value!.teams];
    } else {
        // Filter teams based on team name or player names
        filteredTeams.value = tournamentDetails.value!.teams.filter((team) => {
            const searchTerm = searchQuery.value.toLowerCase();
            return (
                // Search by team name
                team.name.toLowerCase().includes(searchTerm) ||
                // Search by any user's name and firstname in the team
                team.players.some((user) =>
                    (user.name && user.name.toLowerCase().includes(searchTerm)) ||
                    (user.firstname && user.firstname.toLowerCase().includes(searchTerm))
                )
            );
        });
    }
};

// Handle joining a team
const handleJoinTeam = async (teamId: string) => {
    try {
        await joinExistingTeam(teamId);
        await fetchTournamentDetails();
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
};

const openModalTeams = () => {
    showModalTeams.value = true;
};

// Close modal
const closeModalTeams = () => {
    showModalTeams.value = false;
};
</script>

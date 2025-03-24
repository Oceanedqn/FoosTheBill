<template>
    <div v-if="tournamentMatches" class="flex flex-col">
        <TournamentTitle :title="$t('scheduled_matches')" :isAdmin="isAdmin" />
        <div class="w-full p-6 mb-6 border-2 rounded-lg shadow-md border-primary shadow-primary">
            <div class="flex flex-col gap-6 mb-4 md:flex-row">
                <div class="md:w-2/3">
                    <h2 class="mb-4 text-3xl font-semibold">{{ tournamentMatches?.tournament.name }}</h2>
                    <p class="mb-2 text-gray-600">{{ tournamentMatches?.tournament.description }}</p>
                    <p class="text-sm text-gray-500">
                        <i class="pr-1 fa-solid fa-calendar-day"></i>
                        {{ new Date(tournamentMatches?.tournament.startDate!).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }) }}
                    </p>
                </div>
                <div v-if="tournamentMatches?.myTeam" class="md:w-1/3">
                    <TeamCard :team="tournamentMatches.myTeam" :isMyTeam="true" :joinTeam="seeTeam" />
                </div>
            </div>
            <button class="px-4 py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-secondary-dark"
                @click="seeTeam">{{ $t('see_teams') }}<i class="pl-2 fa-solid fa-people-group"></i>
            </button>
        </div>

        <!-- Table des matchs -->
        <div v-for="(roundMatch, index) in tournamentMatches.roundMatches" :key="index" class="items-center w-full">

            <div class="flex items-center justify-between p-2 my-4 text-white rounded-md bg-primary">
                <h3 class="text-2xl font-semibold ">{{ $t('round') }} {{ index + 1 }}</h3>
                <div>{{ roundMatch.matches.length }} {{ $t(roundMatch.matches.length > 1 ? 'matches' : 'match') }}</div>
            </div>

            <div class="flex justify-center w-full">
                <div class="flex flex-wrap justify-center w-full max-w-6xl gap-4">
                    <MatchCard v-for="match in roundMatch.matches" :key="match.id" class="w-full max-w-xs"
                        :match="match" :isAdmin="isAdmin" :fetchMatches="fetchMatches" :tournamentId="tournamentId" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTournamentMatches } from '~/services/tournament.service';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.store';
import MatchCard from '~/components/matches/MatchCard.vue';
import TournamentTitle from '~/components/tournaments/TournamentTitle.vue';
import { Role } from '~/models/User';
import TeamCard from '~/components/teams/TeamCard.vue';
import { useRouter } from 'vue-router';
import type { ITournamentMatches } from '~/models/Tournament';


const route = useRoute();
const authStore = useAuthStore();
const tournamentMatches = ref<ITournamentMatches>();
const isAdmin = ref<boolean>(false);
const router = useRouter();
const tournamentId = route.params.id as string;


// Fetch matches from the API
const fetchMatches = async () => {
    const token = authStore.accessToken;

    if (token) {
        try {
            const response = await getTournamentMatches(tournamentId, token);
            tournamentMatches.value = response;
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }
};

// Generate matches when the component is mounted
onMounted(async () => {
    await authStore.initialize();
    isAdmin.value = authStore.user?.role === Role.ADMIN;

    await fetchMatches();
});

const seeTeam = () => {
    const tournamentId = route.params.id;
    router.push(`/tournaments/${tournamentId}`);
}
</script>

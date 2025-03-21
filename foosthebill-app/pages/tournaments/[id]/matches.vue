<template>
    <div class="container p-4 mx-auto">

        <!-- Table des matchs -->
        <h2 class="mb-2 text-xl font-bold">Matchs Planifiés</h2>
        <div v-for="(tour, index) in scheduledMatches" :key="index">
            <h3 class="text-lg font-semibold">Tour {{ index + 1 }}</h3>
            <table class="min-w-full mb-4 border-collapse table-auto">
                <thead>
                    <tr>
                        <th class="px-4 py-2 border">Equipe 1</th>
                        <th class="px-4 py-2 border">Equipe 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(match, matchIndex) in tour.matches" :key="matchIndex">
                        <td class="px-4 py-2 border">{{ match.team1.name }}</td>
                        <td class="px-4 py-2 border">{{ match.team2.name }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMatchesTournament } from '~/services/tournament.service';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.store';

const route = useRoute();
const authStore = useAuthStore();
const matchesTournament = ref([]);
const scheduledMatches = ref([]);


// Fetch matches from the API
const fetchMatches = async () => {
    const tournamentId = route.params.id;
    const token = authStore.accessToken;

    if (token) {
        try {
            const response = await getMatchesTournament(tournamentId, token);
            matchesTournament.value = response.data;
            scheduledMatches.value = response.data;
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }
};

// Generate matches when the component is mounted
onMounted(async () => {
    await fetchMatches();
});
</script>

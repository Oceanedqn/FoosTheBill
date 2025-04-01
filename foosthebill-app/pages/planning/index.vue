<template>
    <div class="flex flex-col">
        <TournamentTitle :title="$t('planning')" :isAdmin="isAdmin" />
        <div v-if="isAdmin" class="flex justify-end mb-4">
            <div class="w-auto">
                <ButtonCreateTournament :fetchTournaments="fetchTournaments"/>
            </div>
        </div>

        <Calendar :tournaments="tournaments" :isAdmin="isAdmin" :fetchTournaments="fetchTournaments" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TournamentTitle from '~/components/tournaments/TournamentTitle.vue';
import { Role } from '../../models/User';
import { useAuthStore } from '../../stores/auth.store';
import type { ITournament } from '~/models/Tournament';
import { getTournaments } from '~/services/tournament.service';
import ButtonCreateTournament from '~/components/tournaments/ButtonCreateTournament.vue';
import Calendar from '~/components/Calendar.vue';

const tournaments = ref<ITournament[]>([]);
const isAdmin = ref(false);
const authStore = useAuthStore();

onMounted(async () => {
    await authStore.initialize();
    isAdmin.value = authStore.user?.role === Role.ADMIN;
    await fetchTournaments();
});

const fetchTournaments = async () => {
    try {
        const response = await getTournaments();
        tournaments.value = response;
    } catch (error) {
        console.error('Error fetching tournaments:', error);
    }
};
</script>
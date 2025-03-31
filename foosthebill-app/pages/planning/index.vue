<template>
    <div class="flex flex-col">
        <TournamentTitle :title="$t('planning')" :isAdmin="isAdmin" />
        <div class="flex justify-end w-full mb-4">
            <div v-if="isAdmin">
                <button @click="openModal"
                    class="px-4 py-2 text-white rounded-lg shadow-md cursor-pointer bg-secondary hover:bg-secondary-dark">
                    <div class="flex items-center text-center">
                        {{ $t('create_tournament') }} <i class="pl-2 fa-solid fa-futbol"></i>
                    </div>
                </button>
            </div>
        </div>

        <Calendar :tournaments="tournaments" />

        <ModalCreateTournament :show="isModalOpen" :closeModal="closeModal" :fetchTournaments="fetchTournaments" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TournamentTitle from '~/components/tournaments/TournamentTitle.vue';
import { Role } from '../../models/User';
import { useAuthStore } from '../../stores/auth.store';
import type { ITournament } from '~/models/Tournament';
import { getTournaments } from '~/services/tournament.service';
import ModalCreateTournament from '~/components/modals/ModalCreateTournament.vue';

const tournaments = ref<ITournament[]>([]);
const isModalOpen = ref(false);
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

const openModal = () => {
    isModalOpen.value = true;
};
const closeModal = () => {
    isModalOpen.value = false;
};
</script>
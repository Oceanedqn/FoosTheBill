<template>
    <div class="min-h-screen flex flex-col ">
        <!-- Title -->
        <div class="flex items-center justify-center space-x-1 mb-8">
            <h1 class="text-4xl font-bold text-title-text">{{ $t('tournament') }}</h1>
            <i v-if="isAdmin" class="fa-solid fa-certificate text-primary"></i>
        </div>

        <!-- Container for the search bar and create button -->
        <div class=" flex justify-between items-center w-full mb-8">
            <!-- Search Bar -->
            <div class="flex w-full items-center">
                <input v-model="searchQuery" type="text" :placeholder="$t('search_tournament')"
                    class="px-4 py-2 border border-gray-300 rounded-lg shadow-md mr-4 w-1/2 sm:w-1/3"
                    @input="filterTournaments" />

                <i class="fa-solid fa-magnifying-glass"></i>
            </div>

            <!-- Button to create a new tournament (only visible for admins) -->
            <div v-if="isAdmin">
                <button @click="openModal"
                    class="px-4 py-2 bg-secondary text-white rounded-lg cursor-pointer shadow-md hover:bg-secondary-dark">
                    <div class="flex items-center text-center">
                        {{ $t('create') }} <i class="fa-solid fa-futbol pl-2"></i>
                    </div>
                </button>
            </div>
        </div>
        <h2 class="text-2xl font-bold text-title-text mb-2">{{ $t('tournaments_list') }}</h2>
        <!-- Tournament Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            <!-- Example of a tournament card -->
            <div v-for="tournament in filteredTournaments" :key="tournament.id"
                class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl">
                <h2 class="text-xl font-semibold text-center mb-4">{{ tournament.name }}</h2>
                <p class="text-gray-600 text-sm">{{ tournament.description }}</p>
                <p class="text-gray-500 text-sm mb-4">Participants : 12</p>
                <p class="text-gray-500 text-sm mb-4">{{ $t('start_date') }}: {{ tournament.startDate }}</p>
                <button @click="joinTournament(tournament.id)"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark w-full">

                    {{ $t('join') }}
                    <i class="fa-solid fa-hand-point-right ml-1"></i>
                </button>
            </div>
        </div>



        <!-- Modal for Create Tournament -->
        <div v-if="isModalOpen"
            class="fixed inset-0 z-50 flex justify-center items-center bg-gray-800/50 bg-opacity-50">
            <div class="bg-white p-6 rounded-lg w-96">
                <h2 class="text-2xl font-bold mb-4">{{ $t('create_tournament') }}</h2>
                <form @submit.prevent="handleCreateTournament">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('name') }}</label>
                        <input v-model="newTournament.name" id="name" type="text"
                            class="w-full p-2 border border-gray-300 rounded-lg" :placeholder="$t('name')" required />
                    </div>

                    <div class="mb-4">
                        <label for="description" class="block text-sm font-semibold text-gray-700">{{ $t('description')
                        }}</label>
                        <textarea v-model="newTournament.description" id="description"
                            class="w-full p-2 border border-gray-300 rounded-lg" :placeholder="$t('description')"
                            required></textarea>
                    </div>

                    <div class="mb-4">
                        <label for="start_date" class="block text-sm font-semibold text-gray-700">{{ $t('start_date')
                        }}</label>
                        <input v-model="newTournament.start_date" id="start_date" type="datetime-local"
                            class="w-full p-2 border border-gray-300 rounded-lg" :min="getTodayDateTime()" required />
                    </div>

                    <div class="flex justify-between">
                        <button type="button" @click="closeModal"
                            class="px-4 py-2 bg-gray-500 cursor-pointer text-white rounded-lg">
                            {{ $t('cancel') }}
                        </button>
                        <button type="submit"
                            class="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark">
                            {{ $t('create') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Role } from '~/models/User';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth.store'; // Store to get user info
import { useRouter } from 'vue-router';
import { createTournament } from '~/services/tournament'

const authStore = useAuthStore();
const router = useRouter();

// Modal state
const isModalOpen = ref(false);
const newTournament = ref({
    name: '',
    description: '',
    start_date: '',
});

// Function to handle "Create New Tournament"
const openModal = () => {
    isModalOpen.value = true;
};

// Function to close the modal
const closeModal = () => {
    isModalOpen.value = false;
};

// Dummy data for tournaments (this could come from an API)
const tournaments = ref([
    { id: 1, name: 'Tournoi 1', description: 'Un tournoi incroyable', startDate: '2025-05-10' },
    { id: 2, name: 'Tournoi 2', description: 'Un tournoi épique', startDate: '2025-06-15' },
    { id: 3, name: 'Tournoi 3', description: 'Un tournoi fun', startDate: '2025-07-20' },
    { id: 4, name: 'Tournoi 3', description: 'Un tournoi fun', startDate: '2025-07-20' },
]);

// State for the search query and filtered tournaments
const searchQuery = ref('');
const filteredTournaments = ref([...tournaments.value]);

// Check if the user is admin
const isAdmin = ref(authStore.user?.role === Role.ADMIN);
const getTodayDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mois en format "MM"
    const day = String(now.getDate()).padStart(2, '0'); // Jour en format "DD"
    const hours = String(now.getHours()).padStart(2, '0'); // Heures en format "HH"
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Minutes en format "MM"

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Function to handle joining a tournament
const joinTournament = (tournamentId) => {
    console.log(`Joining tournament with id: ${tournamentId}`);
    // Logic to join the tournament, for example, navigating to a tournament details page
    router.push(`/tournaments/${tournamentId}`);
};

// Function to filter tournaments based on the search query
const filterTournaments = () => {
    if (searchQuery.value.trim() === '') {
        filteredTournaments.value = [...tournaments.value];
    } else {
        filteredTournaments.value = tournaments.value.filter(tournament =>
            tournament.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }
};

const handleCreateTournament = async () => {
    try {
        await createTournament(newTournament);
    } catch (error) {
        console.error('Creation failed', error);
        alert('invalid infos');
    } finally {
        closeModal();
    }
};
</script>

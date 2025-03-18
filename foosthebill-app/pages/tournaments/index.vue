<template>
    <div class="min-h-screen flex flex-col">
        <!-- Title -->
        <div class="flex items-center justify-center space-x-1 mb-8">
            <h1 class="text-4xl font-bold text-title-text">{{ $t('tournament') }}</h1>
            <i v-if="isAdmin" class="fa-solid fa-certificate text-primary"></i>
        </div>

        <!-- Container for the search bar and create button -->
        <div class="flex justify-between items-center w-full mb-8">
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

        <div v-if="filteredTournaments.length === 0">
            {{ $t('no_tournament') }}
        </div>

        <!-- Tournament Cards -->
        <div class="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            <div v-for="tournament in filteredTournaments" :key="tournament.id"
                class="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl">
                <div
                    class="absolute top-0 right-0 m-2 bg-background text-dark-text p-4 rounded-md flex items-center justify-center w-5 h-5 group">
                    3 <i class="fa-solid fa-person pl-1"></i>
                    <div
                        class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 text-sm text-white bg-black p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        3 inscrit(s) au tournoi
                    </div>
                </div>

                <h2 class="text-xl font-semibold text-center mb-4">{{ tournament.name }}</h2>
                <p class="text-gray-600 text-sm">{{ tournament.description }}</p>
                <p class="text-gray-500 text-sm mb-4">
                    <i class="fa-solid fa-calendar-day pr-1"></i>
                    {{ new Date(tournament.start_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) }}
                </p>
                <button @click="joinTournament(tournament.id)"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark w-full cursor-pointer">
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
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '~/stores/auth.store'; // Store to get user info
import { useRouter } from 'vue-router';
import { createTournament, getTournaments } from '~/services/tournament';

const authStore = useAuthStore();
const router = useRouter();
const isModalOpen = ref(false);
const newTournament = ref({
    name: '',
    description: '',
    start_date: '',
});
const searchQuery = ref('');
const tournaments = ref([]);
const filteredTournaments = ref([]);
const isAdmin = ref(false);

const getTodayDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

onMounted(async () => {
    await authStore.initialize();
    isAdmin.value = authStore.user?.role === Role.ADMIN;
    await fetchTournaments();
});

// Function to fetch tournaments with token
const fetchTournaments = async () => {
    const token = authStore.accessToken;
    if (token) {
        try {
            const response = await getTournaments(token);
            tournaments.value = response.data;
            filteredTournaments.value = [...tournaments.value];
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        }
    }
};

// Handle when the user tries to join a tournament
const joinTournament = (tournamentId) => {
    console.log(`Joining tournament with id: ${tournamentId}`);
    router.push(`/tournaments/${tournamentId}`);
};



// Watch for changes in authentication state (like token update)
watch(() => authStore.accessToken, async (newToken) => {
    if (newToken) {
        await fetchTournaments();
    }
});

// Filter tournaments based on search input
const filterTournaments = () => {
    if (searchQuery.value.trim() === '') {
        filteredTournaments.value = [...tournaments.value];
    } else {
        filteredTournaments.value = tournaments.value.filter(tournament =>
            tournament.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }
};

// Handle creating a tournament
const handleCreateTournament = async () => {
    try {
        await createTournament(newTournament);
        await fetchTournaments();
    } catch (error) {
        console.error('Creation failed', error);
        alert('invalid infos');
    } finally {
        closeModal();
    }
};

// Modal controls
const openModal = () => {
    isModalOpen.value = true;
};
const closeModal = () => {
    isModalOpen.value = false;
};
</script>
<template>
    <div class="flex flex-col min-h-screen">
        <!-- Title -->
        <div class="flex items-center justify-center mb-8 space-x-1">
            <h1 class="text-4xl font-bold text-title-text">{{ $t('tournament') }}</h1>
            <i v-if="isAdmin" class="fa-solid fa-certificate text-primary"></i>
        </div>

        <!-- Container for the search bar and create button -->
        <div class="flex items-center justify-between w-full mb-8">
            <!-- Search Bar -->
            <div class="flex items-center w-full">
                <input v-model="searchQuery" type="text" :placeholder="$t('search_tournament')"
                    class="w-1/2 px-4 py-2 mr-4 border border-gray-300 rounded-lg shadow-md sm:w-1/3"
                    @input="filterTournaments" />

                <i class="fa-solid fa-magnifying-glass"></i>
            </div>

            <!-- Button to create a new tournament (only visible for admins) -->
            <div v-if="isAdmin">
                <button @click="openModal"
                    class="px-4 py-2 text-white rounded-lg shadow-md cursor-pointer bg-secondary hover:bg-secondary-dark">
                    <div class="flex items-center text-center">
                        {{ $t('create') }} <i class="pl-2 fa-solid fa-futbol"></i>
                    </div>
                </button>
            </div>
        </div>

        <h2 class="mb-2 text-2xl font-bold text-title-text">{{ $t('tournaments_list') }}</h2>

        <div v-if="filteredTournaments.length === 0">
            {{ $t('no_tournament') }}
        </div>

        <!-- Tournament Cards -->
        <div class="relative grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div v-for="tournament in filteredTournaments" :key="tournament.id"
                class="relative p-6 bg-white rounded-lg shadow-lg hover:shadow-xl" :class="{ 'border-2 shadow-secondary border-secondary-light': tournament.isRegister }">
                <div
                    class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 p-4 m-2 rounded-md bg-background text-dark-text group">
                    {{ tournament.participant_number }} <i class="pl-1 fa-solid fa-person"></i>
                    <div
                        class="absolute p-2 mb-2 text-sm text-white transition-opacity duration-300 transform -translate-x-1/2 bg-black rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
                        {{ tournament.participant_number }} inscrit(s) au tournoi
                    </div>
                </div>

                <h2 class="mb-4 text-xl font-semibold text-center">{{ tournament.name }}</h2>
                <p class="text-sm text-gray-600">{{ tournament.description }}</p>
                <p class="mb-4 text-sm text-gray-500">
                    <i class="pr-1 fa-solid fa-calendar-day"></i>
                    {{ new Date(tournament.start_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) }}
                </p>
                <button @click="joinTournament(tournament.id)"
                    class="w-full px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
                    {{ tournament.isRegister ? $t('see') : $t('join') }}
                    <i class="ml-1 fa-solid" :class="tournament.isRegister ? 'fa-calendar-days' : 'fa-hand-point-right'"></i>
                </button>
            </div>
        </div>


        <!-- Modal for Create Tournament -->
        <div v-if="isModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 bg-gray-800/50">
            <div class="p-6 bg-white rounded-lg w-96">
                <h2 class="mb-4 text-2xl font-bold">{{ $t('create_tournament') }}</h2>
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
                            class="px-4 py-2 text-white bg-gray-500 rounded-lg cursor-pointer">
                            {{ $t('cancel') }}
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
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
import { createTournament, getTournaments } from '~/services/tournament.service';

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
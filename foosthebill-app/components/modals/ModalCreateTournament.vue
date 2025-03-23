<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black/50">
        <div class="p-6 bg-white rounded-lg shadow-lg w-96">
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
</template>

<script setup>
import { ref } from 'vue';
import { createTournament } from '~/services/tournament.service'; // Service pour créer un tournoi

const props = defineProps({
    show: Boolean,  // Si le modal doit être affiché
    closeModal: Function,  // Fonction pour fermer le modal
    fetchTournaments: Function  // Fonction pour récupérer les tournois après la création
});

const newTournament = ref({
    name: '',
    description: '',
    start_date: ''
});

const getTodayDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Handle creating a tournament
const handleCreateTournament = async () => {
    try {
        await createTournament(newTournament.value);
        showSuccessToast('create_tournament_ok');
        await props.fetchTournaments();
    } catch (error) {
        showAlertToast('create_tournament_error');
    } finally {
        props.closeModal();
    }
};
</script>

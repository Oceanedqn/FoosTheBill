<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black/50">
        <div class="p-6 bg-white rounded-lg shadow-lg w-96">
            <h2 class="mb-4 text-2xl font-bold">{{ $t('create_tournament') }}</h2>
            <form @submit.prevent="handleCreateTournament">
                <div class="mb-4">
                    <label for="config" class="block text-sm font-semibold text-gray-700">{{ $t('tournament_type') }}</label>
                    <select v-model="newTournament.config" id="config"
                        class="w-full p-2 border border-gray-300 rounded-lg cursor-pointer">
                        <option v-for="type in TournamentConfig" :key="type" :value="type">
                            {{ $t(type) }}
                        </option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('name') }}</label>
                    <input v-model="newTournament.name" id="name" type="text"
                        class="w-full p-2 border border-gray-300 rounded-lg" :placeholder="$t('name')" required />
                </div>

                <div class="mb-2">
                    <label for="description" class="block text-sm font-semibold text-gray-700">{{ $t('description')
                        }}</label>
                    <textarea v-model="newTournament.description" id="description"
                        class="w-full p-2 border border-gray-300 rounded-lg" :placeholder="$t('description')"
                        required></textarea>
                </div>

                <div class="mb-4">
                    <label for="startDate" class="block text-sm font-semibold text-gray-700">{{ $t('start_date')
                        }}</label>
                    <input v-model="newTournament.startDate" id="start_date" type="datetime-local"
                        class="w-full p-2 border border-gray-300 rounded-lg" :min="formatDateTime(new Date())" required />
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

<script setup lang="ts">
import { ref } from 'vue';
import { TournamentConfig, type ICreateTournament } from '~/models/Tournament';
import { createTournament } from '~/services/tournament.service'; // Service pour créer un tournoi

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    }, 
    closeModal: {
        type: Function as PropType<() => void>,
        required: true
    },
    fetchTournaments: {
        type: Function as PropType<() => void>,
        required: true
    },
    selectedDate: {
        type: Date || null,
        required: false
    } 
});

const formatDateTime = (date: Date): string => {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const newTournament = ref<ICreateTournament>({
    name: '',
    description: '',
    startDate: formatDateTime(props.selectedDate || new Date()),
    config: TournamentConfig.BABYFOOT
});

watch(() => props.selectedDate, (newDate) => {
    if (newDate) {
        newTournament.value.startDate = formatDateTime(newDate);
    }
});

// Handle creating a tournament
const handleCreateTournament = async () => {
    try {
        await createTournament(newTournament.value);
        newTournament.value = {
            name: '',
            description: '',
            startDate: formatDateTime(props.selectedDate || new Date()),
            config: TournamentConfig.BABYFOOT
        };
        showSuccessToast('create_tournament_ok');
        await props.fetchTournaments();
    } catch (error) {
        showAlertToast('create_tournament_error');
    } finally {
        props.closeModal();
    }
};
</script>

<!-- Modal.vue -->
<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black/50">
        <div class="p-6 bg-white rounded-lg shadow-lg w-96">
            <h2 class="mb-4 text-xl font-semibold">{{ $t('create_team') }}</h2>
            <form @submit.prevent="handleCreateTeam">
                <div class="mb-4">
                    <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('name') }}</label>
                    <input v-model="newTeam.name" type="text" :placeholder="$t('team_name')"
                        class="w-full px-4 py-2 mb-4 border rounded-lg" />
                </div>

                <div class="mb-4">
                    <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('participant') }} 2
                        (optionnel)</label>
                    <input v-model="newTeam.participant2" type="text" :placeholder="$t('participant')"
                        class="w-full px-4 py-2 mb-4 border rounded-lg" />
                </div>

                <div class="flex justify-end space-x-2">
                    <button @click="closeModal"
                        class="px-4 py-2 bg-gray-300 rounded-lg cursor-pointer hover:bg-gray-400">
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
import { useRoute } from 'vue-router';
import { createTeam } from '~/services/team.service';

const props = defineProps({
    show: Boolean,
    closeModal: Function,
    fetchTournamentTeams: Function,
    checkIfUserHasAlreadyInTeam: Function
});

const newTeam = ref({
    name: '',
    participant2: null,
});

const route = useRoute();

// Handle creating a team
const handleCreateTeam = async () => {
    if (!newTeam.value.name.trim()) {
        alert('Le nom de l\'équipe est requis');
        return;
    }

    const tournamentId = route.params.id;
    try {
        await createTeam(newTeam.value, tournamentId);
        await props.fetchTournamentTeams();
    } catch (error) {
        console.error('Erreur lors de la création', error);
        alert('Échec de la création de l\'équipe. Veuillez réessayer plus tard.');
    } finally {
        props.closeModal();
    }
};
</script>

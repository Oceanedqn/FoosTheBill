<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black/50">
        <div class="p-6 bg-white rounded-lg shadow-lg w-96">
            <h2 class="mb-4 text-xl font-semibold">{{ $t('create_team') }}</h2>
            <form @submit.prevent="handleCreateTeam">

                <div class="relative mb-4">

                    <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('name') }}</label>
                    <input v-model="newTeam.name" type="text" :placeholder="$t('team_name')"
                        class="w-full px-4 py-2 mb-2 border rounded-lg" />

                    <label for="participant2" class="block text-sm font-semibold text-gray-700">{{ $t('participant') }}
                        2 ({{ $t('optional') }})</label>
                    <input v-model="query" type="text" placeholder="Rechercher un utilisateur..."
                        class="w-full px-4 py-2 mb-4 border rounded-lg" @input="filterUsers" />

                    <div v-if="filteredUsers.length > 0"
                        class="absolute w-full mt-1 bg-white border rounded-lg shadow-lg">
                        <ul>
                            <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)"
                                class="px-4 py-2 cursor-pointer hover:bg-gray-200">
                                {{ user.name }} {{ user.firstname }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="flex justify-end space-x-2">
                    <button @click="closeModalTeam"
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

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { createTeam } from '~/services/team.service';
import { type IUser } from '~/models/User';
import { type CreateTeam } from '~/models/Team';


const props = defineProps({
    show: Boolean,
    closeModalTeam: { type: Function as PropType<() => void>, required: false },
    fetchTournamentTeams: { type: Function as PropType<() => void>, required: false },
    checkIfUserHasAlreadyInTeam: Function,
    users: Array as () => IUser[],
});

const route = useRoute();
const newTeam = ref<CreateTeam>({
    name: '',
    participant2: null,
});

const query = ref('');
const filteredUsers = ref<IUser[]>([]);

// Filter users by input
const filterUsers = () => {
    if (query.value.trim() === '') {
        filteredUsers.value = [];
        return;
    }

    // Check if 'props.users' is defined and is an array
    if (Array.isArray(props.users)) {
        filteredUsers.value = props.users.filter(user => {
            const fullName = `${user.name} ${user.firstname}`.toLowerCase();
            return fullName.includes(query.value.toLowerCase());
        });
    } else {
        console.warn("La prop 'users' n'est pas définie ou n'est pas un tableau.");
    }
};

// Select a user from the filtered list
const selectUser = (user: IUser) => {
    newTeam.value.participant2 = user.id;
    query.value = `${user.name} ${user.firstname}`;
    filteredUsers.value = [];
};

const handleCreateTeam = async () => {
    if (!newTeam.value.name.trim()) {
        alert('Le nom de l\'équipe est requis');
        return;
    }
    const tournamentId = route.params.id as string;
    try {
        await createTeam(newTeam.value, tournamentId);
        if (props.fetchTournamentTeams) {
            await props.fetchTournamentTeams();
        }
    } catch (error) {
        console.error('Erreur lors de la création', error);
        alert('Échec de la création de l\'équipe. Veuillez réessayer plus tard.');
    } finally {
        if (props.closeModalTeam) {
            props.closeModalTeam();
        }
    }
};
</script>
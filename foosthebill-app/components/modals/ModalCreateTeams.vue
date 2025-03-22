<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black/50">
        <div class="p-6 bg-white rounded-lg shadow-lg w-96">
            <h2 class="mb-2 text-xl font-semibold">{{ $t('create_team') }}</h2>
            <div>
                <div class="relative mb-4">
                    <label for="name" class="block text-sm font-semibold text-gray-700">{{ $t('name') }}</label>
                    <input v-model="newTeam.name" type="text" :placeholder="$t('team_name')"
                        class="w-full px-4 py-2 mb-2 border rounded-lg" />

                    <!-- Participant 1 -->
                    <label for="participant1" class="block text-sm font-semibold text-gray-700">{{ $t('participant') }}
                        1</label>
                    <input v-model="query1" type="text" placeholder="Rechercher un utilisateur..."
                        class="w-full px-4 py-2 mb-2 border rounded-lg" @input="filterUsers('participant1')" />

                    <div v-if="activeParticipant === 'participant1' && filteredUsers.length > 0"
                        class="absolute w-full mt-1 bg-white border rounded-lg shadow-lg">
                        <ul>
                            <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user, 'participant1')"
                                class="px-4 py-2 cursor-pointer hover:bg-gray-200">
                                {{ user.name }} {{ user.firstname }}
                            </li>
                        </ul>
                    </div>

                    <!-- Participant 2 -->
                    <label for="participant2" class="block text-sm font-semibold text-gray-700">{{ $t('participant') }}
                        2 ({{ $t('optional') }})</label>
                    <input v-model="query2" type="text" placeholder="Rechercher un utilisateur..."
                        class="w-full px-4 py-2 mb-2 border rounded-lg" @input="filterUsers('participant2')" />

                    <div v-if="activeParticipant === 'participant2' && filteredUsers.length > 0"
                        class="absolute w-full mt-1 bg-white border rounded-lg shadow-lg">
                        <ul>
                            <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user, 'participant2')"
                                class="px-4 py-2 cursor-pointer hover:bg-gray-200">
                                {{ user.name }} {{ user.firstname }}
                            </li>
                        </ul>
                    </div>

                    <button type="button" @click="handleAddTeam"
                        class="w-full px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
                        {{ $t('add') }}
                    </button>
                </div>

                <div class="my-4">
                    <h3 class="font-semibold text-md">{{ $t('Liste des équipes créées') }}</h3>
                    <!-- Barre de recherche pour filtrer les équipes -->
                    <div class="mb-4">
                        <input v-model="searchQuery" type="text" placeholder="Rechercher une équipe..."
                            class="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div class="overflow-auto max-h-40">
                        <table class="min-w-full table-auto">
                            <tbody>
                                <tr v-for="team in filteredTeams" :key="team.name" class="h-12 odd:bg-gray-200">
                                    <td class="px-1">{{ team.name }}</td>
                                    <td class="px-4">{{ team.participant1!.name }} {{ team.participant1!.firstname }}
                                    </td>
                                    <td class="px-4">
                                        <span v-if="team.participant2">
                                            {{ team.participant2.name }} {{ team.participant2.firstname }}
                                        </span>
                                    </td>
                                    <td class="px-4">
                                        <button @click="handleDeleteTeam(team)">
                                            <i class="cursor-pointer fa-solid fa-xmark"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="flex justify-end space-x-2">
                    <button @click="closeModalTeams"
                        class="px-4 py-2 bg-gray-300 rounded-lg cursor-pointer hover:bg-gray-400">
                        {{ $t('cancel') }}
                    </button>
                    <button type="button" @click="handleCreateTeam"
                        class="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">
                        {{ $t('create') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { type IUser } from '~/models/User';
import { type CreateTeams, type CreateTeamsService } from '~/models/Team';
import { createTeams } from '~/services/team.service';

const props = defineProps({
    show: Boolean,
    closeModalTeams: { type: Function as PropType<() => void>, required: false },
    fetchTournamentTeams: { type: Function as PropType<() => void>, required: false },
    checkIfUserHasAlreadyInTeam: Function,
    users: Array as () => IUser[],
});

const route = useRoute();
const newTeam = ref<CreateTeams>({
    name: '',
    participant1: null,
    participant2: null,
});

const teams = ref<CreateTeams[]>([]);

const query1 = ref('');
const query2 = ref('');
const filteredUsers = ref<IUser[]>([]);
const localUsers = ref<IUser[]>(props.users ?? []); // Si props.users est undefined, initialise avec un tableau vide
const activeParticipant = ref<'participant1' | 'participant2' | null>(null);

// Champ de recherche pour filtrer les équipes
const searchQuery = ref('');

const filteredTeams = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) {
        return teams.value;
    }

    return teams.value.filter(team => {
        const participant1Name = `${team.participant1?.name} ${team.participant1?.firstname}`.toLowerCase();
        const participant2Name = team.participant2
            ? `${team.participant2?.name} ${team.participant2?.firstname}`.toLowerCase()
            : '';

        return participant1Name.includes(query) || participant2Name.includes(query);
    });
});

const filterUsers = (participant: 'participant1' | 'participant2') => {
    activeParticipant.value = participant;
    const query = participant === 'participant1' ? query1.value : query2.value;

    if (query.trim() === '') {
        filteredUsers.value = [];
        return;
    }

    // Filtrer uniquement les utilisateurs dans localUsers
    filteredUsers.value = localUsers.value.filter(user => {
        const fullName = `${user.name} ${user.firstname}`.toLowerCase();
        return fullName.includes(query.toLowerCase());
    });

    // Enlever les utilisateurs déjà sélectionnés de la liste
    if (participant === 'participant1' && newTeam.value.participant1) {
        filteredUsers.value = filteredUsers.value.filter(user => user.id !== newTeam.value.participant1!.id);
    }
    if (participant === 'participant2' && newTeam.value.participant2) {
        filteredUsers.value = filteredUsers.value.filter(user => user.id !== newTeam.value.participant2!.id);
    }
};

watch(() => props.users, (newUsers) => {
    // Vérifiez si newUsers est défini et est un tableau
    localUsers.value = newUsers ? [...newUsers] : []; // Si newUsers est défini, copiez-le, sinon initialisez avec un tableau vide
    // Appliquez également un filtre pour retirer les utilisateurs déjà sélectionnés
    filterUsers('participant1');
    filterUsers('participant2');
}, { immediate: true });

const selectUser = (user: IUser, participant: 'participant1' | 'participant2') => {
    if (participant === 'participant1') {
        newTeam.value.participant1 = user;
        query1.value = `${user.name} ${user.firstname}`;
    } else if (participant === 'participant2') {
        newTeam.value.participant2 = user;
        query2.value = `${user.name} ${user.firstname}`;
    }

    // Retirer l'utilisateur sélectionné de localUsers
    const index = localUsers.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
        localUsers.value.splice(index, 1);
    }

    filteredUsers.value = []; // Clear filtered users after selection
};

const handleCreateTeam = async () => {
    if (teams.value.length == 0) {
        showAlertToast('Il faut ajouter au moins une équipe');
        return;
    }
    const tournamentId = route.params.id as string;
    try {
        await createTeams(mapToCreateTeams(teams.value), tournamentId);
        if (props.fetchTournamentTeams) {
            await props.fetchTournamentTeams();
        }
    } catch (error) {
        console.error('Erreur lors de la création', error);
        alert('Échec de la création de l\'équipe. Veuillez réessayer plus tard.');
    } finally {
        if (props.closeModalTeams) {
            props.closeModalTeams();
        }
    }
};

const mapToCreateTeams = (teams: CreateTeams[]): CreateTeamsService[] => {
    return teams.map(team => ({
        name: team.name,
        participant1: team.participant1 ? `${team.participant1.id}` : null,
        participant2: team.participant2 ? `${team.participant2.id}` : null,
    }));
};

const handleAddTeam = async () => {
    teams.value.push(newTeam.value);
    newTeam.value = {
        name: '',
        participant1: null,
        participant2: null,
    };

    query1.value = '';
    query2.value = '';
};

const handleDeleteTeam = (teamToDelete: CreateTeams) => {
    const index = teams.value.findIndex(team =>
        team.name === teamToDelete.name &&
        team.participant1?.firstname === teamToDelete.participant1?.firstname &&
        team.participant2?.firstname === teamToDelete.participant2?.firstname
    );

    if (index !== -1) {
        // Supprimer l'équipe de la liste
        teams.value.splice(index, 1);
    }
};
</script>

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
                    <h3 v-if="teams.length" class="font-semibold text-md">{{ $t('created_teams_list') }}</h3>
                    <!-- Barre de recherche pour filtrer les équipes -->
                    <div v-if="teams.length > 1" class="mb-4">
                        <input v-model="searchQuery" type="text" placeholder="Rechercher une équipe..."
                            class="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div class="overflow-auto max-h-40">
                        <table class="min-w-full table-auto">
                            <tbody>
                                <tr v-for="team in filteredTeams" :key="team.name" class="h-12 odd:bg-gray-200">
                                    <td class="px-1">{{ team.name }}</td>
                                    <td class="px-4">{{ team.players[0].name }} {{ team.players[0].firstname }}</td>
                                    <td class="px-4">
                                        <span v-if="team.players[1]">
                                            {{ team.players[1].name }} {{ team.players[1].firstname }}
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
                    <button type="button" @click="handleCreateTeams"
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
import { type ICreateTeam } from '~/models/Team';
import { createTeams } from '~/services/team.service';

const props = defineProps({
    show: Boolean,
    closeModalTeams: { type: Function as PropType<() => void>, required: false },
    fetchTournamentDetails: { type: Function as PropType<() => void>, required: false },
    users: Array as () => IUser[],
});

const route = useRoute();
const newTeam = ref<ICreateTeam>({
    name: '',
    tournamentId: '',
    players: [],
});

const teams = ref<ICreateTeam[]>([]);

const query1 = ref('');
const query2 = ref('');
const filteredUsers = ref<IUser[]>([]);
const localUsers = ref<IUser[]>(props.users ?? []);
const activeParticipant = ref<'participant1' | 'participant2' | null>(null);

const searchQuery = ref('');

const filteredTeams = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) {
        return teams.value;
    }

    return teams.value.filter(team => {
        const participant1Name = `${team.players[0]?.name} ${team.players[0]?.firstname}`.toLowerCase();
        const participant2Name = team.players[1]
            ? `${team.players[1]?.name} ${team.players[1]?.firstname}`.toLowerCase()
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

    filteredUsers.value = localUsers.value.filter(user => {
        const fullName = `${user.name} ${user.firstname}`.toLowerCase();
        return fullName.includes(query.toLowerCase());
    });

    if (participant === 'participant1' && newTeam.value.players.length > 0) {
        filteredUsers.value = filteredUsers.value.filter(user => user.id !== newTeam.value.players[0].id);
    }
    if (participant === 'participant2' && newTeam.value.players.length > 1) {
        filteredUsers.value = filteredUsers.value.filter(user => user.id !== newTeam.value.players[1].id);
    }
};

watch(() => props.users, (newUsers) => {
    localUsers.value = newUsers ? [...newUsers] : [];
    filterUsers('participant1');
    filterUsers('participant2');
}, { immediate: true });

const selectUser = (user: IUser, participant: 'participant1' | 'participant2') => {
    if (participant === 'participant1' && newTeam.value.players.length < 2) {
        newTeam.value.players.push(user);
        query1.value = `${user.name} ${user.firstname}`;
    } else if (participant === 'participant2' && newTeam.value.players.length < 2) {
        newTeam.value.players.push(user);
        query2.value = `${user.name} ${user.firstname}`;
    }

    const index = localUsers.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
        localUsers.value.splice(index, 1);
    }

    filteredUsers.value = [];
};

const handleCreateTeams = async () => {
    if (teams.value.length === 0) {
        showWarningToast('add_one_team');
        return;
    }
    const tournamentId = route.params.id as string;
    try {
        await createTeams(teams.value, tournamentId);
        showSuccessToast('create_teams_ok');
        if (props.fetchTournamentDetails) {
            await props.fetchTournamentDetails();
        }
    } catch (error) {
        showAlertToast('create_teams_error');
    } finally {
        if (props.closeModalTeams) {
            props.closeModalTeams();
        }
    }
};

const handleAddTeam = async () => {
    teams.value.push(newTeam.value);
    newTeam.value = {
        name: '',
        tournamentId: '',
        players: [],
    };

    query1.value = '';
    query2.value = '';
};

const handleDeleteTeam = (teamToDelete: ICreateTeam) => {
    const index = teams.value.findIndex(team =>
        team.name === teamToDelete.name &&
        team.players[0]?.firstname === teamToDelete.players[0]?.firstname &&
        team.players[1]?.firstname === teamToDelete.players[1]?.firstname
    );

    if (index !== -1) {
        teams.value.splice(index, 1);
    }
};
</script>

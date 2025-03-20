import type { CreateTeamResponse, GenericResponse } from "~/models/Response";
import type { CreateTeam, Team } from "~/models/Team";

const API_URL = 'http://localhost:3001';

/**
 * Creates a new tournament by sending a POST request to the API.
 * @param {CreateTeam} newTeam - The tournament data to be created.
 * @returns {Promise<GenericResponse>} - The response containing the status code and message.
 */
export const createTeam = async (createTeam: CreateTeam, tournamentId: string): Promise<GenericResponse> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/teams`, {
            method: 'POST',
            body: JSON.stringify(createTeam),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as CreateTeamResponse;

        return response;

    } catch (error) {
        throw new Error('Failed to create team');
    }
};

export const joinExistingTeam = async (teamId: string): Promise<GenericResponse> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    const { data, error } = await useFetch<CreateTeamResponse>(`${API_URL}/teams/${teamId}`, {
        method: 'PUT',
        body: '',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (error.value) {
        return {
            statusCode: error.value.statusCode || 400,
            message: error.value.message || "An unknown error occurred",
        };
    }

    return {
        statusCode: data.value?.statusCode || 500,
        message: data.value?.message || "An unknown error occurred",
    };
}

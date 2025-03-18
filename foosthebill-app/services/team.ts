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

    const { data, error } = await useFetch<CreateTeamResponse>(`${API_URL}/tournaments/${tournamentId}/teams`, {
        method: 'POST',
        body: JSON.stringify(createTeam),
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    return {
        statusCode: error.value?.data?.statusCode || 500,
        message: error.value?.data?.message || "An unknown error occurred",
    };
};

import type { CreateTeamResponse, GenericResponse } from "~/models/Response";
import type { CreateTeam, Team } from "~/models/Team";

const API_URL = 'http://localhost:3001';

/**
 * Creates a new tournament by sending a POST request to the API.
 * @param {CreateTeam} newTeam - The tournament data to be created.
 * @returns {Promise<GenericResponse>} - The response containing the status code and message.
 */
export const createTeam = async (createTeam: CreateTeam): Promise<GenericResponse> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    const { error } = await useFetch<CreateTeamResponse>(`${API_URL}/teams`, {
        method: 'POST',
        body: createTeam,
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



/**
 * Retrieves the details of a specific tournament by its ID.
 * @param {string} id_tournament - The ID of the tournament.
 * @param {string} token - The authentication token.
 * @returns {Promise<Team>} - The tournament details.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTeam = async (id_tournament: string, id_team: string, token: string): Promise<Team> => {
    try {
        const response = await $fetch(`${API_URL}/teams/${id_tournament}/${id_team}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as Team;

        return response;
    } catch (error) {
        throw new Error('Failed to retrieve tournament details');
    }
};

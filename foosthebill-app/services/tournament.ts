import type { CreateTournamentResponse, GenericResponse } from "~/models/Response";
import type { CreateTournament, Tournament } from "~/models/Tournament";

const API_URL = 'http://localhost:3001';

/**
 * Creates a new tournament by sending a POST request to the API.
 * @param {CreateTournament} newTournament - The tournament data to be created.
 * @returns {Promise<GenericResponse>} - The response containing the status code and message.
 */
export const createTournament = async (newTournament: CreateTournament): Promise<GenericResponse> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    const { error } = await useFetch<CreateTournamentResponse>(`${API_URL}/tournaments`, {
        method: 'POST',
        body: newTournament,
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
 * Retrieves a list of tournaments from the API.
 * @param {string} token - The authentication token.
 * @returns {Promise<Tournament>} - The list of tournaments.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTournaments = async (token: string): Promise<Tournament> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as Tournament;

        return response;
    } catch (error) {
        throw new Error('Failed to retrieve tournaments');
    }
};

/**
 * Retrieves the details of a specific tournament by its ID.
 * @param {string} id_tournament - The ID of the tournament.
 * @param {string} token - The authentication token.
 * @returns {Promise<Tournament>} - The tournament details.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTournament = async (id_tournament: string, token: string): Promise<Tournament> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${id_tournament}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as Tournament;

        return response;
    } catch (error) {
        throw new Error('Failed to retrieve tournament details');
    }
};

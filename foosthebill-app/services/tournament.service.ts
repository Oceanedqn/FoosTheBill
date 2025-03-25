import { API_URL } from "~/constants/url.constants";
import type { ApiResponse } from "~/models/Response";
import type { ITeam } from "~/models/Team";
import type { ICreateTournament, ITournament, ITournamentDetails, ITournamentMatches } from "~/models/Tournament";

/**
 * Creates a new tournament by sending a POST request to the API.
 * 
 * @param {CreateTournament} newTournament - The tournament data to be created.
 * @returns {Promise<GenericResponse>} - The response containing the status code and message.
 */
export const createTournament = async (newTournament: ICreateTournament): Promise<ITournament> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/tournaments`, {
            method: 'POST',
            body: JSON.stringify(newTournament),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournament>;

        return response.data;

    } catch (error) {
        throw new Error('Failed to retrieve tournaments');
    }
};

/**
 * Creates matches for a specific tournament by sending the team data to the API.
 * 
 * @param {string} tournamentId - The ID of the tournament to create matches for.
 * @param {ITeam[]} teams - An array of teams participating in the tournament.
 * @param {string} token - The authorization token to authenticate the API request.
 * @returns {Promise<GenericResponse>} - A promise that resolves to the response from the API if successful, or throws an error if the request fails.
 */
export const createMatchesTournament = async (tournamentId: string, teams: ITeam[]): Promise<ITournamentMatches> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/matches`, {
            method: 'POST',
            body: JSON.stringify(teams),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournamentMatches>;

        return response.data;

    } catch (error) {
        throw new Error('Failed to retrieve tournaments');
    }
};


/**
 * Retrieves a list of tournaments from the API.
 * 
 * @returns {Promise<ITournament>} - The list of tournaments.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTournaments = async (): Promise<ITournament[]> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/tournaments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournament[]>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve tournaments');
    }
};

/**
 * Retrieves the list of teams for a specific tournament.
 * 
 * @param {string} tournamentId - The ID of the tournament.
 * @param {string} token - The authentication token.
 * @returns {Promise<ITournamentWithTeams>} - The list of teams in the tournament.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTournamentDetails = async (tournamentId: string): Promise<ITournamentDetails> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournamentDetails>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve tournament teams');
    }
};


/**
 * Retrieves the list of matches for a specific tournament.
 * 
 * @param {string} tournamentId - The ID of the tournament to retrieve matches for.
 * @returns {Promise<GenericResponse>} - A promise that resolves to the response containing the tournament's matches, or throws an error if the request fails.
 */
export const getTournamentMatches = async (tournamentId: string): Promise<ITournamentMatches> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/matches`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournamentMatches>;
        return response.data;

    } catch (error) {
        throw new Error('Failed to retrieve tournaments');
    }
};

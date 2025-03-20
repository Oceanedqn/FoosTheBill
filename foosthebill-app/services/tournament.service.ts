import type { CreateTournamentResponse, GenericResponse } from "~/models/Response";
import type { CreateTournament, Tournament, TournamentPeople, TournamentTeams } from "~/models/Tournament";
import type { User } from "~/models/User";

const API_URL = 'http://localhost:3001';

/**
 * Creates a new tournament by sending a POST request to the API.
 * @param {CreateTournament} newTournament - The tournament data to be created.
 * @returns {Promise<GenericResponse>} - The response containing the status code and message.
 */
export const createTournament = async (newTournament: CreateTournament): Promise<GenericResponse> => {
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
        }) as CreateTournamentResponse;

        return response;

    } catch (error) {
        throw new Error('Failed to retrieve tournaments');
    }
};

/**
 * Retrieves a list of tournaments from the API.
 * @param {string} token - The authentication token.
 * @returns {Promise<TournamentPeople>} - The list of tournaments.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTournaments = async (token: string): Promise<TournamentPeople> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as TournamentPeople;

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

/**
 * Retrieves the list of teams for a specific tournament.
 * @param {string} tournamentId - The ID of the tournament.
 * @param {string} token - The authentication token.
 * @returns {Promise<TournamentTeams>} - The list of teams in the tournament.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTournamentTeams = async (tournamentId: string, token: string): Promise<TournamentTeams> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/teams`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as TournamentTeams;

        return response;
    } catch (error) {
        throw new Error('Failed to retrieve tournament teams');
    }
};

/**
 * Retrieves a list of user not register in team by tournament.
 * @param {string} tournamentId - The tournament Id.
 * @param {string} token - The authentication token.
 * @returns {Promise<User>} - The list of tournaments.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getUsersNotInTournament = async (tournamentId: string, token: string): Promise<User> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as User;

        return response;
    } catch (error) {
        throw new Error('Failed to retrieve users');
    }
};


/**
 * Checks if a user is already part of a team in a specific tournament.
 * @param {string} tournamentId - The ID of the tournament.
 * @param {string} token - The authentication token.
 * @returns {Promise<{ isInTeam: boolean }>} - Indicates whether the user is in a team for the tournament.
 * @throws {Error} - Throws an error if the request fails.
 */
export const checkIfUserInTeam = async (tournamentId: string, token: string): Promise<{ isInTeam: boolean }> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/teams/isInTeam`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response as { isInTeam: boolean };
    } catch (error) {
        throw new Error('Failed to check if the user is in a team for the tournament');
    }
};

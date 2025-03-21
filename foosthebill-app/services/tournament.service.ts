import type { IMatchesTournament } from "~/models/Match";
import type { ApiResponse } from "~/models/Response";
import type { ITeam } from "~/models/Team";
import type { CreateTournament, ITournament, ITournamentWithTeams, BasicTournament, ITournamentWithTeam } from "~/models/Tournament";
import type { IUser } from "~/models/User";

const API_URL = 'http://localhost:3001';

/**
 * Creates a new tournament by sending a POST request to the API.
 * 
 * @param {CreateTournament} newTournament - The tournament data to be created.
 * @returns {Promise<GenericResponse>} - The response containing the status code and message.
 */
export const createTournament = async (newTournament: CreateTournament): Promise<BasicTournament> => {
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
        }) as ApiResponse<BasicTournament>;

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
export const createMatchesTournament = async (tournamentId: string, teams: ITeam[], token: string): Promise<BasicTournament> => {
    console.log("creatematchestournament service front : ", tournamentId)
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/matches`, {
            method: 'POST',
            body: JSON.stringify(teams),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<BasicTournament>;

        return response.data;

    } catch (error) {
        throw new Error('Failed to retrieve tournaments');
    }
};


/**
 * Retrieves the list of matches for a specific tournament.
 * 
 * @param {string} tournamentId - The ID of the tournament to retrieve matches for.
 * @param {string} token - The authorization token to authenticate the API request.
 * @returns {Promise<GenericResponse>} - A promise that resolves to the response containing the tournament's matches, or throws an error if the request fails.
 */
export const getMatchesTournament = async (tournamentId: string, token: string): Promise<IMatchesTournament[]> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/matches`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<IMatchesTournament[]>;
        return response.data;

    } catch (error) {
        throw new Error('Failed to retrieve tournaments');
    }
};


/**
 * Retrieves a list of tournaments from the API.
 * 
 * @param {string} token - The authentication token.
 * @returns {Promise<ITournament>} - The list of tournaments.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTournaments = async (token: string): Promise<ITournament[]> => {
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
 * Retrieves the details of a specific tournament by its ID.
 * 
 * @param {string} id_tournament - The ID of the tournament.
 * @param {string} token - The authentication token.
 * @returns {Promise<Tournament>} - The tournament details.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTournament = async (id_tournament: string, token: string): Promise<ITournament> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${id_tournament}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournament>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve tournament details');
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
export const getTournamentTeams = async (tournamentId: string, token: string): Promise<ITournamentWithTeams> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/teams`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournamentWithTeams>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve tournament teams');
    }
};


export const getTournamentTeam = async (tournamentId: string, token: string): Promise<ITournamentWithTeam> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/team`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournamentWithTeam>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve tournament teams');
    }
}

/**
 * Retrieves a list of users not registered in a team by tournament.
 * 
 * @param {string} tournamentId - The tournament Id.
 * @param {string} token - The authentication token.
 * @returns {Promise<IUser[]>} - The list of users not in any team for the tournament.
 * @throws {Error} - Throws an error if the request fails.
 */

export const getUsersNotInTournament = async (tournamentId: string, token: string): Promise<IUser[]> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<IUser[]>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve users');
    }
};


/**
 * Checks if a user is already part of a team in a specific tournament.
 * 
 * @param {string} tournamentId - The ID of the tournament.
 * @param {string} token - The authentication token.
 * @returns {Promise<{ isInTeam: boolean }>} - Indicates whether the user is in a team for the tournament.
 * @throws {Error} - Throws an error if the request fails.
 */
export const checkIfUserInTeam = async (tournamentId: string, token: string): Promise<boolean> => {
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/teams/isInTeam`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<boolean>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to check if the user is in a team for the tournament');
    }
};

import type { ApiResponse } from "~/models/Response";
import type { ICreateTeam, ITeam } from "~/models/Team";

/**
 * Creates a new team by sending a POST request to the API.
 * @param {CreateTeam} newTeam - The tournament data to be created.
 * @returns {Promise<GenericResponse>} - The response containing the status code and message.
 */
export const createTeam = async (createTeam: ICreateTeam, tournamentId: string): Promise<ITeam> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/team`, {
            method: 'POST',
            body: JSON.stringify(createTeam),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITeam>;

        return response.data;

    } catch (error) {
        throw new Error('Failed to create team');
    }
};

/**
 * Creates a new tournament by sending a POST request to the API.
 * @param {CreateTeams} newTeam - The tournament data to be created.
 * @returns {Promise<GenericResponse>} - The response containing the status code and message.
 */
export const createTeams = async (createTeams: ICreateTeam[], tournamentId: string): Promise<ITeam[]> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/teams`, {
            method: 'POST',
            body: JSON.stringify(createTeams),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITeam[]>;

        return response.data;

    } catch (error) {
        throw new Error('Failed to create team');
    }
};

export const joinExistingTeam = async (teamId: string): Promise<ITeam> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    try {
        const response = await $fetch(`${API_URL}/teams/${teamId}`, {
            method: 'PUT',
            body: '',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITeam>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to create team');
    }
}

export const quitTeam = async (teamId: string,): Promise<ITeam> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/teams/${teamId}/quit`, {
            method: 'PUT',
            body: '',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITeam>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to quit team');
    }
}

export const removeTeam = async (teamId: string,): Promise<ITeam> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/teams/${teamId}`, {
            method: 'DELETE',
            body: '',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITeam>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to quit team');
    }
}


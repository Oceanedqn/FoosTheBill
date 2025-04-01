
import type { ApiResponse } from "~/models/Response";
import type { IUser } from "~/models/User";

/**
 * Retrieves a list of tournaments from the API.
 * @returns {Promise<User>} - The list of tournaments.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getUsers = async (): Promise<IUser> => {
    const authStore = useAuthStore();

    try {
        const response = await $fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authStore.accessToken}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<IUser>;
        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve users');
    }
};

/**
 * Retrieves the details of a specific tournament by its ID.
 * @param {string} id - The ID of the tournament.
 * @returns {Promise<User>} - The tournament details.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getUser = async (id: string): Promise<IUser> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/users/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<IUser>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve user details');
    }
};

import type { ApiResponse } from "~/models/Response";
import type { User } from "~/models/User";

const API_URL = 'http://localhost:3001';

/**
 * Retrieves a list of tournaments from the API.
 * @param {string} token - The authentication token.
 * @returns {Promise<User>} - The list of tournaments.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getUsers = async (token: string): Promise<User> => {
    try {
        const response = await $fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<User>;
        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve users');
    }
};

/**
 * Retrieves the details of a specific tournament by its ID.
 * @param {string} id - The ID of the tournament.
 * @param {string} token - The authentication token.
 * @returns {Promise<User>} - The tournament details.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getUser = async (id: string, token: string): Promise<User> => {
    try {
        const response = await $fetch(`${API_URL}/users/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<User>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve user details');
    }
};

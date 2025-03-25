
import { API_URL } from "~/constants/url.constants";
import type { IMatch, IUpdateMatch } from "~/models/Match";
import type { ApiResponse } from "~/models/Response";



export const updateScore = async (matchId: string, matchUpdate: IUpdateMatch): Promise<IMatch> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/matches/${matchId}`, {
            method: 'PUT',
            body: matchUpdate,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<IMatch>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to create team');
    }
}


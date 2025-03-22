import type { IMatchTournament, IMatchUpdate } from "~/models/Match";
import type { ApiResponse } from "~/models/Response";

const API_URL = 'http://localhost:3001';



export const updateScore = async (matchId: string, matchUpdate: IMatchUpdate): Promise<IMatchTournament> => {
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
        }) as ApiResponse<IMatchTournament>;

        return response.data;
    } catch (error) {
        throw new Error('Failed to create team');
    }
}


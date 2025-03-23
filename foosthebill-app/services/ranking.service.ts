import type { ITournamentRankings } from "~/models/Ranking";
import type { ApiResponse } from "~/models/Response";

const API_URL = 'http://localhost:3001';



export const getRankingsByTournamentId = async (tournamentId: string): Promise<ITournamentRankings> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    try {
        const response = await $fetch(`${API_URL}/tournaments/${tournamentId}/rankings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }) as ApiResponse<ITournamentRankings>;
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch rankings:', error?.response ?? error);
        throw new Error('Failed to fetch rankings');

    }
}

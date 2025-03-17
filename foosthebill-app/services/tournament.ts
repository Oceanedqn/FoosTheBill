import type { Match } from "~/models/Match";
import type { CreateTournamentResponse, GenericResponse } from "~/models/Response";
import type { CreateTournament, Tournament } from "~/models/Tournament";

const API_URL = 'http://localhost:3001';

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

    if (error.value) {
        console.log('Erreur de création', error.value);
    }

    return {
        statusCode: error.value?.data?.statusCode || 500,
        message: error.value?.data?.message || "Une erreur inconnue s'est produite",
    };
};




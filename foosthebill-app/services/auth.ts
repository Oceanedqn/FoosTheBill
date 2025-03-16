import type { AuthResponse } from "~/types/AuthResponse";
import type { LoginCredentials } from "~/types/LoginCredentials";
import type { RegisterCredentials } from "~/types/RegisterCredentials";
import type { RegisterResponse } from "~/types/RegisterResponse";

const API_URL = 'http://localhost:3001';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data, error } = await useFetch<AuthResponse>(`${API_URL}/auth/login`, {
    method: 'POST',
    body: credentials,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Gestion des erreurs HTTP
  if (error.value) {
    console.error('Erreur lors de la tentative de login :', error.value);

    // Vérifier si l'erreur contient une réponse de l'API
    const errorResponse = error.value.data as { statusCode?: number; message?: string };

    // Renvoyer un objet avec les informations d'erreur
    return {
      error: errorResponse?.message || "Une erreur inconnue s'est produite",
      statusCode: errorResponse?.statusCode || 500,
      id: "", // Valeur par défaut pour éviter les erreurs de typage
      email: "",
    };
  }

  if (!data.value) {
    return {
      error: "Réponse invalide du serveur",
      statusCode: 500,
      id: "",
      email: "",
    };
  }

  // Stockage du accessToken si présent
  const accessToken = data.value.accessToken;
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }

  return data.value;
};

export const register = async (userData: RegisterCredentials): Promise<RegisterResponse> => {
  try {
    const response = await $fetch(`${API_URL}/users`, {
      method: 'POST',
      body: userData,
    }) as RegisterResponse; // Assertion du type de la réponse ici

    return response;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

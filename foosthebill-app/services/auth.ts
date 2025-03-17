import type { LoginCredentials, RegisterCredentials } from "~/models/Authentication";
import type { AuthResponse, UserResponse } from "~/models/Response";


const API_URL = 'http://localhost:3001';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data, error } = await useFetch<AuthResponse>(`${API_URL}/auth/login`, {
    method: 'POST',
    body: credentials,
    headers: { 'Content-Type': 'application/json' },
  });

  if (error.value || !data.value?.data?.accessToken) {
    console.error('Erreur de connexion :', error.value);

    return {
      statusCode: error.value?.data?.statusCode || 500,
      message: error.value?.data?.message || "Une erreur inconnue s'est produite",
      data: { accessToken: '', id: '', email: '' },
    };
  }

  const { accessToken, id, email } = data.value.data;

  localStorage.setItem('accessToken', accessToken);

  return {
    statusCode: data.value.statusCode ?? 200,
    message: data.value.message ?? 'Connexion réussie',
    data: { accessToken, id, email },
  };
};


export const register = async (userData: RegisterCredentials): Promise<UserResponse> => {
  try {
    const response = await $fetch(`${API_URL}/users`, {
      method: 'POST',
      body: userData,
    }) as UserResponse; // Assertion du type de la réponse ici

    return response;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const getUserInfo = async (token: string): Promise<UserResponse> => {
  try {
    const response = await $fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }) as UserResponse;

    return response;
  } catch (error) {
    throw new Error('Get user failed');
  }
}

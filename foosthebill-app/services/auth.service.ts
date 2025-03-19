import type { LoginCredentials, RegisterCredentials } from "~/models/Authentication";
import type { AuthResponse, UserResponse } from "~/models/Response";


const API_URL = 'http://localhost:3001';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const data = await $fetch<AuthResponse>(`${API_URL}/auth/login`, {
      method: 'POST',
      body: credentials,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!data?.data?.accessToken) {
      throw new Error('Invalid credentials');
    }

    localStorage.setItem('accessToken', data.data.accessToken);

    return data;
  } catch (error: any) {
    console.error('Erreur de connexion :', error);

    return {
      statusCode: error?.response?.status || 500, // Use response status if available
      message: error?.message || "Une erreur inconnue s'est produite",
      data: { accessToken: '', id: '', email: '' },
    };
  }
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

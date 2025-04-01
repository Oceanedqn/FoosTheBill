
import type { LoginCredentials, RegisterCredentials } from "~/models/Authentication";
import type { ApiResponse, AuthResponse } from "~/models/Response";
import type { IUser } from "~/models/User";


export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const reponse = await $fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: credentials,
      headers: { 'Content-Type': 'application/json' },
    }) as ApiResponse<AuthResponse>

    if (!reponse.data.accessToken) {
      throw new Error('Invalid credentials');
    }

    localStorage.setItem('accessToken', reponse.data.accessToken);

    return reponse.data;
  } catch (error) {
    throw new Error('Failed login')
  }
};


export const register = async (userData: RegisterCredentials): Promise<IUser> => {
  try {
    const response = await $fetch(`${API_URL}/users`, {
      method: 'POST',
      body: userData,
    }) as ApiResponse<IUser>;

    return response.data;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const getUserInfo = async (): Promise<IUser> => {
  const authStore = useAuthStore();
  const token = authStore.accessToken;
  try {
    const response = await $fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }) as ApiResponse<IUser>;

    return response.data;
  } catch (error) {
    throw new Error('Get user failed');
  }
}

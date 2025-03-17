import { defineStore } from 'pinia';
import type { AuthResponse, UserResponse } from '~/models/Response';
import type { User } from '~/models/User';
import { getUserInfo, login, register } from '~/services/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken, // Checks if the user is logged in via the token
  },

  actions: {
    // Login function
    async login(credentials: { email: string; password: string }, router: any) {
      try {
        const response: AuthResponse = await login(credentials);

        if (!response || !response.data.accessToken) {
          throw new Error('Invalid credentials');
        }

        this.accessToken = response.data.accessToken;
        localStorage.setItem('accessToken', this.accessToken);

        router.push('/');
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    // Logout function
    logout(router: any) {
      this.accessToken = null;
      this.user = null
      localStorage.removeItem('accessToken'); // Remove the token from localStorage
      router.push('authentication/login');
    },

    async register(credentials: { name: string, firstname: string, email: string, password: string }, router: any) {
      try {
        const response: UserResponse = await register(credentials);

        if (!response) {
          throw new Error('Invalid credentials');
        }

        return response;
      } catch (message) {
        throw message;
      }
    },

    // Initialize user state by retrieving data from localStorage
    async initialize() {
      if (import.meta.client) {
        const storedToken = localStorage.getItem('accessToken');

        if (storedToken) {
          this.accessToken = storedToken;
          await this.fetchUserInfo();
        }
      }
    },

    // Fetch user info (if the API returns it with the token)
    async fetchUserInfo() {
      if (this.accessToken) {
        try {
          const response: UserResponse = await getUserInfo(this.accessToken);

          if (!response || !response.data) {
            throw new Error('Invalid credentials');
          }

          this.user = response.data

        } catch (error) {
          console.error('Erreur lors de la récupération des informations utilisateur', error);
          throw error;
        }
      }
    },
  },
});

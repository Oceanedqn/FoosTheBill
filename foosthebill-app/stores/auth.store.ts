import { defineStore } from 'pinia';
import { login, register } from '~/services/auth'; // Import the login function from the API
import type { AuthResponse } from '~/types/AuthResponse';
import type { RegisterResponse } from '~/types/RegisterResponse';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as { email: string } | null, // User information
    accessToken: null as string | null, // The authentication token
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken, // Checks if the user is logged in via the token
  },

  actions: {
    // Login function
    async login(credentials: { email: string; password: string }, router: any) {
      try {
        const response: AuthResponse = await login(credentials);

        if (!response || !response.accessToken) {
          throw new Error('Invalid credentials');
        }

        this.accessToken = response.accessToken;
        localStorage.setItem('accessToken', this.accessToken);

        router.push('/');
      } catch (error) {
        console.error('Login failed:', error);
        throw error; // You can handle the errors more specifically if necessary
      }
    },

    // Logout function
    logout(router: any) {
      this.accessToken = null; // Remove the authentication token
      localStorage.removeItem('accessToken'); // Remove the token from localStorage
      router.push('authentication/login');
    },

    async register(credentials: { name: string, firstname: string, email: string, password: string }, router: any) {
      try {
        const response: RegisterResponse = await register(credentials);

        if (!response) {
          throw new Error('Invalid credentials');
        }

        return response;
      } catch (message) {
        throw message;
      }
    },

    // Initialize user state by retrieving data from localStorage
    initialize() {
      if (import.meta.client) {  // Replacing process.client with import.meta.client
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          this.accessToken = storedToken;
        }
      }
    },

    // Fetch user info (if the API returns it with the token)
    async fetchUserInfo() {
      if (this.accessToken) {
        // You can make an API call to get the user information with the token
        // For example, you could call a function like `getUserInfo(this.accessToken)` from your API
        // You can also add a `user` store or handle this here depending on your preference.
      }
    },
  },
});

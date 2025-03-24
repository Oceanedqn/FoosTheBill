import { defineStore } from 'pinia';
import type { AuthResponse } from '~/models/Response';
import type { IUser } from '~/models/User';
import { getUserInfo, login, register } from '~/services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as IUser | null,
    accessToken: null as string | null,
  }),

  getters: {
    // Checks if the user is logged in by verifying if an access token exists
    isLoggedIn: (state) => !!state.accessToken,
  },

  actions: {
    /**
     * Handles user login by sending credentials to the authentication service.
     * If successful, stores the access token and fetches user information.
     * Redirects the user to the home page after login.
     * @param {Object} credentials - The user's email and password.
     * @param {any} router - The router instance to handle redirection.
     * @throws {Error} If login fails due to invalid credentials.
     */
    async login(credentials: { email: string; password: string }, router: any) {
      try {
        const response: AuthResponse = await login(credentials);

        if (!response || !response.accessToken) {
          throw new Error('Invalid credentials');
        }

        this.accessToken = response.accessToken;
        localStorage.setItem('accessToken', this.accessToken);

        await this.fetchUserInfo();
        router.push('/tournaments');
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    /**
     * Logs out the user by clearing authentication data.
     * Redirects the user to the login page.
     * @param {any} router - The router instance to handle redirection.
     */
    async logout(router: any) {
      this.accessToken = null;
      this.user = null;
      localStorage.removeItem('accessToken'); // Remove the token from localStorage
      await router.push('/authentication/login');
    },

    /**
     * Registers a new user by sending their details to the authentication service.
     * @param {Object} credentials - The user's name, first name, email, and password.
     * @param {any} router - The router instance (not used in this function).
     * @returns {Promise<UserResponse>} - The response from the registration request.
     * @throws {Error} If registration fails.
     */
    async register(credentials: { name: string; firstname: string; email: string; password: string }, router: any) {
      try {
        const response: User = await register(credentials);

        if (!response) {
          throw new Error('Invalid credentials');
        }

        return response;
      } catch (message) {
        throw message;
      }
    },

    /**
     * Initializes the user authentication state.
     * Retrieves stored authentication data from localStorage and updates the state.
     * If no user data is found, fetches user info from the API.
     */
    async initialize() {
      if (this.accessToken !== null) return;

      if (import.meta.client) {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && !this.accessToken) {
          this.accessToken = storedToken;

          if (storedUser) {
            this.user = JSON.parse(storedUser);
          } else {
            await this.fetchUserInfo();
          }
        }
      }
    },

    /**
     * Fetches the logged-in user's information using the access token.
     * Updates the user state and stores the information in localStorage.
     * @throws {Error} If fetching user info fails.
     */
    async fetchUserInfo() {
      if (this.accessToken) {
        try {
          const response: User = await getUserInfo(this.accessToken);

          if (!response) {
            throw new Error('Invalid credentials');
          }

          this.user = response;
          localStorage.setItem('user', JSON.stringify(this.user));

        } catch (error) {
          console.error('Error fetching user information', error);
          throw error;
        }
      }
    },
  },
});

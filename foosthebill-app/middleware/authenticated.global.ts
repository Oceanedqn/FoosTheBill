import { useAuthStore } from '@/stores/auth.store';

export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore();

    /**
     * Redirect logged-in users away from the login or registration page.
     * If a logged-in user attempts to access these pages, they are redirected to the homepage.
     */
    if (authStore.isLoggedIn && (to.path === '/authentication/login' || to.path === '/authentication/register')) {
        return navigateTo('/'); // Redirect to the homepage
    }

    /**
     * Prevent unauthorized access to protected pages.
     * If the user is not logged in and tries to access a page other than login or registration,
     * they are redirected to the login page.
     */
    if (!authStore.isLoggedIn && to.path !== '/authentication/login' && to.path !== '/authentication/register') {
        return navigateTo('/authentication/login'); // Redirect to the login page
    }

    /**
     * Ensure the user data is loaded before accessing protected pages.
     * If the user is logged in but their information has not yet been retrieved,
     * the middleware waits for the data to be fetched.
     */
    if (authStore.isLoggedIn && !authStore.user) {
        await authStore.fetchUserInfo(); // Fetch user information
    }
});

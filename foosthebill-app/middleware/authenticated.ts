import { useAuthStore } from '@/stores/auth.store';

export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore();

    // Redirect to homepage if logged in and trying to access authentication page
    if (authStore.isLoggedIn && (to.path === '/authentication/login' || to.path === '/authentication/register')) {
        return navigateTo('/');
    }

    // Redirect to login page if not logged in and trying to access a protected page
    if (!authStore.isLoggedIn && to.path !== '/authentication/login' && to.path !== '/authentication/register') {
        return navigateTo('/authentication/login');
    }
});

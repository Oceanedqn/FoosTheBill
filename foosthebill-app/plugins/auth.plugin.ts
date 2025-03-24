// plugins/auth.ts

import { useAuthStore } from '~/stores/auth.store';

export default defineNuxtPlugin(nuxtApp => {
    const authStore = useAuthStore();

    // Initialiser l'authentification
    authStore.initialize();
});

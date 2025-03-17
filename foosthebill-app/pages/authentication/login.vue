<template>
    <div class="absolute top-4 left-1/2 right-1/2 flex justify-center space-x-4 w-auto">
        <ThemeSwitcher />
        <!-- <LanguageSwitcher /> -->
    </div>

    <div class="flex items-center justify-center min-h-screen">
        <div class="flex flex-col items-center p-6 bg-background-light rounded-2xl shadow-lg w-full max-w-md">
            <h1 class="text-2xl font-bold mb-4">{{ $t('connection') }}</h1>
            <form @submit.prevent="handleLogin" class="w-full">
                <div class="mb-4">
                    <label for="email" class="block text-sm font-medium">{{ $t('email') }}</label>
                    <input v-model="credentials.email" type="email" id="email" :placeholder="$t('email')" required
                        class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300">
                </div>
                <div class="mb-4">
                    <label for="password" class="block text-sm font-medium">{{ $t('password') }}</label>
                    <input v-model="credentials.password" type="password" id="password" :placeholder="$t('password')"
                        required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300">
                </div>
                <button type="submit"
                    class="w-full py-2 bg-primary cursor-pointer text-white rounded-lg hover:bg-primary-dark">{{
                        $t('login') }}</button>
            </form>
            <p class="mt-4 text-sm">
                {{ $t('no_account') }}
                <button @click="redirectToRegister" class="text-primary hover:text-secondary cursor-pointer">{{
                    $t('create_account') }}</button>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { NavigationGuardNext } from 'vue-router';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth.store';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const credentials = ref({
    email: '',
    password: '',
});

definePageMeta({
    middleware: ['authenticated'],
    async beforeRouteEnter(next: NavigationGuardNext) {
        next();
    },
});

const handleLogin = async () => {
    try {
        await authStore.login(credentials.value, router);

    } catch (error) {
        console.error('Login failed:', error);
        alert('Invalid credentials');
    }
};

const redirectToRegister = async () => {
    router.push('/authentication/register')
}

</script>
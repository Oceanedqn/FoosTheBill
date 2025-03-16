<template>
    <div class="absolute top-4 left-1/2 right-1/2 flex justify-center space-x-4 w-auto">
        <ThemeSwitcher />
        <!-- <LanguageSwitcher /> -->
    </div>

    <div class="flex items-center justify-center min-h-screen">
        <div class="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg w-full max-w-md">
            <h1 class="text-2xl font-bold mb-4">{{ $t('inscription') }}</h1>
            <form @submit.prevent="handleRegister" class="w-full">
                <div class="mb-4">
                    <label for="name" class="block text-sm font-medium">{{ $t('name') }}</label>
                    <input v-model="credentials.name" type="text" id="name" :placeholder="$t('name')" required
                        class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300">
                </div>
                <div class="mb-4">
                    <label for="name" class="block text-sm font-medium">{{ $t('firstname') }}</label>
                    <input v-model="credentials.firstname" type="text" id="firstname" :placeholder="$t('firstname')"
                        required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300">
                </div>
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
                <button type="submit" class="w-full py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark">{{
                    $t('register') }}</button>
            </form>
            <p class="mt-4 text-sm">
                {{ $t('already_account') }}
                <button @click="redirectToLogin" class="text-secondary cursor-pointer hover:text-primary">{{ $t('login')
                    }}</button>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { NavigationGuardNext } from 'vue-router';
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth.store';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const credentials = ref({
    name: '',
    firstname: '',
    email: '',
    password: '',
})

definePageMeta({
    middleware: ['authenticated'],
    async beforeRouteEnter(next: NavigationGuardNext) {
        next();
    },
});

const handleRegister = async () => {
    try {
        await authStore.register(credentials.value, router);
        await redirectToLogin();

    } catch (error) {
        console.error('Register failed:', error);
        alert('Invalid credentials');
    }
}

const redirectToLogin = async () => {
    router.push('/authentication/login')
}



</script>
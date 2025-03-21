<template>
    <div>
        <div class="absolute flex justify-center w-auto space-x-4 top-4 left-1/2 right-1/2">
            <ThemeSwitcher />
            <!-- <LanguageSwitcher /> -->
        </div>

        <div class="flex items-center justify-center min-h-screen">
            <div class="flex flex-col items-center w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
                <h1 class="mb-4 text-2xl font-bold">{{ $t('inscription') }}</h1>
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
                        <input v-model="credentials.password" type="password" id="password"
                            :placeholder="$t('password')" required
                            class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300">
                    </div>
                    <button type="submit"
                        class="w-full py-2 text-white rounded-lg cursor-pointer bg-secondary hover:bg-secondary-dark">{{
                            $t('register') }}</button>
                </form>
                <p class="mt-4 text-sm">
                    {{ $t('already_account') }}
                    <button @click="redirectToLogin" class="cursor-pointer text-secondary hover:text-primary">
                        {{ $t('login') }}</button>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.store';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const credentials = ref({
    name: '',
    firstname: '',
    email: '',
    password: '',
})

const handleRegister = async () => {
    console.log(credentials.value)
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
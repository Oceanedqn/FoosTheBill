<template>
    <div>
        <div class="absolute flex justify-center w-auto space-x-4 top-4 left-1/2 right-1/2">
            <ThemeSwitcher />
            <!-- <LanguageSwitcher /> -->
        </div>

        <div class="flex items-center justify-center min-h-screen">
            <div class="flex flex-col items-center w-full max-w-md p-6 shadow-lg bg-background-light rounded-2xl">
                <h1 class="mb-4 text-2xl font-bold">{{ $t('connection') }}</h1>
                <form @submit.prevent="handleLogin" class="w-full">
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
                        class="w-full py-2 text-white rounded-lg cursor-pointer bg-primary hover:bg-primary-dark">{{
                            $t('login') }}</button>
                </form>
                <p class="mt-4 text-sm">
                    {{ $t('no_account') }}
                    <button @click="redirectToRegister" class="cursor-pointer text-primary hover:text-secondary">{{
                        $t('create_account') }}</button>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth.store';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const credentials = ref({
    email: '',
    password: '',
});

const handleLogin = async () => {
    try {
        await authStore.login(credentials.value, router);
        showSuccessToast('invalid_credentials');
    } catch (error) {
        showAlertToast('invalid_credentials');
    }
};

const redirectToRegister = async () => {
    router.push('/authentication/register')
}

</script>
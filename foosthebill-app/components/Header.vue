<template>
    <header class="bg-background-alternatif text-white p-4 shadow-md">
        <div class="flex w-full justify-between items-center">
            <div class="flex space-x-2">
                <div class=" text-xl font-bold text-primary">Foos the bill</div>
                <ThemeSwitcher />
            </div>

            <nav class="flex space-x-4 items-center text-primary">
                <NuxtLink :to="localePath('/')">{{ $t('home') }}</NuxtLink>


            </nav>
            <nav class="flex space-x-4 items-center text-primary">
                <button class="cursor-pointer text-secondary hover:text-secondary-dark" @click="logout">
                    {{ $t('logout') }} <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </nav>
        </div>
    </header>
</template>

<script setup>

// Using the setup() API
const localePath = useLocalePath();
const authStore = useAuthStore();
import { useRouter } from 'vue-router';

const router = useRouter();

async function logout() {
    authStore.logout(router);
}

// Apply the theme class when the component is mounted

</script>
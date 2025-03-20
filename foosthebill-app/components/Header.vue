<template>
    <header class="bg-background-alternatif text-white p-4 shadow-md sticky top-0 z-10">
        <div class="flex w-full justify-between items-center">
            <div class="flex space-x-2">
                <div class="text-xl font-bold text-primary">Foos the bill</div>
                <ThemeSwitcher />
            </div>

            <nav class="flex space-x-4 items-center text-primary">
                <NuxtLink :to="localePath('/')" class="hover:text-primary-dark"><i class="fa-solid fa-house pr-2"></i>{{
                    $t('home')
                }}</NuxtLink>
                <NuxtLink :to="localePath('/tournaments')" class="hover:text-primary-dark"><i
                        class="fa-solid fa-trophy pr-2"></i>{{ $t('tournament') }}
                </NuxtLink>
            </nav>
            <nav class="flex space-x-4 items-center text-primary">
                <button class="cursor-pointer text-white hover:bg-primary-dark rounded-4xl bg-primary p-1 px-3"
                    @click="logout">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </nav>
        </div>
    </header>
</template>

<script setup>
const localePath = useLocalePath();
const authStore = useAuthStore();
import { useRouter } from 'vue-router';

const router = useRouter();

async function logout() {
    authStore.logout(router);
}
</script>
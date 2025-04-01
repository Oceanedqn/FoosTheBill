<template>
    <header class="sticky top-0 z-10 p-4 text-white shadow-md bg-background-alternatif">
        <div class="flex items-center justify-between w-full">
            <div class="flex space-x-2">
                <div class="text-xl font-bold text-primary">Foos the bill</div>



                <nav class="flex items-center space-x-4 ml-15 text-primary">
                    <NuxtLink :to="localePath('/tournaments')" :prefetch="false" class="hover:text-primary-dark"><i
                            class="pr-2 fa-solid fa-trophy"></i>{{ $t('tournament') }}
                    </NuxtLink>
                    <NuxtLink :to="localePath('/planning')" :prefetch="false" class="hover:text-primary-dark"><i
                            class="pr-2 fa-solid fa-calendar"></i>{{ $t('planning') }}
                    </NuxtLink>
                </nav>
            </div>
            <nav class="flex items-center space-x-4 text-primary">
                <ThemeSwitcher />
                <LanguageSwitcher />
                <div class="h-5 border-r-3 border-blue"></div>
                <button
                    class="flex items-center gap-2 px-3 py-1 text-white cursor-pointer hover:bg-primary-dark rounded-4xl bg-primary"
                    @click="logout">
                    {{ $t('logout') }} <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">
const localePath = useLocalePath();
const authStore = useAuthStore();
import { useRouter } from 'vue-router';

const router = useRouter();

async function logout() {
    authStore.logout(router);
}
</script>
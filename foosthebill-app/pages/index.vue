<template>
    <div>
        {{ $t('welcome_test') }}
    {{ user?.name }} {{ user?.firstname }}
    <h1 class="text-xl">
        Resume des derniers matchs etc
    </h1>

    <button class="p-2 text-white cursor-pointer bg-primary rounded-4xl" @click="redirectToTournament">Rejoindre un
        tournoi</button>
    </div>
    
</template>

<script setup lang="ts">
import type { NavigationGuardNext } from 'vue-router';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();
const { user } = storeToRefs(authStore);

const redirectToTournament = async () => {
    router.push('/tournaments');
};
</script>

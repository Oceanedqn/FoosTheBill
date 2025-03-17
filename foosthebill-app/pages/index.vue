<template>
    {{ $t('welcome_test') }}
    {{ user?.name }} {{ user?.firstname }}
    <div>
        Resume des derniers matchs etc
    </div>

    <button class="bg-primary rounded-4xl p-2 text-white cursor-pointer" @click="redirectToTournament">Rejoindre un
        tournoi</button>
</template>

<script setup lang="ts">
import type { NavigationGuardNext } from 'vue-router';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();
const { user } = storeToRefs(authStore);

definePageMeta({
    middleware: ['authenticated'],
    async beforeRouteEnter(next: NavigationGuardNext) {
        next();
    },
});

const redirectToTournament = async () => {
    router.push('/tournaments');
};
</script>

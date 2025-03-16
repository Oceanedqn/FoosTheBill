<template>
    {{ $t('welcome_test') }}
</template>

<script setup lang="ts">
import type { NavigationGuardNext } from 'vue-router';

definePageMeta({
    middleware: ['authenticated'],
    async beforeRouteEnter(next: NavigationGuardNext) {
        next();
    },
});
</script>

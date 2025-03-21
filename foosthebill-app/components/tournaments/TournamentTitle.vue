<template>
    <div class="flex items-center justify-center mb-8 space-x-1">
        <h1 class="text-4xl font-bold text-title-text">{{ title }}</h1>
        <i v-if="isAdmin" class="-mt-2 fa-solid fa-xs fa-certificate text-secondary"></i>
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});
</script>

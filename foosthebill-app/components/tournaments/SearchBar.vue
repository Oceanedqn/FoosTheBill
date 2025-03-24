<template>
    <div v-if="!value">
        Chargement
    </div>
    <div v-else class="flex flex-col items-center justify-between w-full mb-8 sm:flex-row">
        <div class="w-full sm:w-1/3">
            <input v-model="searchQuery" type="text" :placeholder="$t('search_team')"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg" @input="inputHandler" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    value: String,
    inputHandler: Function
});

const searchQuery = ref(value);

watch(searchQuery, (newValue) => {
    inputHandler(newValue);
});
</script>

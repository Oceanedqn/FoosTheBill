<template>
    <button @click="setGridView(true)" :class="{
        'bg-primary text-white': props.isGridView,
        'bg-gray-200': !props.isGridView
    }" class="px-4 py-2 transition rounded-lg cursor-pointer hover:bg-primary-dark hover:text-white">
        <i class="pr-1 fa-solid fa-grip"></i>{{ $t('grid_view') }}
    </button>
    <button @click="setGridView(false)" :class="{
        'bg-primary text-white': !props.isGridView,
        'bg-gray-200': props.isGridView
    }" class="px-4 py-2 transition rounded-lg cursor-pointer hover:bg-primary-dark hover:text-white">
        <i class="pr-1 fa-solid fa-table-list"></i>{{ $t('table_view') }}
    </button>
</template>

<script setup lang="ts">
const props = defineProps({
    isGridView: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['update:isGridView']);

const setGridView = (value: boolean) => {
    emit('update:isGridView', value);
};
</script>

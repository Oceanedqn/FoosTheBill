<template>
    <button @click="openModal"
        class="w-full px-4 py-2 text-white rounded-lg shadow-md cursor-pointer bg-secondary hover:bg-secondary-dark">
        <div class="flex items-center justify-center text-center">
            {{ $t('create_tournament') }} <i class="pl-2 fa-solid fa-futbol"></i>
        </div>
    </button>
    <ModalCreateTournament :show="isModalOpen" :closeModal="closeModal" :fetchTournaments="props.fetchTournaments" :selectedDate="selectedDate!" />
</template>

<script setup lang="ts">
import ModalCreateTournament from '~/components/modals/ModalCreateTournament.vue';
import { ref } from 'vue';

const isModalOpen = ref(false);

const props = defineProps({
    fetchTournaments: {
        type: Function as PropType<() => void>,
        required: true
    },
    selectedDate: {
        type: Date || null,
        required: false
    }
});

const openModal = () => {
    isModalOpen.value = true;
};
const closeModal = () => {
    isModalOpen.value = false;
};
</script>

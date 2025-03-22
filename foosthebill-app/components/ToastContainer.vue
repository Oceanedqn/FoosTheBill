<template>
    <div class="fixed z-50 flex flex-col items-end space-y-4 top-6 right-5">
        <Toast v-for="(toast, index) in toasts" :key="index" v-bind="toast" :visible="toast.visible"
            @close="handleToastClose(index)" :style="{ top: `${index * 80}px`, zIndex: 100 + index }" />
    </div>
</template>

<script setup lang="ts">
import { useToast } from "@/composables/useToast";
import Toast from "@/components/Toast.vue";

const { toasts, closeToast } = useToast();

const handleToastClose = (index: number) => {
    closeToast(index);
};
</script>

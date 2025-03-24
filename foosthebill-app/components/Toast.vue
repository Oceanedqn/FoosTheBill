<template>
    <div v-if="visible" :class="toastClasses"
        class="fixed flex items-center p-2 transition-opacity duration-300 bg-white border-l-4 rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.1)] mt-22">

        <i v-if="icon" :class="icon" class="pl-2 pr-4 fa-solid" />

        <!-- Contenu du toast -->
        <div class="flex-1">
            <p v-if="title" class="font-bold text-title">{{ $t(title) }}</p>
            <p v-if="description" class="text-sm">{{ $t(description) }}</p>
        </div>

        <!-- Bouton de fermeture -->
        <button v-if="showClose" @click="closeToast" class="-mt-8">
            <i class="cursor-pointer fa-solid fa-xmark text-title hover:text-primary"></i>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// Définition des props
interface ToastProps {
    type?: "success" | "warning" | "alert" | "info";
    title?: string;
    description?: string;
    mode?: "auto" | "manual";
    timeout?: number;
    showClose?: boolean;
    visible?: boolean;
}

const props = defineProps<ToastProps>();

const visible = ref(props.visible);

// Icon by type toast
const icon = computed(() => {
    switch (props.type) {
        case "success":
            return "fa-thumbs-up text-success";
        case "warning":
            return 'fa-triangle-exclamation text-warning';
        case "alert":
            return 'fa-thumbs-down text-alert';
        default:
            return 'fa-circle-info text-info';
    }
});

// CSS classes by toast type
const toastClasses = computed(() => ({
    "text-success": props.type === "success",
    "text-warning": props.type === "warning",
    "text-alert": props.type === "alert",
    "text-info": props.type === "info",
}));

// Auto-close if mode = “auto”.
const closeToast = () => {
    visible.value = false;
};
</script>

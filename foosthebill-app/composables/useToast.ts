import { ref } from "vue";

interface ToastOptions {
    type?: "success" | "warning" | "alert" | "info";
    title?: string;
    description?: string;
    mode?: "auto" | "manual";
    timeout?: number;
    showClose?: boolean;
    visible?: boolean;
}

const toasts = ref<ToastOptions[]>([]);

// Function to add a toast
const addToast = (options: ToastOptions) => {
    const mode = options.mode ?? "auto";
    const newToast = {
        visible: true,
        showClose: options.showClose ?? true,
        timeout: options.timeout ?? 3000,
        mode: mode,
        type: options.type,
        title: options.title,
        description: options.description,
    };

    toasts.value.push(newToast);


    if (newToast.mode !== "manual") {
        setTimeout(() => {
            removeToastByIndex(toasts.value.length - 1);
        }, newToast.timeout || 3000);
    }
};

// Function to delete a toast
const removeToastByIndex = (index: number) => {
    toasts.value.splice(index, 1);
};

// F// Function to delete a specific toast
const closeToast = (index: number) => {
    toasts.value[index].visible = false;
    setTimeout(() => {
        removeToastByIndex(index);
    }, 300);
};

export function useToast() {
    return { toasts, addToast, closeToast };
}

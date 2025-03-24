import { useToast } from "@/composables/useToast";
const { addToast } = useToast();


export const showSuccessToast = (description: string) => {
    addToast({
        type: "success",
        title: "success",
        description: description
    });
};

export const showInfoToast = (description: string) => {
    addToast({
        type: "info",
        title: "info",
        description: description
    });
};

export const showWarningToast = (description: string) => {
    addToast({
        type: "warning",
        title: "warning",
        description: description
    });
};

export const showAlertToast = (description: string) => {
    addToast({
        type: "alert",
        title: 'error',
        description: description
    });
};

export const showCustomToast = (description: string, title: string, type: "success" | "warning" | "alert" | "info") => {
    addToast({
        type: type,
        title: title,
        description: description
    });
};


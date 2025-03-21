<template>
    <div>
        <!-- Language selection icon -->
        <button @click="openModal" class="text-2xl">
            <i class="cursor-pointer fas fa-language text-primary hover:text-primary-light"></i>
        </button>

        <!-- Language selection modal -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="relative z-50 w-11/12 p-6 bg-white rounded-lg sm:w-1/2 md:w-1/3 lg:w-1/4">
                <!-- Close icon at the top-right -->
                <button @click="closeModal" class="absolute text-2xl text-gray-600 top-2 right-3 hover:text-primary">
                    <i class="cursor-pointer fas fa-times"></i>
                </button>

                <h2 class="mb-4 text-lg font-bold text-title-text">{{ $t('change_language') }}</h2>

                <!-- List of languages -->
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="lang in languages" :key="lang.code" @click="selectLanguage(lang.code)"
                        class="p-2 text-center rounded-lg cursor-pointer">
                        <p class="text-text">{{ lang.name }}</p>
                    </div>
                </div>

                <button @click="closeModal"
                    class="w-full p-2 mt-4 text-white rounded-full cursor-pointer bg-primary hover:bg-primary-light">
                    {{ $t('close') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSwitchLocalePath } from '#i18n'

const isModalOpen = ref(false)
const openModal = () => isModalOpen.value = true
const closeModal = () => isModalOpen.value = false

// Available languages
const languages = [
    { name: "Français", code: "fr" },
    { name: "English", code: "en" }
]

// Retrieve the `i18n` function from vue-i18n
const { locale } = useI18n()

// Change the language
const selectLanguage = (code) => {
    locale.value = code;
    closeModal();
};
</script>

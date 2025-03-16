<template>
    <div>
        <!-- Language selection icon -->
        <button @click="openModal" class="text-2xl">
            <i class="fas fa-language text-primary cursor-pointer hover:text-primary-light"></i>
        </button>

        <!-- Language selection modal -->
        <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div class="bg-white p-6 rounded-lg relative z-50 w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/4">
                <!-- Close icon at the top-right -->
                <button @click="closeModal" class="absolute top-2 right-3 text-2xl text-gray-600 hover:text-primary">
                    <i class="fas fa-times cursor-pointer"></i>
                </button>

                <h2 class="text-lg font-bold mb-4 text-title-text">{{ $t('change_language') }}</h2>

                <!-- List of languages -->
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="lang in languages" :key="lang.code" @click="selectLanguage(lang.code)"
                        class="cursor-pointer text-center p-2 rounded-lg">
                        <p class="text-text">{{ lang.name }}</p>
                    </div>
                </div>

                <button @click="closeModal"
                    class="mt-4 p-2 rounded-full w-full bg-primary hover:bg-primary-light text-white cursor-pointer">
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

// Retrieve the locale path switcher
const switchLocalePath = useSwitchLocalePath()

// Change the language
const selectLanguage = (code) => {
    switchLocalePath(code);
    closeModal()
}
</script>

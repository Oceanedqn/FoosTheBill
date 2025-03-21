<template>
    <div>
        <!-- Icône de sélection du thème -->
        <button class="p-1 px-3 text-white cursor-pointer hover:bg-primary-dark rounded-4xl bg-primary"
            @click="openModal">
            <i class="fa-solid fa-palette"></i>
        </button>
        <!-- Modal d'options de thèmes -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="relative z-50 w-11/12 p-6 bg-white rounded-lg sm:w-1/2 md:w-1/3 lg:w-1/4">
                <!-- Icône de fermeture en haut à droite -->
                <button @click="closeModal" class="absolute text-2xl text-gray-600 top-2 right-3 hover:text-primary">
                    <i class="cursor-pointer fas fa-times"></i>
                </button>

                <h2 class="mb-4 text-lg font-bold text-title-text">{{ $t('choice_theme') }}</h2>

                <!-- Liste des thèmes avec icônes -->
                <div class="grid grid-cols-3 gap-4">
                    <div v-for="t in themes" :key="t.className" @click="selectTheme(t.className)"
                        class="p-2 text-center rounded-lg cursor-pointer">
                        <i :class="t.icon + ' text-xl text-secondary hover:text-secondary-light'"></i>
                        <p class="text-text">{{ t.name }}</p>
                    </div>
                </div>

                <button @click="closeModal"
                    class="w-full p-2 mt-4 text-white rounded-full cursor-pointer bg-primary hover:bg-primary-light">{{
                        $t('close') }}</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Thème actif
const theme = ref('ocean-theme')
const isModalOpen = ref(false)

const themes = [
    { name: "Mignon", className: "cute-theme", icon: "fas fa-heart" },
    { name: "Océan", className: "ocean-theme", icon: "fas fa-water" },
    { name: "Nature", className: "nature-theme", icon: "fas fa-leaf" },
    { name: "Terre", className: "terre-theme", icon: "fas fa-globe" },
    { name: "Clementine", className: "clementine-theme", icon: "fas fa-circle" },
    { name: "Pastel", className: "pastel-theme", icon: "fas fa-palette" }
];

// Ouvrir/fermer le modal
const openModal = () => isModalOpen.value = true
const closeModal = () => isModalOpen.value = false

// Appliquer et sauvegarder le thème
const selectTheme = (newTheme) => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    closeModal()
}

// Charger le thème sauvegardé au démarrage
onMounted(() => {
    const savedTheme = localStorage.getItem('theme') || 'ocean-theme'
    theme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>
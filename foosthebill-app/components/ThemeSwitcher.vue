<template>
    <div>
        <!-- Icône de sélection du thème -->
        <button @click="openModal" class="text-2xl">
            <i class="fas fa-palette text-primary cursor-pointer hover:text-primary-light"></i>
        </button>

        <!-- Modal d'options de thèmes -->
        <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div class="bg-white p-6 rounded-lg relative z-50 w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/4">
                <!-- Icône de fermeture en haut à droite -->
                <button @click="closeModal" class="absolute top-2 right-3 text-2xl text-gray-600 hover:text-primary">
                    <i class="fas fa-times cursor-pointer"></i>
                </button>

                <h2 class="text-lg font-bold mb-4 text-title-text">{{ $t('choice_theme') }}</h2>

                <!-- Liste des thèmes avec icônes -->
                <div class="grid grid-cols-3 gap-4">
                    <div v-for="t in themes" :key="t.className" @click="selectTheme(t.className)"
                        class="cursor-pointer text-center p-2 rounded-lg">
                        <i :class="t.icon + ' text-xl text-secondary hover:text-secondary-light'"></i>
                        <p class="text-text">{{ t.name }}</p>
                    </div>
                </div>

                <button @click="closeModal"
                    class="mt-4 p-2 rounded-full w-full bg-primary hover:bg-primary-light text-white cursor-pointer">{{
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
    { name: "Futuriste", className: "futur-theme", icon: "fas fa-rocket" },
    { name: "Océan", className: "ocean-theme", icon: "fas fa-water" },
    { name: "Nature", className: "nature-theme", icon: "fas fa-leaf" },
    { name: "Terre", className: "terre-theme", icon: "fas fa-globe" },
    { name: "Nuit", className: "nuit-theme", icon: "fas fa-moon" },
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
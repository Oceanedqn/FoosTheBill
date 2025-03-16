<template>
    <header class="bg-background-alternatif text-white p-4 shadow-md">
        <div class="flex w-full justify-between items-center">
            <!-- Texte Okeah à gauche -->
            <div class="text-xl font-bold text-primary">Okeah</div>

            <!-- Liens de navigation à droite -->
            <nav class="flex space-x-4 items-center text-primary">
                <NuxtLink :to="`/${$i18n.locale}/`">{{ $t('home') }}</NuxtLink>
                <!-- <NuxtLink :to="`/${$i18n.locale}/food-rate`">Food rate</NuxtLink>
                <NuxtLink :to="`/${$i18n.locale}/blog`">Blog</NuxtLink> -->
                <ThemeSwitcher />
                <LanguageSwitcher />
            </nav>
        </div>
    </header>
</template>

<script>
export default {
    data() {
        return {
            themeClass: 'vintage-theme',
        };
    },
    mounted() {
        // Applique la classe du thème au body pour activer le thème
        document.body.classList.add(this.themeClass);
    },
    beforeDestroy() {
        document.body.classList.remove(this.themeClass);
    }
};
</script>
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  typescript: {
    strict: true // Active strict verification
  },
  css: ['~/assets/css/main.css', '@/assets/css/themes.css', '@fortawesome/fontawesome-free/css/all.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@nuxtjs/i18n', 'nuxt-auth-utils', '@pinia/nuxt'],
  plugins: [
    '~/plugins/auth.plugin.ts'
  ],
  i18n: {
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
    defaultLocale: "fr",
    detectBrowserLanguage: false,
    locales: [
      {
        code: 'fr',
        iso: 'fr-FR',
        name: 'Français',
        file: 'fr.json',
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json',
      },
    ],
  },
})
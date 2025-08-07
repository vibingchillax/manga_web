// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/scripts',
    'nuxt-swiper',
    '@pinia/nuxt',
    '@nuxt/icon',
    'nuxt-open-fetch'
  ],
  css: ['~/assets/css/main.css'],
  openFetch: {
    clients: {
      mangadex: {
        baseURL: 'https://api.mangadex.org'
      }
    }
  }
})
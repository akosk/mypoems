// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],
  runtimeConfig: {
    // server-only
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || "",
    n8nApiBaseUrl: process.env.N8N_API_BASE_URL || "",
    n8nApiKey: process.env.N8N_API_KEY || "",
    xApiKey: process.env.X_API_KEY || "",
    public: {
      appName: "mypoems",
    },
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': {prerender: true}
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})

<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'VersesKötetem'
const description = 'A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.'

const me = ref(null)
const isAdmin = computed(() => Boolean(me.value?.isAdmin))

onMounted(async () => {
  try {
    me.value = await $fetch('/api/me')
  } catch (e) {
    console.error('Failed to fetch user status', e)
  }
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #default>
        <UButton
          v-if="isAdmin"
          to="/executions"
          variant="ghost"
          color="gray"
        >
          Executions
        </UButton>
      </template>

      <template #right>
        <UserMenu />
        <UColorModeButton />

      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-lucide-book-open" />

    <UFooter>
      <template #left>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          © {{ new Date().getFullYear() }} VersesKötetem. Minden jog fenntartva.
        </div>
      </template>

      <template #right>
        <div class="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <NuxtLink
            to="/aszf"
            class="hover:text-primary-500 transition-colors"
          >ÁSZF</NuxtLink>
          <NuxtLink
            to="/adatkezeles"
            class="hover:text-primary-500 transition-colors"
          >Adatkezelés</NuxtLink>
          <NuxtLink
            to="/kapcsolat"
            class="hover:text-primary-500 transition-colors"
          >Kapcsolat</NuxtLink>
        </div>
      </template>
    </UFooter>
  </UApp>
</template>

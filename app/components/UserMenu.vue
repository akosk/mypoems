<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div v-if="loggedIn" class="flex items-center gap-2">
    <UDropdownMenu
      :items="[
        [{
          label: user.name,
          slot: 'account',
          disabled: true
        }],
        [{
          label: 'Kijelentkezés',
          icon: 'i-lucide-log-out',
          onSelect: logout
        }]
      ]"
      :ui="{ item: { disabled: 'cursor-text select-text' } }"
    >
      <UButton
        color="gray"
        variant="ghost"
        class="flex items-center gap-2"
      >
        <UAvatar
          :src="user.picture"
          :alt="user.name"
          size="xs"
          referrerpolicy="no-referrer"
        />
        <span class="hidden sm:inline-block">{{ user.name }}</span>
      </UButton>

      <template #account="{ item }">
        <div class="text-left">
          <p>Bejelentkezve mint</p>
          <p class="truncate font-medium text-gray-900 dark:text-white">
            {{ item.label }}
          </p>
        </div>
      </template>
    </UDropdownMenu>
  </div>
  <div v-else>
    <UButton
      to="/auth/google"
      external
      icon="i-simple-icons-google"
      color="gray"
      variant="ghost"
    >
      Belépés
    </UButton>
  </div>
</template>

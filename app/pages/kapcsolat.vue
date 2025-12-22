<script setup lang="ts">
const state = reactive({
  email: '',
  name: '',
  message: ''
})

const loading = ref(false)
const success = ref(false)

async function sendMessage() {
  loading.value = true
  // Itt valósítandó meg a tényleges küldés (pl. API hívás)
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
  success.value = true
  state.message = ''
  state.name = ''
  state.email = ''
}
</script>

<template>
  <UPage>
    <UPageBody>
      <UContainer class="py-12 max-w-2xl">
        <h1 class="text-3xl font-bold mb-8 text-center">Kapcsolat</h1>
        <p class="text-center text-gray-600 dark:text-gray-400 mb-12">
          Kérdése van a szolgáltatással kapcsolatban? Írjon nekünk, és hamarosan válaszolunk!
        </p>

        <UCard>
          <form
            class="space-y-6"
            @submit.prevent="sendMessage"
          >
            <UFormGroup
              label="Név"
              name="name"
            >
              <UInput
                v-model="state.name"
                placeholder="Az Ön neve"
              />
            </UFormGroup>

            <UFormGroup
              label="E-mail cím"
              name="email"
            >
              <UInput
                v-model="state.email"
                type="email"
                placeholder="pelda@email.hu"
              />
            </UFormGroup>

            <UFormGroup
              label="Üzenet"
              name="message"
            >
              <UTextarea
                v-model="state.message"
                :rows="5"
                placeholder="Miben segíthetünk?"
              />
            </UFormGroup>

            <div class="flex justify-end">
              <UButton
                type="submit"
                size="lg"
                :loading="loading"
                icon="i-lucide-send"
              >
                Üzenet küldése
              </UButton>
            </div>
          </form>
        </UCard>

        <UAlert
          v-if="success"
          class="mt-6"
          icon="i-lucide-check-circle"
          color="green"
          variant="soft"
          title="Sikeres küldés!"
          description="Köszönjük üzenetét, hamarosan felvesszük Önnel a kapcsolatot."
          :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }"
          @close="success = false"
        />

        <div class="mt-12 text-center space-y-2">
          <div class="flex justify-center items-center gap-2 text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-mail" />
            <span>info@verseskotetem.hu</span>
          </div>
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>

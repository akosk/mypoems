<script setup lang="ts">
const props = defineProps<{
  loading: boolean;
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'start'): void;
}>();

const poetId = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<template>
  <div class="pt-6 max-w-md mx-auto">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2 font-semibold">
          <UIcon
            name="i-lucide-import"
            class="w-5 h-5 text-primary"
          />
          Versek importálása
        </div>
      </template>

      <div class="space-y-4 text-left">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          A kezdéshez szükségünk van a <strong>poet.hu</strong> azonosítójára. Ezt a szerzői oldal URL címében találja.
        </p>

        <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-xs font-mono">
          <span class="text-gray-400">poet.hu/szerzo/</span><span class="text-primary-600 font-bold">Azonosito</span>
        </div>

        <UFormGroup
          label="Szerzői azonosító"
          name="poetId"
          help="Példa: Kiszely_Jozsef_Laszlone"
        >
          <UInput
            v-model="poetId"
            placeholder="Adja meg az azonosítót..."
            icon="i-lucide-at-sign"
            size="lg"
          />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-center">
          <UButton
            size="xl"
            :loading="loading"
            :disabled="!poetId"
            icon="i-lucide-wand-2"
            class="w-full justify-center"
            @click="$emit('start')"
          >
            Folyamat indítása
          </UButton>
        </div>
      </template>
    </UCard>

    <div class="mt-8 grid grid-cols-2 gap-4 text-left">
      <div class="flex gap-3">
        <UIcon
          name="i-lucide-shield-check"
          class="w-5 h-5 text-green-500 shrink-0"
        />
        <div class="text-xs text-gray-500">Biztonságos adatkezelés a Poet.hu-ról.</div>
      </div>
      <div class="flex gap-3">
        <UIcon
          name="i-lucide-zap"
          class="w-5 h-5 text-amber-500 shrink-0"
        />
        <div class="text-xs text-gray-500">Automatikus AI alapú kategorizálás.</div>
      </div>
    </div>
  </div>
</template>

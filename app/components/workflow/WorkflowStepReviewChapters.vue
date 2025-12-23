<script setup lang="ts">
const chapters = defineModel<Array<{ name: string, poems: any[] }>>('chapters', { required: true });

const emit = defineEmits<{
  (e: 'continue'): void;
}>();
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <UCard class="mb-6 border-l-4 border-l-primary-500">
      <div class="flex items-start gap-4">
        <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
          <UIcon
            name="i-lucide-library"
            class="w-6 h-6 text-primary-600"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Fejezetek véglegesítése</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            A mesterséges intelligencia az alábbi fejezetekbe rendezte a verseket.
            Itt módosíthatja a fejezetek címeit, ahogy azok a könyvben és a tartalomjegyzékben megjelennek majd.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <UButton
            size="lg"
            color="primary"
            icon="i-lucide-book-check"
            @click="$emit('continue')"
          >
            Könyv generálása
          </UButton>
        </div>
      </template>
    </UCard>

    <div class="space-y-4">
      <UCard
        v-for="(chapter, idx) in chapters"
        :key="idx"
        :ui="{ body: { padding: 'p-0' } }"
        class="overflow-hidden"
      >
        <div class="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <UBadge
              color="primary"
              variant="solid"
              class="rounded-full w-6 h-6 flex items-center justify-center p-0"
            >
              {{ idx + 1 }}
            </UBadge>
            <div class="flex-1">
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                Fejezet címe
              </label>
              <UInput
                v-model="chapter.name"
                variant="none"
                class="text-lg font-semibold text-gray-900 dark:text-white p-0 focus:ring-0 bg-transparent border-b border-transparent focus:border-primary-500 rounded-none transition-colors"
                placeholder="Adjon meg egy címet..."
              />
            </div>
          </div>
        </div>

        <div class="p-4">
          <UAccordion
            :items="[{ label: `${chapter.poems?.length || 0} vers ebben a fejezetben`, slot: 'poems-list' }]"
            color="gray"
            variant="ghost"
            size="sm"
          >
            <template #poems-list>
              <div class="pl-4 pt-2 space-y-1">
                <div
                  v-for="(poem, pIdx) in chapter.poems"
                  :key="pIdx"
                  class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <UIcon
                    name="i-lucide-feather"
                    class="w-3 h-3 opacity-50"
                  />
                  <span class="truncate">{{ poem.title || '(Cím nélkül)' }}</span>
                </div>
              </div>
            </template>
          </UAccordion>
        </div>
      </UCard>
    </div>
  </div>
</template>

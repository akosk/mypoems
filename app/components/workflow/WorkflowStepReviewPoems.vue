<script setup lang="ts">
defineProps<{
  poems: Array<{ title?: string, poem?: string, excluded?: boolean }>;
  status: string | null;
}>();

const emit = defineEmits<{
  (e: 'continue'): void;
  (e: 'togglePoem', index: number): void;
}>();
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <UCard class="mb-6 border-l-4 border-l-primary-500">
      <div class="flex items-start gap-4">
        <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
          <UIcon
            name="i-lucide-check-check"
            class="w-6 h-6 text-primary-600"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Versek áttekintése</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Az alábbi listában találja az importált verseket. Kérjük, nézze át őket, és törölje azokat, amelyek nem valók a kötetbe (pl. duplikációk, töredékek).
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Jelenleg <strong>{{ poems.filter(p => !p.excluded).length }}</strong> vers van kiválasztva (összesen: {{ poems.length }}).
          </p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <UButton
            size="lg"
            color="primary"
            icon="i-lucide-arrow-right"
            @click="$emit('continue')"
          >
            Kategorizálás indítása
          </UButton>
        </div>
      </template>
    </UCard>

    <div class="space-y-3">
      <UCard
        v-for="(poem, idx) in poems"
        :key="idx"
        :ui="{ body: { padding: 'p-4 sm:p-4' } }"
        class="group transition-all"
        :class="[
          poem.excluded ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : 'hover:ring-2 hover:ring-primary-500/20'
        ]"
      >
        <div class="flex items-start gap-4">
          <UBadge
            :color="poem.excluded ? 'red' : 'gray'"
            variant="soft"
            class="mt-1 font-mono"
          >
            #{{ idx + 1 }}
          </UBadge>

          <div class="flex-1 min-w-0">
            <h4
              class="font-medium text-gray-900 dark:text-white mb-1 truncate transition-all"
              :class="{ 'line-through text-gray-500 decoration-gray-400': poem.excluded }"
            >
              {{ poem.title || '(Cím nélkül)' }}
            </h4>
            <p
              class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 font-serif italic transition-all"
              :class="{ 'line-through opacity-70': poem.excluded }"
            >
              {{ poem.poem ? poem.poem.substring(0, 150) + '...' : '' }}
            </p>
          </div>

          <div
            v-if="status === 'waiting'"
            class="flex items-center self-center"
          >
            <UTooltip :text="poem.excluded ? 'Visszavétel a kötetbe' : 'Kizárás a kötetből'">
              <UButton
                :color="poem.excluded ? 'gray' : 'red'"
                variant="ghost"
                :icon="poem.excluded ? 'i-lucide-rotate-ccw' : 'i-lucide-minus-circle'"
                size="sm"
                class="transition-colors"
                :class="poem.excluded ? 'hover:bg-green-50 hover:text-green-600' : 'hover:bg-red-50 hover:text-red-600'"
                @click="$emit('togglePoem', idx)"
              />
            </UTooltip>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

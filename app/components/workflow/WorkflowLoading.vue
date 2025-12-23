<script setup lang="ts">
defineProps<{
  processingState: 'collecting' | 'categorizing' | 'generating' | null;
}>();
</script>

<template>
  <div
    v-if="processingState"
    class="py-12"
  >
    <div class="flex flex-col items-center justify-center space-y-4 animate-pulse">
      <UIcon
        name="i-lucide-loader-2"
        class="w-12 h-12 text-primary-500 animate-spin"
      />
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
        <span v-if="processingState === 'collecting'">Versek gyűjtése folyamatban...</span>
        <span v-else-if="processingState === 'categorizing'">AI kategorizálás fut...</span>
        <span v-else-if="processingState === 'generating'">Könyv és PDF generálása...</span>
      </h3>
      <p class="text-gray-500 dark:text-gray-400">Ez eltarthat néhány másodpercig.</p>
    </div>
  </div>
</template>

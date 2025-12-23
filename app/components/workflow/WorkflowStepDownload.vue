<script setup lang="ts">
defineProps<{
  bookPdf: string | null;
  pdfUrl: string | null;
}>();

const emit = defineEmits<{
  (e: 'download'): void;
}>();
</script>

<template>
  <div>
    <UCard
      v-if="bookPdf"
      class="text-left mt-4"
    >
      <template #header>
        <div class="font-medium">Generált könyv előnézete</div>
      </template>
      <div class="w-full aspect-[1/1.41] border rounded-lg overflow-hidden bg-white">
        <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          class="w-full h-full border-none"
          title="Könyv előnézet"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-lucide-download"
            @click="$emit('download')"
          >
            PDF letöltése
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

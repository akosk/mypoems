<script setup lang="ts">
defineProps<{
  bookPdf: string | null;
  pdfUrl: string | null;
  paymentStatus?: string;
  isBuying?: boolean;
}>();

const emit = defineEmits<{
  (e: 'download'): void;
  (e: 'buy'): void;
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
            v-if="paymentStatus === 'paid'"
            color="primary"
            variant="solid"
            icon="i-lucide-download"
            @click="$emit('download')"
          >
            PDF letöltése
          </UButton>
          <UButton
            v-else
            color="primary"
            variant="solid"
            icon="i-lucide-shopping-cart"
            :loading="isBuying"
            @click="$emit('buy')"
          >
            Könyv megvásárlása (3990 HUF)
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

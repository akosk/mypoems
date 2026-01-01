<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  pageCount?: number;
}>();

const emit = defineEmits<{
  (e: 'buy', payload: any): void;
}>();

const mode = ref<'digital' | 'print'>('digital');
const copies = ref(1);
const selectedPaper = ref<number | null>(null);
const papers = ref<any[]>([]);
const calculatedPrice = ref<number | null>(null);
const isCalculating = ref(false);
const error = ref<string | null>(null);

const digitalPrice = 3990;

const displayPrice = computed(() => {
  if (mode.value === 'digital') return digitalPrice;
  return calculatedPrice.value || 0;
});

// Fetch papers on mount
onMounted(async () => {
  try {
    const res = await $fetch<{ papers: any[] }>('/api/expresta/options');
    papers.value = res.papers;
    if (papers.value.length > 0) {
      selectedPaper.value = papers.value[0].id;
    }
  } catch (e) {
    console.error('Failed to load papers', e);
  }
});

// Calculate price when inputs change
const calculate = async () => {
  if (mode.value === 'digital') return;
  if (!selectedPaper.value) return;

  isCalculating.value = true;
  error.value = null;

  try {
    const res = await $fetch<any>('/api/expresta/calculate', {
      method: 'POST',
      body: {
        paperId: selectedPaper.value,
        copies: copies.value,
        pageCount: props.pageCount || 50 // Default if unknown
      }
    });
    calculatedPrice.value = res.grossAmount;
  } catch (e) {
    error.value = "Árkalkuláció sikertelen";
    console.error(e);
  } finally {
    isCalculating.value = false;
  }
};

// Debounce calculation
let timeout: any;
watch([copies, selectedPaper, mode], () => {
  if (mode.value === 'print') {
    clearTimeout(timeout);
    timeout = setTimeout(calculate, 500);
  }
});

function handleBuy() {
  emit('buy', {
    mode: mode.value,
    price: displayPrice.value,
    details: mode.value === 'print' ? {
      copies: copies.value,
      paperId: selectedPaper.value,
      paperName: papers.value.find(p => p.id === selectedPaper.value)?.name
    } : null
  });
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex gap-4 justify-center">
      <UButton
        :color="mode === 'digital' ? 'primary' : 'neutral'"
        variant="solid"
        @click="mode = 'digital'"
        icon="i-lucide-file-text"
      >
        Digitális (PDF)
      </UButton>
      <UButton
        :color="mode === 'print' ? 'primary' : 'neutral'"
        variant="solid"
        @click="mode = 'print'"
        icon="i-lucide-printer"
      >
        Nyomtatott könyv
      </UButton>
    </div>

    <UCard v-if="mode === 'print'" class="bg-gray-50 dark:bg-gray-800 w-full">
      <div class="space-y-4 text-left w-full">
        <UFormField label="Példányszám" class="w-full">
          <UInput
            v-model.number="copies"
            type="number"
            min="1"
            max="100"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Papír típusa" name="paper" class="w-full">
          <USelectMenu
            v-model="selectedPaper"
            :items="papers"
            label-key="name"
            value-key="id"
            class="w-full"
            placeholder="Válassz papírt..."
          />
        </UFormField>

        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      </div>
    </UCard>

    <div class="flex flex-col items-center gap-2 pt-4">
      <div class="text-2xl font-bold">
        <span v-if="isCalculating" class="text-gray-400">Számolás...</span>
        <span v-else>{{ new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(displayPrice) }}</span>
      </div>
      
      <UButton
        size="xl"
        color="primary"
        variant="solid"
        icon="i-lucide-shopping-cart"
        :loading="loading || isCalculating"
        block
        @click="handleBuy"
      >
        Megvásárlás
      </UButton>
      <div class="text-xs text-gray-500 text-center">
        A fizetés a Stripe biztonságos rendszerén keresztül történik.
      </div>
    </div>
  </div>
</template>

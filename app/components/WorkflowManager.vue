<script setup lang="ts">
const props = defineProps<{
  initialExecutionId?: string | null;
  forceNew?: boolean;
}>();

const loading = ref(false);
const result = ref<any>(null);
const error = ref<string | null>(null);
const executionId = ref<string | null>(null);
const resumeUrl = ref<string | null>(null);
const status = ref<string | null>(null);
const paymentStatus = ref<string>('pending');
const poems = ref<Array<{ title?: string, poem?: string, url?: string }>>([]);
const chapters = ref<Array<{ name: string, poems: any[] }>>([]);
const bookHtml = ref<string | null>(null);
const bookPdf = ref<string | null>(null);
const watermarkedPdf = ref<string | null>(null);
const polling = ref<ReturnType<typeof setInterval> | null>(null);
const poetId = ref("Kiszely_Jozsef_Laszlone");

const displayPdf = computed(() => {
  if (paymentStatus.value === 'paid') return bookPdf.value;
  return watermarkedPdf.value;
});

const steps = [
  { label: 'Importálás', value: 'import' },
  { label: 'Versek ellenőrzése', value: 'review-poems' },
  { label: 'Fejezetek áttekintése', value: 'review-chapters' },
  { label: 'Letöltés', value: 'download' }
];

const currentStepIndex = computed(() => {
  if (displayPdf.value) return 3; // Letöltés
  if (chapters.value.length > 0) return 2; // Fejezetek áttekintése
  if (poems.value.length > 0) return 1; // Versek ellenőrzése
  return 0; // Importálás
});

const processingState = ref<'collecting' | 'categorizing' | 'generating' | null>(null);
const initializing = ref(true);
const isBuying = ref(false);

async function startWorkflow() {
  if (!poetId.value.trim()) {
    error.value = "Kérlek, add meg a Poet.hu azonosítót.";
    return;
  }

  loading.value = true;
  processingState.value = 'collecting';
  result.value = null;
  error.value = null;
  executionId.value = null;
  resumeUrl.value = null;
  status.value = null;
  paymentStatus.value = 'pending';
  poems.value = [];
  chapters.value = [];
  bookHtml.value = null;
  bookPdf.value = null;
  watermarkedPdf.value = null;

  try {
    const res = await $fetch("/api/start", {
      method: "POST",
      body: {
        poetId: poetId.value.trim()
      }
    });
    result.value = res;
    executionId.value = res?.data?.executionId || res?.executionId || null;
    resumeUrl.value = res?.data?.resumeUrl || res?.resumeUrl || null;
    status.value = res?.data?.status || res?.status || "running";

    if (executionId.value) {
      startPolling();
    }
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      "Ismeretlen hiba történt";
    processingState.value = null;
  } finally {
    loading.value = false;
  }
}

async function pollExecution() {
  if (!executionId.value) return;

  try {
    const res = await $fetch("/api/execution", {
      method: "GET",
      query: { executionId: executionId.value }
    });

    status.value = res?.status || status.value;
    if (res?.paymentStatus) paymentStatus.value = res.paymentStatus;
    if (res?.resumeUrl) resumeUrl.value = res.resumeUrl;
    if (Array.isArray(res?.poems)) poems.value = res.poems;
    if (Array.isArray(res?.chapters)) chapters.value = res.chapters;
    if (res?.bookHtml) bookHtml.value = res.bookHtml;
    if (res?.bookPdf) bookPdf.value = res.bookPdf;
    if (res?.watermarkedPdf) watermarkedPdf.value = res.watermarkedPdf;

    // Clear processing state when data arrives
    if (processingState.value === 'collecting' && poems.value.length > 0) processingState.value = null;
    if (processingState.value === 'categorizing' && chapters.value.length > 0) processingState.value = null;
    if (processingState.value === 'generating' && displayPdf.value) processingState.value = null;
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      "Ismeretlen hiba történt";
  }
}

async function buyBook(payload?: any) {
  if (!executionId.value) return;
  isBuying.value = true;
  try {
    const res = await $fetch<{ url: string }>('/api/checkout', {
      method: 'POST',
      body: { 
        executionId: executionId.value,
        printingOptions: payload
      }
    });
    if (res.url) {
      window.location.href = res.url;
    }
  } catch (e: any) {
    error.value = e?.data?.statusMessage || "Sikertelen fizetés indítás";
  } finally {
    isBuying.value = false;
  }
}

function togglePoem(index: number) {
  const poem = poems.value[index];
  // @ts-expect-error - dynamic property addition if not present
  poem.excluded = !poem.excluded;
}

function startPolling() {
  if (polling.value) clearInterval(polling.value);
  polling.value = setInterval(() => {
    if (status.value === "finished" || status.value === "error" || (status.value === "waiting" && !processingState.value)) {
      if (polling.value) clearInterval(polling.value);
      polling.value = null;
      return;
    }
    pollExecution();
  }, 2000);
}

const pdfUrl = ref<string | null>(null);

watch(displayPdf, (newVal) => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  if (newVal) {
    try {
      const byteCharacters = atob(newVal);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      pdfUrl.value = URL.createObjectURL(blob);
    } catch (e) {
      console.error("Failed to process PDF data", e);
    }
  } else {
    pdfUrl.value = null;
  }
});

function downloadPdf() {
  if (!pdfUrl.value) return;
  const a = document.createElement('a');
  a.href = pdfUrl.value;
  a.download = 'verseskonyvem.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function resumeExecution(decision: string) {
  if (!resumeUrl.value) {
    error.value = "Hiányzik a folytatáshoz szükséges URL (n8n).";
    return;
  }

  loading.value = true;
  if (currentStepIndex.value === 1) processingState.value = 'categorizing';
  if (currentStepIndex.value === 2) processingState.value = 'generating';
  error.value = null;

  // @ts-expect-error - filter based on dynamic property
  const activePoems = poems.value.filter(p => !p.excluded);

  try {
    const res = await $fetch("/api/resume", {
      method: "POST",
      body: {
        resumeUrl: resumeUrl.value,
        data: {
          decision,
          poems: activePoems,
          chapters: chapters.value
        }
      }
    });
    result.value = res;
    status.value = "running";
    startPolling();
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      "Ismeretlen hiba történt";
    processingState.value = null;
  } finally {
    loading.value = false;
  }
}

async function cancelWorkflow() {
  if (!executionId.value) return;
  
  if (!confirm('Biztosan megszakítod a folyamatot?')) return;

  loading.value = true;
  try {
    await $fetch('/api/cancel', {
      method: 'POST',
      body: { executionId: executionId.value }
    });
    
    // Mark as canceled but keep state to show feedback
    status.value = 'canceled';
    if (polling.value) clearInterval(polling.value);
    
  } catch (e: any) {
    error.value = "Nem sikerült megszakítani a folyamatot.";
  } finally {
    loading.value = false;
  }
}

function resetWorkflow() {
  executionId.value = null;
  resumeUrl.value = null;
  status.value = null;
  processingState.value = null;
  poems.value = [];
  chapters.value = [];
  bookHtml.value = null;
  bookPdf.value = null;
  watermarkedPdf.value = null;
  error.value = null;
  if (polling.value) clearInterval(polling.value);
}

onBeforeUnmount(() => {
  if (polling.value) clearInterval(polling.value);
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
});

onMounted(async () => {
  try {
    if (props.forceNew) {
      resetWorkflow();
      initializing.value = false;
      return;
    }

    if (props.initialExecutionId) {
      executionId.value = props.initialExecutionId;
      await pollExecution();
      if (status.value === 'running' || status.value === 'waiting') {
        startPolling();
      }
    } else {
      const res = await $fetch<{ execution: { executionId: string, status: string, resumeUrl?: string } | null }>('/api/last-execution')
      const exec = res?.execution
      // Allow restoring canceled executions to show the state
      if (exec?.executionId) {
        executionId.value = exec.executionId
        if (exec.resumeUrl) {
          resumeUrl.value = exec.resumeUrl
        }
        await pollExecution()
        if (status.value === 'running' || status.value === 'waiting') {
          startPolling()
        }
      }
    }
  } catch (e) {
    console.error("Failed to restore execution", e)
  } finally {
    initializing.value = false
  }
})
</script>

<template>
  <UContainer class="py-12">
    <div v-if="initializing" class="mx-auto max-w-2xl space-y-8">
       <USkeleton class="h-8 w-full" />
       <div class="space-y-4">
         <USkeleton class="h-12 w-full" />
         <USkeleton class="h-32 w-full" />
       </div>
    </div>
    <div v-else class="mx-auto max-w-2xl text-center space-y-6">
      <WorkflowStepper
        :steps="steps"
        :current-step-index="currentStepIndex"
      />
      
      <WorkflowLoading :processing-state="processingState" />

      <WorkflowStepImport
        v-if="currentStepIndex === 0 && !processingState && !executionId"
        v-model="poetId"
        :loading="loading"
        @start="startWorkflow"
      />

      <div class="pt-6">
        <UAlert
          v-if="status === 'canceled'"
          color="warning"
          variant="soft"
          icon="i-lucide-ban"
          title="Folyamat megszakítva"
          description="A könyvgenerálási folyamat meg lett szakítva."
          class="mb-6"
        >
          <template #footer>
            <UButton
              color="primary"
              variant="solid"
              size="sm"
              @click="resetWorkflow"
            >
              Új könyv kezdése
            </UButton>
          </template>
        </UAlert>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          title="A kérés sikertelen"
          :description="error"
        />

        <WorkflowStepReviewPoems
          v-if="currentStepIndex === 1 && !processingState && status !== 'canceled'"
          :poems="poems"
          :status="status"
          @continue="resumeExecution('continue')"
          @toggle-poem="togglePoem"
        />

        <WorkflowStepReviewChapters
          v-if="currentStepIndex === 2 && !processingState && status !== 'canceled'"
          v-model:chapters="chapters"
          @continue="resumeExecution('continue')"
        />

        <WorkflowStepDownload
          v-if="currentStepIndex === 3 && !processingState && status !== 'canceled'"
          :book-pdf="displayPdf"
          :pdf-url="pdfUrl"
          :payment-status="paymentStatus"
          :is-buying="isBuying"
          :poems-count="poems.length"
          @download="downloadPdf"
          @buy="buyBook"
        />
      </div>

      <div v-if="executionId && paymentStatus !== 'paid' && status !== 'canceled'" class="pt-12 flex justify-center opacity-50 hover:opacity-100 transition-opacity">
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-lucide-trash-2"
          @click="cancelWorkflow"
        >
          Folyamat megszakítása / Reset
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
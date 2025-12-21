<script setup lang="ts">
const loading = ref(false);
const result = ref<any>(null);
const error = ref<string | null>(null);
const executionId = ref<string | null>(null);
const resumeUrl = ref<string | null>(null);
const status = ref<string | null>(null);
const poems = ref<Array<{ title?: string; poem?: string; url?: string }>>([]);
const chapters = ref<Array<{ name: string; poems: any[] }>>([]);
const bookHtml = ref<string | null>(null);
const polling = ref<ReturnType<typeof setInterval> | null>(null);
const poetId = ref("Kiszely_Jozsef_Laszlone");

const steps = [
  { label: 'Import', value: 'import' },
  { label: 'Review Poems', value: 'review-poems' },
  { label: 'Review Chapters', value: 'review-chapters' },
  { label: 'Download', value: 'download' }
];

const currentStepIndex = computed(() => {
  if (bookHtml.value) return 3; // Download
  if (status.value === 'waiting') {
    if (chapters.value.length > 0) return 2; // Review Chapters
    return 1; // Review Poems
  }
  return 0;
});

async function startWorkflow() {
  if (!poetId.value.trim()) {
    error.value = "Please enter a Poet ID.";
    return;
  }

  loading.value = true;
  result.value = null;
  error.value = null;
  executionId.value = null;
  resumeUrl.value = null;
  status.value = null;
  poems.value = [];
  chapters.value = [];
  bookHtml.value = null;

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
      "Unknown error";
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
    if (res?.resumeUrl) resumeUrl.value = res.resumeUrl;
    if (Array.isArray(res?.poems)) poems.value = res.poems;
    if (Array.isArray(res?.chapters)) chapters.value = res.chapters;
    if (res?.bookHtml) bookHtml.value = res.bookHtml;
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      "Unknown error";
  }
}

function removePoem(index: number) {
  poems.value.splice(index, 1);
}

function startPolling() {
  if (polling.value) clearInterval(polling.value);
  polling.value = setInterval(() => {
    if (status.value === "finished" || status.value === "error" || status.value === "waiting") {
      if (polling.value) clearInterval(polling.value);
      polling.value = null;
      return;
    }
    pollExecution();
  }, 2000);
}

function downloadHtml() {
  if (!bookHtml.value) return;
  const blob = new Blob([bookHtml.value], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-poem-book.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function resumeExecution(decision: string) {
  if (!resumeUrl.value) {
    error.value = "Missing resume URL from n8n.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const res = await $fetch("/api/resume", {
      method: "POST",
      body: {
        resumeUrl: resumeUrl.value,
        data: {
          decision,
          poems: poems.value,
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
      "Unknown error";
  } finally {
    loading.value = false;
  }
}

onBeforeUnmount(() => {
  if (polling.value) clearInterval(polling.value);
});
</script>

<template>
  <UContainer class="min-h-screen flex items-center">
    <div class="w-full py-16">
      <div class="mx-auto max-w-2xl text-center space-y-6">
        
        <!-- Stepper -->
        <div class="flex justify-center items-center gap-4 py-6">
          <div v-for="(step, idx) in steps" :key="step.value" class="flex items-center">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium"
              :class="[
                idx <= currentStepIndex
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-gray-400'
              ]"
            >
              {{ idx + 1 }}
            </div>
            <span
              class="ml-2 text-sm font-medium"
              :class="[idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-400']"
            >
              {{ step.label }}
            </span>
            <div
              v-if="idx < steps.length - 1"
              class="w-12 h-px ml-4 bg-gray-200"
            />
          </div>
        </div>

        <!-- Step 1: Import -->
        <div v-if="currentStepIndex === 0" class="pt-6 space-y-4 max-w-sm mx-auto">
           <UFormGroup label="Poet ID (from poet.hu URL)" name="poetId">
             <UInput v-model="poetId" placeholder="e.g. Kiszely_Jozsef_Laszlone" />
           </UFormGroup>

          <div class="flex items-center justify-center gap-3 pt-2">
            <UButton
              size="lg"
              :loading="loading"
              @click="startWorkflow"
              :disabled="!poetId"
            >
              Start workflow
            </UButton>
          </div>
        </div>

        <div class="pt-6">
          <UAlert
            v-if="error"
            color="red"
            variant="soft"
            title="Request failed"
            :description="error"
          />

          <UCard v-if="executionId && currentStepIndex === 0" class="text-left mt-4">
             <template #header>
              <div class="font-medium">Execution status</div>
            </template>
            <div class="text-sm">
              <div><span class="font-medium">ID:</span> {{ executionId }}</div>
              <div><span class="font-medium">Status:</span> {{ status || "unknown" }}</div>
            </div>
          </UCard>

          <!-- Step 2: Review Poems -->
          <div v-if="currentStepIndex === 1">
            <UCard class="text-left mt-4">
              <template #header>
                <div class="font-medium">Decision required</div>
              </template>
              <div class="space-y-3 text-sm">
                <p>n8n is waiting for your decision. Review the poems below and continue.</p>
                <div class="flex gap-2">
                  <UButton color="primary" @click="resumeExecution('continue')">Continue</UButton>
                  <UButton color="gray" variant="soft" @click="resumeExecution('stop')">Stop</UButton>
                </div>
              </div>
            </UCard>

                      <UCard v-if="poems.length" class="text-left mt-4">
                        <template #header>
                          <div class="font-medium">Poems</div>
                        </template>
                        <div class="space-y-4 text-sm">
                          <div v-for="(poem, idx) in poems" :key="idx" class="border-b pb-3 last:border-b-0 flex items-start gap-4">
                            <div class="flex-1 min-w-0">
                              <div class="font-medium">{{ poem.title || `Poem ${idx + 1}` }}</div>
                              <pre class="whitespace-pre-wrap text-xs text-gray-600">{{ poem.poem }}</pre>
                            </div>
                            <UButton
                              v-if="status === 'waiting' && currentStepIndex === 1"
                              color="red"
                              variant="ghost"
                              icon="i-lucide-trash"
                              size="xs"
                              @click="removePoem(idx)"
                            />
                          </div>
                        </div>
                      </UCard>          </div>

          <!-- Step 3: Review Chapters -->
          <div v-if="currentStepIndex === 2">
            <UCard class="text-left mt-4">
              <template #header>
                <div class="font-medium">Review Chapters</div>
              </template>
              <div class="space-y-3 text-sm">
                <p>Review the AI-generated chapters. You can rename them below.</p>
                <div class="flex gap-2">
                  <UButton color="primary" @click="resumeExecution('continue')">Generate Book</UButton>
                  <UButton color="gray" variant="soft" @click="resumeExecution('stop')">Stop</UButton>
                </div>
              </div>
            </UCard>

            <UCard v-if="chapters.length" class="text-left mt-4">
              <template #header>
                <div class="font-medium">Chapters</div>
              </template>
              <div class="space-y-4 text-sm">
                <div v-for="(chapter, idx) in chapters" :key="idx" class="border-b pb-4 last:border-b-0">
                  <UFormGroup :label="`Chapter ${idx + 1} Title`">
                    <UInput v-model="chapter.name" />
                  </UFormGroup>
                  <div class="mt-2 text-xs text-gray-500">
                    Contains {{ chapter.poems?.length || 0 }} poems.
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Step 4: Download -->
          <div v-if="currentStepIndex === 3">
            <UCard v-if="bookHtml" class="text-left mt-4">
              <template #header>
                <div class="font-medium">Generated Book Preview</div>
              </template>
              <div class="w-full aspect-[1/1.41] border rounded-lg overflow-hidden bg-white">
                <iframe
                  :srcdoc="bookHtml"
                  class="w-full h-full border-none"
                  title="Book Preview"
                ></iframe>
              </div>
              <template #footer>
                <div class="flex justify-end gap-2">
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-lucide-download"
                    @click="downloadHtml"
                  >
                    Download HTML
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
          
           <UCard v-if="result && currentStepIndex !== 1" class="text-left mt-4">
            <template #header>
              <div class="font-medium">n8n response</div>
            </template>
            <pre class="text-xs whitespace-pre-wrap break-words">{{ result }}</pre>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>

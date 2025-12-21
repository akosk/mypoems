<script setup lang="ts">
const loading = ref(false);
const result = ref<any>(null);
const error = ref<string | null>(null);
const executionId = ref<string | null>(null);
const resumeUrl = ref<string | null>(null);
const status = ref<string | null>(null);
const poems = ref<Array<{ title?: string; poem?: string; url?: string }>>([]);
const bookHtml = ref<string | null>(null);
const polling = ref<ReturnType<typeof setInterval> | null>(null);

async function startWorkflow() {
  loading.value = true;
  result.value = null;
  error.value = null;
  executionId.value = null;
  resumeUrl.value = null;
  status.value = null;
  poems.value = [];
  bookHtml.value = null;

  try {
    const res = await $fetch("/api/start", {
      method: "POST",
      body: {}
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
    if (res?.bookHtml) bookHtml.value = res.bookHtml;
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      "Unknown error";
  }
}

function startPolling() {
  if (polling.value) clearInterval(polling.value);
  polling.value = setInterval(() => {
    if (status.value === "finished" || status.value === "error") {
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
          poems: poems.value
        }
      }
    });
    result.value = res;
    status.value = "running";
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
        <p class="text-sm text-gray-500">mypoems</p>

        <h1 class="text-4xl font-semibold tracking-tight">
          Turn your poems into a beautifully printed book.
        </h1>

        <p class="text-lg text-gray-600">
          Pay, import from poet.hu, review categories, generate a PDF, and send to print in one flow.
        </p>

        <div class="flex items-center justify-center gap-3 pt-2">
          <UButton
            size="lg"
            :loading="loading"
            @click="startWorkflow"
          >
            Start workflow
          </UButton>

          <UButton
            size="lg"
            color="gray"
            variant="soft"
            to="#how-it-works"
          >
            How it works
          </UButton>
        </div>

        <div class="pt-6">
          <UAlert
            v-if="error"
            color="red"
            variant="soft"
            title="Request failed"
            :description="error"
          />

          <UCard v-if="executionId" class="text-left mt-4">
            <template #header>
              <div class="font-medium">Execution status</div>
            </template>
            <div class="text-sm">
              <div><span class="font-medium">ID:</span> {{ executionId }}</div>
              <div><span class="font-medium">Status:</span> {{ status || "unknown" }}</div>
            </div>
          </UCard>

          <UCard v-if="status === 'waiting'" class="text-left mt-4">
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
              <div v-for="(poem, idx) in poems" :key="idx" class="border-b pb-3 last:border-b-0">
                <div class="font-medium">{{ poem.title || `Poem ${idx + 1}` }}</div>
                <pre class="whitespace-pre-wrap text-xs text-gray-600">{{ poem.poem }}</pre>
              </div>
            </div>
          </UCard>

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

          <UCard v-if="result" class="text-left mt-4">
            <template #header>
              <div class="font-medium">n8n response</div>
            </template>

            <pre class="text-xs whitespace-pre-wrap break-words">{{ result }}</pre>
          </UCard>
        </div>
      </div>

      <div id="how-it-works" class="mx-auto max-w-4xl mt-16">
        <div class="grid gap-4 md:grid-cols-3">
          <UCard>
            <template #header>
              <div class="font-medium">1) Import</div>
            </template>
            <p class="text-gray-600">Fetch poems from poet.hu and prepare a project.</p>
          </UCard>
          <UCard>
            <template #header>
              <div class="font-medium">2) Review</div>
            </template>
            <p class="text-gray-600">Remove poems, adjust categories, reorder chapters.</p>
          </UCard>
          <UCard>
            <template #header>
              <div class="font-medium">3) Print</div>
            </template>
            <p class="text-gray-600">Generate PDF via PDFShift and send to the binder API.</p>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>

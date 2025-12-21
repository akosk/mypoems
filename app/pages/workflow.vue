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
  { label: 'Importálás', value: 'import' },
  { label: 'Versek ellenőrzése', value: 'review-poems' },
  { label: 'Fejezetek áttekintése', value: 'review-chapters' },
  { label: 'Letöltés', value: 'download' }
];

const currentStepIndex = computed(() => {
  if (bookHtml.value) return 3; // Letöltés
  if (chapters.value.length > 0) return 2; // Fejezetek áttekintése
  if (poems.value.length > 0) return 1; // Versek ellenőrzése
  return 0; // Importálás
});

const processingState = ref<'collecting' | 'categorizing' | 'generating' | null>(null);

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
    if (res?.resumeUrl) resumeUrl.value = res.resumeUrl;
    if (Array.isArray(res?.poems)) poems.value = res.poems;
    if (Array.isArray(res?.chapters)) chapters.value = res.chapters;
    if (res?.bookHtml) bookHtml.value = res.bookHtml;

    // Clear processing state when data arrives
    if (processingState.value === 'collecting' && poems.value.length > 0) processingState.value = null;
    if (processingState.value === 'categorizing' && chapters.value.length > 0) processingState.value = null;
    if (processingState.value === 'generating' && bookHtml.value) processingState.value = null;

  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      "Ismeretlen hiba történt";
  }
}

function togglePoem(index: number) {
  const poem = poems.value[index];
  // @ts-ignore - dynamic property addition if not present
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

function downloadHtml() {
  if (!bookHtml.value) return;
  const blob = new Blob([bookHtml.value], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'verseskonyvem.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

  // @ts-ignore - filter based on dynamic property
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

onBeforeUnmount(() => {
  if (polling.value) clearInterval(polling.value);
});
</script>

<template>
  <UPage>
    <UPageBody>
      <UContainer class="py-12">
        <div class="mx-auto max-w-2xl text-center space-y-6">
        
        <!-- Stepper -->
        <div class="flex justify-center items-center gap-4 py-6">
          <div v-for="(step, idx) in steps" :key="step.value" class="flex items-center">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors"
              :class="[
                idx <= currentStepIndex
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-gray-400'
              ]"
            >
              <UIcon v-if="idx < currentStepIndex" name="i-lucide-check" class="w-5 h-5" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span
              class="ml-2 text-sm font-medium transition-colors"
              :class="[idx <= currentStepIndex ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400']"
            >
              {{ step.label }}
            </span>
            <div
              v-if="idx < steps.length - 1"
              class="w-12 h-px ml-4 bg-gray-200 dark:bg-gray-700"
            />
          </div>
        </div>

        <!-- Loading State Overlay -->
        <div v-if="processingState" class="py-12">
          <div class="flex flex-col items-center justify-center space-y-4 animate-pulse">
            <UIcon name="i-lucide-loader-2" class="w-12 h-12 text-primary-500 animate-spin" />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              <span v-if="processingState === 'collecting'">Versek gyűjtése folyamatban...</span>
              <span v-else-if="processingState === 'categorizing'">AI kategorizálás fut...</span>
              <span v-else-if="processingState === 'generating'">Könyv és PDF generálása...</span>
            </h3>
            <p class="text-gray-500 dark:text-gray-400">Ez eltarthat néhány másodpercig.</p>
          </div>
        </div>

        <!-- Step 1: Import -->
        <div v-if="currentStepIndex === 0 && !processingState" class="pt-6 max-w-md mx-auto">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2 font-semibold">
                <UIcon name="i-lucide-import" class="w-5 h-5 text-primary" />
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
                  @click="startWorkflow"
                  :disabled="!poetId"
                  icon="i-lucide-wand-2"
                  class="w-full justify-center"
                >
                  Folyamat indítása
                </UButton>
              </div>
            </template>
          </UCard>

          <div class="mt-8 grid grid-cols-2 gap-4 text-left">
            <div class="flex gap-3">
              <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-green-500 shrink-0" />
              <div class="text-xs text-gray-500">Biztonságos adatkezelés a Poet.hu-ról.</div>
            </div>
            <div class="flex gap-3">
              <UIcon name="i-lucide-zap" class="w-5 h-5 text-amber-500 shrink-0" />
              <div class="text-xs text-gray-500">Automatikus AI alapú kategorizálás.</div>
            </div>
          </div>
        </div>

        <div class="pt-6">
          <UAlert
            v-if="error"
            color="red"
            variant="soft"
            title="A kérés sikertelen"
            :description="error"
          />

          <UCard v-if="executionId && currentStepIndex === 0" class="text-left mt-4">
             <template #header>
              <div class="font-medium">Végrehajtás állapota</div>
            </template>
            <div class="text-sm">
              <div><span class="font-medium">Azonosító:</span> {{ executionId }}</div>
              <div><span class="font-medium">Állapot:</span> {{ status === 'running' ? 'folyamatban' : (status || "ismeretlen") }}</div>
            </div>
          </UCard>

          <!-- Step 2: Review Poems -->
          <div v-if="currentStepIndex === 1 && !processingState" class="max-w-3xl mx-auto">
            <UCard class="mb-6 border-l-4 border-l-primary-500">
              <div class="flex items-start gap-4">
                <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
                  <UIcon name="i-lucide-check-check" class="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Versek áttekintése</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Az alábbi listában találja az importált verseket. Kérjük, nézze át őket, és törölje azokat, amelyek nem valók a kötetbe (pl. duplikációk, töredékek).
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Jelenleg <strong>{{ poems.filter((p: any) => !p.excluded).length }}</strong> vers van kiválasztva (összesen: {{ poems.length }}).
                  </p>
                </div>
              </div>
              <template #footer>
                <div class="flex justify-end">
                  <UButton 
                    size="lg" 
                    color="primary" 
                    @click="resumeExecution('continue')"
                    icon="i-lucide-arrow-right"
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
                  // @ts-ignore
                  poem.excluded ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : 'hover:ring-2 hover:ring-primary-500/20'
                ]"
              >
                <div class="flex items-start gap-4">
                  <!-- @ts-ignore -->
                  <UBadge :color="poem.excluded ? 'red' : 'gray'" variant="soft" class="mt-1 font-mono">
                    #{{ idx + 1 }}
                  </UBadge>
                  
                  <div class="flex-1 min-w-0">
                    <h4 
                      class="font-medium text-gray-900 dark:text-white mb-1 truncate transition-all"
                      :class="{ 'line-through text-gray-500 decoration-gray-400': (poem as any).excluded }"
                    >
                      {{ poem.title || '(Cím nélkül)' }}
                    </h4>
                    <p 
                      class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 font-serif italic transition-all"
                      :class="{ 'line-through opacity-70': (poem as any).excluded }"
                    >
                      {{ poem.poem ? poem.poem.substring(0, 150) + '...' : '' }}
                    </p>
                  </div>

                  <div class="flex items-center self-center" v-if="status === 'waiting'">
                    <!-- @ts-ignore -->
                    <UTooltip :text="poem.excluded ? 'Visszavétel a kötetbe' : 'Kizárás a kötetből'">
                      <UButton
                        :color="(poem as any).excluded ? 'gray' : 'red'"
                        variant="ghost"
                        :icon="(poem as any).excluded ? 'i-lucide-rotate-ccw' : 'i-lucide-minus-circle'"
                        size="sm"
                        @click="togglePoem(idx)"
                        class="transition-colors"
                        :class="(poem as any).excluded ? 'hover:bg-green-50 hover:text-green-600' : 'hover:bg-red-50 hover:text-red-600'"
                      />
                    </UTooltip>
                  </div>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Step 3: Review Chapters -->
          <div v-if="currentStepIndex === 2 && !processingState">
            <UCard class="text-left mt-4">
              <template #header>
                <div class="font-medium">Fejezetek ellenőrzése</div>
              </template>
              <div class="space-y-3 text-sm">
                <p>Ellenőrizze az AI által generált fejezeteket. Alább átnevezheti őket.</p>
                <div class="flex gap-2">
                  <UButton color="primary" @click="resumeExecution('continue')">Könyv generálása</UButton>
                  <UButton color="gray" variant="soft" @click="resumeExecution('stop')">Leállítás</UButton>
                </div>
              </div>
            </UCard>

            <UCard v-if="chapters.length" class="text-left mt-4">
              <template #header>
                <div class="font-medium">Fejezetek</div>
              </template>
              <div class="space-y-4 text-sm">
                <div v-for="(chapter, idx) in chapters" :key="idx" class="border-b pb-4 last:border-b-0">
                  <UFormGroup :label="`${idx + 1}. fejezet címe`" class="text-left">
                    <UInput v-model="chapter.name" />
                  </UFormGroup>
                  <div class="mt-2 text-xs text-gray-500 text-left">
                    {{ chapter.poems?.length || 0 }} verset tartalmaz.
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Step 4: Download -->
          <div v-if="currentStepIndex === 3 && !processingState">
            <UCard v-if="bookHtml" class="text-left mt-4">
              <template #header>
                <div class="font-medium">Generált könyv előnézete</div>
              </template>
              <div class="w-full aspect-[1/1.41] border rounded-lg overflow-hidden bg-white">
                <iframe
                  :srcdoc="bookHtml"
                  class="w-full h-full border-none"
                  title="Könyv előnézet"
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
                    HTML letöltése
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
          
           <UCard v-if="result && currentStepIndex !== 1" class="text-left mt-4">
            <template #header>
              <div class="font-medium">n8n válasz</div>
            </template>
            <pre class="text-xs whitespace-pre-wrap break-words">{{ result }}</pre>
          </UCard>
        </div>
      </div>
    </UContainer>
  </UPageBody>
</UPage>
</template>

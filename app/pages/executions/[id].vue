<script setup lang="ts">
const route = useRoute()
const executionId = route.params.id as string

const { data: execution, pending, error } = await useFetch(`/api/execution`, {
  query: { executionId }
})

const showAllPoems = ref(false)

const statusColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
    case 'canceled':
      return 'error'
    case 'waiting':
      return 'warning'
    case 'running':
      return 'primary'
    default:
      return 'neutral'
  }
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function downloadPdf(base64Data: string) {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `book-${executionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Failed to download PDF", e);
    alert("Failed to process PDF data.");
  }
}

const rawDataItems = computed(() => [{
  label: 'Raw Execution Data',
  icon: 'i-lucide-database',
  slot: 'raw-data'
}])

const cleanedExecution = computed(() => {
  if (!execution.value) return null
  const { bookPdf, ...rest } = execution.value
  return rest
})

const poemChapterMap = computed(() => {
  const map = new Map<string, string>()
  if (!execution.value?.chapters) return map

  for (const chapter of execution.value.chapters) {
    for (const poem of chapter.poems || []) {
      const key = poem.url || poem.title
      if (key) {
        map.set(key, chapter.name)
      }
    }
  }
  return map
})
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-6">
      <UButton
        to="/executions"
        icon="i-lucide-arrow-left"
        color="gray"
        variant="ghost"
        class="mb-4"
      >
        Back to Executions
      </UButton>
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            Execution #{{ executionId }}
            <UBadge v-if="execution" :color="statusColor(execution.status)" variant="subtle" size="lg">
              {{ execution.status }}
            </UBadge>
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <UIcon name="i-lucide-activity" class="w-4 h-4" />
            <span>Workflow Inspection</span>
          </p>
        </div>
      </div>
    </div>

    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      title="Failed to load execution"
      :description="error.message"
    />

    <div v-else-if="execution" class="space-y-6">
      <!-- Summary Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-info" class="w-5 h-5 text-gray-400" />
              Summary
            </h3>
            <div class="flex items-center gap-2">
              <UButton
                v-if="execution.bookPdf"
                icon="i-lucide-download"
                size="xs"
                color="primary"
                variant="solid"
                @click="downloadPdf(execution.bookPdf)"
              >
                Download PDF
              </UButton>
            </div>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <!-- User Info -->
           <div v-if="execution.user">
             <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Executor</p>
             <div class="flex items-center gap-3">
                <img
                  v-if="execution.user.avatar"
                  :src="execution.user.avatar"
                  :alt="execution.user.firstName || execution.user.email"
                  class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
                  referrerpolicy="no-referrer"
                  loading="lazy"
                />
                <UAvatar
                  v-else
                  icon="i-lucide-user"
                  size="sm"
                  class="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 ring-2 ring-white dark:ring-gray-900"
                />
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ (execution.user.lastName && execution.user.firstName) ? `${execution.user.lastName} ${execution.user.firstName}` : (execution.user.email || 'Unknown User') }}
                  </p>
                  <p v-if="execution.user.email && (execution.user.lastName || execution.user.firstName)" class="text-xs text-gray-500 truncate">
                    {{ execution.user.email }}
                  </p>
                </div>
             </div>
           </div>

           <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Resume URL</p>
            <div class="flex items-center gap-2">
              <p class="text-sm truncate font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded w-full" :title="execution.resumeUrl || '-'">
                {{ execution.resumeUrl || 'N/A' }}
              </p>
            </div>
          </div>
          <div>
             <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Source Node</p>
             <UBadge color="gray" variant="soft">{{ execution.poemsSourceNode || 'Unknown' }}</UBadge>
          </div>
           <div>
             <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Items Found</p>
             <div class="flex gap-3">
               <span class="text-sm">Poems: <strong>{{ execution.poems?.length || 0 }}</strong></span>
               <span class="text-sm">Chapters: <strong>{{ execution.chapters?.length || 0 }}</strong></span>
             </div>
          </div>
        </div>
      </UCard>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Poems List -->
        <UCard :ui="{ body: { padding: 'p-0' } }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-lucide-scroll-text" class="w-5 h-5 text-gray-400" />
                Poems
                <UBadge color="gray" variant="subtle" size="xs" :label="String(execution.poems?.length || 0)" />
              </h3>
            </div>
          </template>

          <div v-if="execution.poems && execution.poems.length">
             <div class="divide-y divide-gray-100 dark:divide-gray-800">
               <div 
                 v-for="(poem, idx) in (showAllPoems ? execution.poems : execution.poems.slice(0, 5))" 
                 :key="idx" 
                 class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
               >
                  <div class="flex justify-between items-start gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <p class="font-medium text-sm text-gray-900 dark:text-white">{{ poem.title || 'Untitled' }}</p>
                        <UBadge v-if="poemChapterMap.get(poem.url || poem.title)" color="primary" variant="subtle" size="xs">
                          {{ poemChapterMap.get(poem.url || poem.title) }}
                        </UBadge>
                      </div>
                      <a v-if="poem.url" :href="poem.url" target="_blank" class="text-xs text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-1 mt-0.5">
                        {{ poem.url }}
                        <UIcon name="i-lucide-external-link" class="w-3 h-3" />
                      </a>
                    </div>
                    <UBadge v-if="idx < 3" size="xs" color="gray" variant="outline">{{ idx + 1 }}</UBadge>
                  </div>
               </div>
             </div>
             <div v-if="execution.poems.length > 5" class="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
               <UButton
                 :label="showAllPoems ? 'Show Less' : `Show ${execution.poems.length - 5} More`"
                 variant="ghost"
                 color="gray"
                 size="sm"
                 :icon="showAllPoems ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                 @click="showAllPoems = !showAllPoems"
               />
             </div>
          </div>
          <div v-else class="p-8 text-center text-gray-500 text-sm">
            No poems found.
          </div>
        </UCard>

        <!-- Chapters List -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-book-open" class="w-5 h-5 text-gray-400" />
              Chapters
            </h3>
          </template>
           <div v-if="execution.chapters && execution.chapters.length" class="space-y-2">
              <div v-for="(chapter, idx) in execution.chapters" :key="idx" class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                <UBadge color="gray" variant="soft" class="font-mono">{{ idx + 1 }}</UBadge>
                <span class="font-medium text-sm">{{ chapter.name || `Chapter ${idx + 1}` }}</span>
                <span class="text-xs text-gray-500 ml-auto">{{ chapter.poems?.length || 0 }} poems</span>
              </div>
           </div>
           <div v-else class="p-6 text-center text-gray-500 text-sm">
             No chapters generated yet.
           </div>
        </UCard>
      </div>

      <!-- Raw Data Accordion -->
      <UAccordion :items="rawDataItems">
        <template #raw-data>
          <div class="bg-gray-900 text-gray-200 p-4 rounded-b-md overflow-x-auto text-xs font-mono">
             <pre>{{ JSON.stringify(cleanedExecution, null, 2) }}</pre>
          </div>
        </template>
      </UAccordion>

    </div>
  </UContainer>
</template>

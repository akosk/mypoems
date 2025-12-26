<script setup lang="ts">
const route = useRoute()
const executionId = route.params.id as string

const { data: execution, pending, error } = await useFetch(`/api/execution`, {
  query: { executionId }
})

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
      
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-semibold flex items-center gap-3">
            Execution Details
            <UBadge v-if="execution" :color="statusColor(execution.status)" variant="subtle">
              {{ execution.status }}
            </UBadge>
          </h1>
          <p class="text-gray-500 dark:text-gray-400 font-mono mt-1">{{ executionId }}</p>
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
          <h3 class="font-semibold">Summary</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div>
            <p class="text-sm text-gray-500">Resume URL</p>
            <p class="text-sm truncate" :title="execution.resumeUrl || '-'">{{ execution.resumeUrl || '-' }}</p>
          </div>
          <div>
             <p class="text-sm text-gray-500">Source Node</p>
             <p class="text-sm font-medium">{{ execution.poemsSourceNode || '-' }}</p>
          </div>
        </div>
      </UCard>

      <!-- JSON Data Inspection -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">Extracted Data</h3>
        </template>
        
        <div class="space-y-4">
          <div v-if="execution.bookHtml">
            <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Book HTML</h4>
             <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                <pre class="text-xs">{{ execution.bookHtml.substring(0, 500) }}...</pre>
             </div>
          </div>

          <div v-if="execution.poems && execution.poems.length">
             <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
               Poems Found ({{ execution.poems.length }})
             </h4>
             <div class="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
               <div v-for="(poem, idx) in execution.poems.slice(0, 5)" :key="idx" class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <p class="font-medium text-sm">{{ poem.title || 'Untitled' }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ poem.url }}</p>
               </div>
               <div v-if="execution.poems.length > 5" class="p-2 text-center text-xs text-gray-500">
                 + {{ execution.poems.length - 5 }} more
               </div>
             </div>
          </div>

           <div v-if="execution.chapters && execution.chapters.length">
             <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
               Chapters ({{ execution.chapters.length }})
             </h4>
             <div class="flex flex-wrap gap-2">
                <UBadge v-for="(chapter, idx) in execution.chapters" :key="idx" color="gray" variant="soft">
                  {{ chapter.name || `Chapter ${idx + 1}` }}
                </UBadge>
             </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

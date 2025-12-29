<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/my-executions', {
  key: 'my-executions'
})

const columns = [
  { accessorKey: 'n8n_execution_id', header: 'Azonosító' },
  { accessorKey: 'status', header: 'Állapot' },
  { accessorKey: 'started_at', header: 'Kezdés' },
  { accessorKey: 'finished_at', header: 'Befejezés' },
  { accessorKey: 'actions', header: '' }
]

const rows = computed(() => {
  console.log('data', JSON.stringify(data.value));
  return data.value?.executions || []
})

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('hu-HU')
}

function translateStatus(status: string) {
  switch (status?.toLowerCase()) {
    case 'success': return 'Kész'
    case 'running': return 'Folyamatban'
    case 'error': return 'Hiba'
    default: return status || '-'
  }
}

function getStatusColor(status: string) {
   switch (status?.toLowerCase()) {
    case 'success': return 'success'
    case 'running': return 'info'
    case 'error': return 'error'
    default: return 'neutral'
  }
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold mb-6">Könyveim</h1>

    <div v-if="pending" class="text-center">
      <UIcon name="i-lucide-loader-2" class="animate-spin h-8 w-8" />
    </div>

    <div v-else-if="error" class="text-red-500">
      Hiba történt a betöltés közben: {{ error.message }}
    </div>

    <div v-else-if="!rows.length" class="text-gray-500">
      Még nincs elmentett könyved.
    </div>

    <UCard v-else>
      <UTable :data="rows" :columns="columns">
        <template #started_at-cell="{ row }">
          {{ formatDate(row.original.started_at) }}
        </template>
        <template #finished_at-cell="{ row }">
          {{ formatDate(row.original.finished_at) }}
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)">
            {{ translateStatus(row.original.status) }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <UButton 
            :to="`/workflow/poet/${row.original.n8n_execution_id}`" 
            icon="i-lucide-external-link" 
            size="xs" 
            variant="ghost"
            color="primary"
          >
            Megnyitás
          </UButton>
        </template>
      </UTable>
    </UCard>
  </UContainer>
</template>

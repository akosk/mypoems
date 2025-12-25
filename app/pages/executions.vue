<script setup lang="ts">
type ExecutionSummary = {
  id?: string
  status?: string
  mode?: string
  startedAt?: string
  stoppedAt?: string
  workflowId?: string
  finished?: boolean
}

const me = ref<{ loggedIn: boolean; isAdmin: boolean } | null>(null)
const loggedIn = computed(() => Boolean(me.value?.loggedIn))
const isAdmin = computed(() => Boolean(me.value?.isAdmin))

onMounted(async () => {
  try {
    me.value = await $fetch('/api/me')
  } catch (e) {
    console.error('Failed to fetch user', e)
  }
})

const workflowId = ref('')
const executions = ref<ExecutionSummary[]>([])
const pending = ref(false)
const error = ref<string | null>(null)
const lastLoadedAt = ref<string | null>(null)

const statusColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'green'
    case 'error':
      return 'red'
    case 'waiting':
      return 'yellow'
    case 'running':
      return 'blue'
    default:
      return 'gray'
  }
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const loadExecutions = async () => {
  error.value = null
  executions.value = []
  const trimmed = workflowId.value.trim()
  if (!trimmed) {
    error.value = 'Please enter a workflow ID.'
    return
  }

  pending.value = true
  try {
    const res = await $fetch<{ executions: ExecutionSummary[] }>('/api/executions', {
      query: { workflowId: trimmed }
    })
    executions.value = res.executions || []
    lastLoadedAt.value = new Date().toLocaleString()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Failed to load executions.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UContainer class="py-10">
    <UCard>
      <template #header>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-xl font-semibold">Executions</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Review recent n8n runs for a workflow.
            </p>
          </div>
          <UBadge v-if="lastLoadedAt" color="gray" variant="subtle">
            Last loaded: {{ lastLoadedAt }}
          </UBadge>
        </div>
      </template>

      <div v-if="!loggedIn" class="flex flex-col gap-3">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Sign in to access admin tooling.
        </p>
        <UButton
          to="/auth/google"
          external
          icon="i-simple-icons-google"
          color="gray"
          variant="ghost"
          class="w-fit"
        >
          Sign in
        </UButton>
      </div>

      <div v-else-if="!isAdmin" class="text-sm text-gray-500 dark:text-gray-400">
        You do not have access to this page.
      </div>

      <div v-else class="flex flex-col gap-4">
        <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <UFormGroup label="Workflow ID" name="workflowId">
            <UInput
              v-model="workflowId"
              placeholder="e.g. 12"
              size="lg"
            />
          </UFormGroup>

          <UButton
            color="primary"
            size="lg"
            :loading="pending"
            @click="loadExecutions"
          >
            Load executions
          </UButton>
        </div>

        <UAlert
          v-if="error"
          color="red"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          :title="error"
        />
      </div>
    </UCard>

    <div v-if="isAdmin" class="mt-6">
      <div v-if="pending" class="grid gap-4">
        <USkeleton v-for="i in 3" :key="i" class="h-24" />
      </div>

      <div v-else-if="executions.length" class="grid gap-4">
        <UCard v-for="execution in executions" :key="execution.id || execution.startedAt">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Execution
              </p>
              <p class="text-base font-semibold text-gray-900 dark:text-white">
                {{ execution.id || 'Unknown' }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UBadge :color="statusColor(execution.status)">
                {{ execution.status || 'unknown' }}
              </UBadge>
              <UBadge v-if="execution.mode" color="gray" variant="subtle">
                {{ execution.mode }}
              </UBadge>
            </div>
          </div>

          <div class="mt-4 grid gap-2 text-sm text-gray-500 dark:text-gray-400 sm:grid-cols-3">
            <div>Started: {{ formatDate(execution.startedAt) }}</div>
            <div>Stopped: {{ formatDate(execution.stoppedAt) }}</div>
            <div>Workflow: {{ execution.workflowId || workflowId }}</div>
          </div>
        </UCard>
      </div>

      <div v-else class="mt-6 text-sm text-gray-500 dark:text-gray-400">
        No executions loaded yet.
      </div>
    </div>
  </UContainer>
</template>

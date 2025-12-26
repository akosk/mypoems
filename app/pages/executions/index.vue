<script setup lang="ts">
type ExecutionSummary = {
  id?: string
  status?: string
  mode?: string
  startedAt?: string
  stoppedAt?: string
  workflowId?: string
  finished?: boolean
  user?: {
    email: string
    avatar?: string
    firstName?: string
    lastName?: string
  }
}

const me = ref<{ loggedIn: boolean; isAdmin: boolean } | null>(null)
const loggedIn = computed(() => Boolean(me.value?.loggedIn))
const isAdmin = computed(() => Boolean(me.value?.isAdmin))

onMounted(async () => {
  try {
    me.value = await $fetch('/api/me')
    if (me.value?.isAdmin) {
      loadExecutions()
    }
  } catch (e) {
    console.error('Failed to fetch user', e)
  }
})

// Removed workflowId ref as it is now handled by the server
const executions = ref<ExecutionSummary[]>([])
const pending = ref(false)
const error = ref<string | null>(null)
const lastLoadedAt = ref<string | null>(null)

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

const calculateDuration = (start?: string, stop?: string) => {
  if (!start || !stop) return '-'
  const startTime = new Date(start).getTime()
  const stopTime = new Date(stop).getTime()
  
  if (Number.isNaN(startTime) || Number.isNaN(stopTime)) return '-'
  
  const diff = Math.max(0, stopTime - startTime)
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

const loadExecutions = async () => {
  error.value = null
  executions.value = []
  pending.value = true
  try {
    const res = await $fetch<{ executions: ExecutionSummary[] }>('/api/executions')
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
              Review recent n8n runs for the default workflow.
            </p>
          </div>
          <div class="flex items-center gap-2">
             <UBadge v-if="lastLoadedAt" color="neutral" variant="subtle">
              Last loaded: {{ lastLoadedAt }}
            </UBadge>
            <UButton
              v-if="isAdmin"
              color="gray"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :loading="pending"
              @click="loadExecutions"
            >
              Refresh
            </UButton>
          </div>
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
          color="neutral"
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
        <UAlert
          v-if="error"
          color="error"
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

      <div v-else-if="executions.length" class="grid gap-3">
        <UCard
          v-for="execution in executions"
          :key="execution.id || execution.startedAt"
          :ui="{ body: { padding: 'p-4 sm:p-5' } }"
          class="transition-shadow hover:shadow-md cursor-pointer"
          @click="navigateTo(`/executions/${execution.id}`)"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <!-- Left: User & Identity -->
            <div class="flex items-start gap-4">
              <img
                v-if="execution.user?.avatar"
                :src="execution.user.avatar"
                :alt="execution.user.firstName || execution.user.email"
                class="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
                referrerpolicy="no-referrer"
                loading="lazy"
              />
              <UAvatar
                v-else
                icon="i-lucide-user"
                size="md"
                class="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 ring-2 ring-white dark:ring-gray-900"
              />

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ (execution.user?.lastName && execution.user?.firstName) ? `${execution.user.lastName} ${execution.user.firstName}` : (execution.user?.email || 'Unknown User') }}
                  </span>
                  <UBadge
                    v-if="execution.mode"
                    color="neutral"
                    variant="soft"
                    size="xs"
                    class="hidden sm:inline-flex"
                  >
                    {{ execution.mode }}
                  </UBadge>
                </div>
                
                <p v-if="execution.user?.email && (execution.user?.lastName || execution.user?.firstName)" class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {{ execution.user.email }}
                </p>

                <div class="mt-0.5 text-[10px] uppercase tracking-wider font-medium text-gray-400 flex items-center gap-2">
                  <span class="font-mono">ID: {{ execution.id || 'N/A' }}</span>
                  <span class="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <span>Workflow: {{ execution.workflowId || workflowId }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Status & Timing -->
            <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-1">
              <UBadge
                :color="statusColor(execution.status)"
                variant="subtle"
                size="sm"
                class="capitalize"
              >
                <UIcon
                  :name="execution.status === 'running' ? 'i-lucide-loader-2' : (execution.status === 'success' ? 'i-lucide-check-circle' : (execution.status === 'error' || execution.status === 'canceled' ? 'i-lucide-x-circle' : 'i-lucide-circle'))"
                  class="w-3.5 h-3.5 mr-1"
                  :class="{'animate-spin': execution.status === 'running'}"
                />
                {{ execution.status || 'unknown' }}
              </UBadge>

              <div class="flex flex-col items-end gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex items-center gap-1.5" title="Started At">
                  <UIcon name="i-lucide-calendar" class="w-3 h-3" />
                  <span>{{ formatDate(execution.startedAt) }}</span>
                </div>
                <div v-if="execution.stoppedAt" class="flex items-center gap-1.5" title="Duration">
                  <UIcon name="i-lucide-clock" class="w-3 h-3" />
                  <span>{{ calculateDuration(execution.startedAt, execution.stoppedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <div v-else class="mt-12 flex flex-col items-center justify-center text-center">
        <div class="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
          <UIcon name="i-lucide-list" class="w-8 h-8" />
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">No executions found</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Try loading a different workflow ID.</p>
      </div>
    </div>
  </UContainer>
</template>

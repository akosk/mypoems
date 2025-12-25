type N8nExecutionSummary = {
  id?: string
  status?: string
  mode?: string
  startedAt?: string
  stoppedAt?: string
  workflowId?: string
  finished?: boolean
}

const isAdminSession = (event: any) => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase()
  if (!adminEmail) return false
  return getUserSession(event)
    .then(session => session?.user?.email?.toLowerCase() === adminEmail)
    .catch(() => false)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.n8nApiBaseUrl || process.env.N8N_API_BASE_URL
  const apiKey = config.n8nApiKey || process.env.N8N_API_KEY

  if (!baseUrl || !apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing N8N_API_BASE_URL or N8N_API_KEY in runtimeConfig.'
    })
  }

  const isAdmin = await isAdminSession(event)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }

  const query = getQuery(event)
  const workflowId = String(query.workflowId || '').trim()
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100)

  if (!workflowId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing workflowId query param.'
    })
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/executions?workflowId=${encodeURIComponent(workflowId)}&limit=${limit}&includeData=false`

  try {
    const res = await $fetch<any>(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-N8N-API-KEY': apiKey
      }
    })

    const rawList = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.executions)
        ? res.executions
        : Array.isArray(res)
          ? res
          : []

    const executions: N8nExecutionSummary[] = rawList.map((item: any) => ({
      id: item?.id,
      status: item?.status,
      mode: item?.mode,
      startedAt: item?.startedAt || item?.startedAt?.toString?.(),
      stoppedAt: item?.stoppedAt || item?.stoppedAt?.toString?.(),
      workflowId: item?.workflowId,
      finished: item?.finished
    }))

    return { ok: true, executions }
  } catch (e: any) {
    console.error('Error fetching n8n executions:', e)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch n8n executions.',
      data: { message: e?.message ?? String(e) }
    })
  }
})

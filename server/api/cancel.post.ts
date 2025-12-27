import { sql } from '../utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.n8nApiBaseUrl || process.env.N8N_API_BASE_URL
  const apiKey = config.n8nApiKey || process.env.N8N_API_KEY

  if (!baseUrl || !apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing N8N_API_BASE_URL or N8N_API_KEY.'
    })
  }

  const session = await getUserSession(event)
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const executionId = body.executionId

  if (!executionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing executionId' })
  }

  // Cancel in n8n
  try {
    const url = `${baseUrl.replace(/\/$/, '')}/api/v1/executions/${executionId}/cancel`
    await $fetch(url, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey
      }
    })
  } catch (e: any) {
    console.error('Error canceling n8n execution:', e)
    // We proceed to mark as canceled locally even if n8n fails (e.g. already finished)
  }

  // Update local DB
  try {
    await sql`
      UPDATE executions 
      SET status = 'canceled', finished_at = ${new Date()}
      WHERE n8n_execution_id = ${executionId}
    `
  } catch (e) {
    console.error('Error updating DB status:', e)
  }

  return { ok: true }
})

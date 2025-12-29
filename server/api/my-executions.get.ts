import { sql } from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    
    if (!session?.user?.email) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const email = session.user.email.toLowerCase()

    // Find user by email to get ID
    const users = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${email}
    `
    
    if (!users || users.length === 0) {
       return { executions: [] }
    }

    const userId = users[0].id

    const executions = await sql`
      SELECT 
        id, 
        n8n_execution_id, 
        status, 
        started_at, 
        finished_at
      FROM executions 
      WHERE user_id = ${userId}
      ORDER BY started_at DESC
    `

    // Convert to plain objects and format dates to ISO strings to avoid serialization issues
    const safeExecutions = executions.map(e => ({
      id: e.id,
      n8n_execution_id: e.n8n_execution_id,
      status: e.status,
      started_at: e.started_at ? new Date(e.started_at).toISOString() : null,
      finished_at: e.finished_at ? new Date(e.finished_at).toISOString() : null
    }))

    return { executions: safeExecutions }
  } catch (error: any) {
    console.error('Error in my-executions:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { message: error.message }
    })
  }
})
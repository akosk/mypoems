import { sql } from '../utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.email) {
    return { execution: null }
  }

  try {
    const [user] = await sql`SELECT id FROM users WHERE email = ${session.user.email}`
    if (!user) return { execution: null }

    const [execution] = await sql`
      SELECT n8n_execution_id as "executionId", status, started_at
      FROM executions
      WHERE user_id = ${user.id}
      ORDER BY started_at DESC
      LIMIT 1
    `

    return { execution: execution || null }
  } catch (e) {
    console.error('Error fetching last execution:', e)
    return { execution: null }
  }
})

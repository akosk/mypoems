import { sql } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const { executionId, coverImageBase64, bookTitle, authorName } = body || {}

  if (!executionId || !coverImageBase64) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing executionId or coverImageBase64.'
    })
  }

  try {
    const payloadObj: Record<string, string> = { coverImage: coverImageBase64 }
    if (bookTitle) payloadObj.bookTitle = bookTitle
    if (authorName) payloadObj.authorName = authorName

    await sql`
      UPDATE executions
      SET payload = COALESCE(payload, '{}'::jsonb) || ${sql.json(payloadObj)}::jsonb
      WHERE n8n_execution_id = ${executionId}
    `

    return { ok: true }
  } catch (e: any) {
    console.error('Error saving cover:', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save cover image.',
      data: { message: e?.message ?? String(e) }
    })
  }
})

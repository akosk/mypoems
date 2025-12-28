import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL || '')

async function run() {
  console.log('Starting migration: add payment fields to executions table...')
  try {
    await sql`
      ALTER TABLE public.executions 
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS stripe_session_id TEXT
    `
    console.log('Added payment_status and stripe_session_id columns.')

  } catch (e) {
    console.error('Error during migration:', e)
  } finally {
    await sql.end()
    console.log('Migration finished.')
  }
}

run()

import postgres from 'postgres'
import 'dotenv/config'

const sql = postgres(process.env.DATABASE_URL || '')

async function run() {
  console.log('Starting migration: add purchase_options to executions table...')
  try {
    await sql`
      ALTER TABLE public.executions 
      ADD COLUMN IF NOT EXISTS purchase_options JSONB
    `
    console.log('Added purchase_options column.')

  } catch (e) {
    console.error('Error during migration:', e)
  } finally {
    await sql.end()
    console.log('Migration finished.')
  }
}

run()

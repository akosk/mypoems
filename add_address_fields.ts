import postgres from 'postgres'
import 'dotenv/config'

const sql = postgres(process.env.DATABASE_URL || '')

async function run() {
  console.log('Starting migration: add address fields to executions table...')
  try {
    await sql`
      ALTER TABLE public.executions 
      ADD COLUMN IF NOT EXISTS billing_address JSONB,
      ADD COLUMN IF NOT EXISTS shipping_address JSONB,
      ADD COLUMN IF NOT EXISTS purchase_amount INTEGER
    `
    console.log('Added billing_address, shipping_address, and purchase_amount columns.')

  } catch (e) {
    console.error('Error during migration:', e)
  } finally {
    await sql.end()
    console.log('Migration finished.')
  }
}

run()

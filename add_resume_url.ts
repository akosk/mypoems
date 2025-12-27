import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL || '')

async function run() {
  console.log('Starting migration: add resume_url to executions table...')
  try {
    await sql`
      ALTER TABLE public.executions 
      ADD COLUMN IF NOT EXISTS resume_url TEXT
    `
    console.log('Added resume_url column.')

  } catch (e) {
    console.error('Error during migration:', e)
  } finally {
    await sql.end()
    console.log('Migration finished.')
  }
}

run()

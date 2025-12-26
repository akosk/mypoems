import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL || '')

async function run() {
  console.log('Starting migration: add names to users table...')
  try {
    await sql`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT
    `
    console.log('Added first_name and last_name columns.')

  } catch (e) {
    console.error('Error during migration:', e)
  } finally {
    await sql.end()
    console.log('Migration finished.')
  }
}

run()

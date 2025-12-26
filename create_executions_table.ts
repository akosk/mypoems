import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL || '')

async function run() {
  console.log('Starting migration...')
  try {
    // 1. Ensure users table exists
    await sql`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE
      )
    `
    console.log('Verified users table.')

    // 2. Create executions table
    await sql`
      CREATE TABLE IF NOT EXISTS public.executions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.users(id),
        n8n_execution_id TEXT,
        status TEXT DEFAULT 'running',
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        finished_at TIMESTAMP WITH TIME ZONE,
        payload JSONB
      )
    `
    console.log('Verified executions table.')

  } catch (e) {
    console.error('Error during migration:', e)
  } finally {
    await sql.end()
    console.log('Migration finished.')
  }
}

run()
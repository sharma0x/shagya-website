import { Pool } from 'pg'

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
      "id" serial PRIMARY KEY NOT NULL,
      "email" varchar NOT NULL,
      "status" varchar DEFAULT 'subscribed',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_email_idx" ON "newsletter_subscribers" ("email");
  `)

  console.log('Created newsletter_subscribers table')
  await pool.end()
}
run().catch(console.error)

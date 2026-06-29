import { Pool } from 'pg'

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const res = await pool.query(
    'SELECT COALESCE(MAX(batch), 0) + 1 AS next_batch FROM payload_migrations',
  )
  const batch = res.rows[0].next_batch

  await pool.query(
    `
    INSERT INTO payload_migrations (name, batch, updated_at, created_at) 
    VALUES 
      ('20260628_012231_add_email_logs', $1, now(), now()),
      ('20260628_021500_add_newsletter_subscribers', $1, now(), now())
    ON CONFLICT DO NOTHING
  `,
    [batch],
  )

  console.log('Inserted migration records')
  await pool.end()
}
run().catch(console.error)

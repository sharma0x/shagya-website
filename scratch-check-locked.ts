import { Pool } from 'pg'

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const res = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'payload_locked_documents_rels'
  `)
  console.log(
    'Locked columns:',
    res.rows.map((r) => r.column_name),
  )

  await pool.end()
}
run().catch(console.error)

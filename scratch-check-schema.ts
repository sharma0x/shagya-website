import { Pool } from 'pg'

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'email_logs'
  `)
  console.log('Columns:', res.rows)

  await pool.end()
}
run().catch(console.error)

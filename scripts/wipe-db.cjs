const { Pool } = require('pg')

const DATABASE_URL = 'postgresql://neondb_owner:npg_O4HDeTjR8Gza@ep-muddy-boat-ad30isty-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

;(async () => {
  const { rows } = await pool.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`)
  const tables = rows.map(r => r.tablename)
  console.log(`Found ${tables.length} tables:`, tables.join(', '))

  await pool.query('DROP SCHEMA public CASCADE')
  await pool.query('CREATE SCHEMA public')
  console.log('All data wiped. Public schema recreated.')

  await pool.end()
})().catch(e => { console.error(e); process.exit(1) })

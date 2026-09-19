import { Pool } from 'pg'

let pool: Pool | null = null

/**
 * Get shared database connection pool
 * Singleton pattern ensures only one pool instance exists
 */
export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000, // Close idle clients after 30s
      connectionTimeoutMillis: 2000, // Return error after 2s if connection not available
      ssl:
        process.env.DATABASE_URL?.includes('sslmode=require') ||
        process.env.DATABASE_URL?.includes('neon.tech') ||
        process.env.DATABASE_URL?.includes('rds.amazonaws.com')
          ? { rejectUnauthorized: false }
          : undefined,
    })

    pool.on('error', (err) => {
      console.error('[DB Pool] Unexpected error on idle client:', err)
    })

    pool.on('connect', () => {
      console.log('[DB Pool] New client connected')
    })

    pool.on('remove', () => {
      console.log('[DB Pool] Client removed from pool')
    })
  }

  return pool
}

/**
 * Close the database pool
 * Should be called during application shutdown
 */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('[DB Pool] Pool closed')
  }
}

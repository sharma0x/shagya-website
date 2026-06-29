import { Pool } from 'pg'

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await pool.query(
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "newsletter_subscribers_id" integer;`,
    )
    console.log('Added newsletter_subscribers_id to relations')

    await pool.query(
      `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;`,
    )
    console.log('Added foreign key constraint')

    await pool.query(
      `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");`,
    )
    console.log('Added index')
  } catch (e: any) {
    console.log('Failed:', e.message)
  }

  await pool.end()
}
run().catch(console.error)

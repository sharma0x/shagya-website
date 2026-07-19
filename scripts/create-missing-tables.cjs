const { Pool } = require('pg')

const DATABASE_URL = 'postgresql://neondb_owner:npg_O4HDeTjR8Gza@ep-muddy-boat-ad30isty-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

const SQL = `
-- Payload: site_settings_rels (for activeCoupons relationship)
CREATE TABLE IF NOT EXISTS "site_settings_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "coupons_id" integer
);

CREATE INDEX IF NOT EXISTS "site_settings_rels_order_idx" ON "site_settings_rels" ("order");
CREATE INDEX IF NOT EXISTS "site_settings_rels_parent_idx" ON "site_settings_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "site_settings_rels_coupons_idx" ON "site_settings_rels" ("coupons_id");

DO $$ BEGIN
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "site_settings"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "coupons"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payload: _site_settings_v_rels (version table for activeCoupons relationship)
CREATE TABLE IF NOT EXISTS "_site_settings_v_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "coupons_id" integer
);

CREATE INDEX IF NOT EXISTS "_site_settings_v_rels_order_idx" ON "_site_settings_v_rels" ("order");
CREATE INDEX IF NOT EXISTS "_site_settings_v_rels_parent_idx" ON "_site_settings_v_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "_site_settings_v_rels_coupons_idx" ON "_site_settings_v_rels" ("coupons_id");

DO $$ BEGIN
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "_site_settings_v"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "coupons"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Better Auth tables
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "twoFactorEnabled" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "token" text NOT NULL UNIQUE,
  "expiresAt" timestamp NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "accessToken" text,
  "refreshToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "idToken" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "secret" text,
  "backupCodes" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "passkey" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "credentialId" text NOT NULL,
  "publicKey" text NOT NULL,
  "counter" integer NOT NULL DEFAULT 0,
  "deviceType" text NOT NULL,
  "backedUp" boolean NOT NULL DEFAULT false,
  "transports" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "jwks" (
  "id" text PRIMARY KEY NOT NULL,
  "publicKey" text NOT NULL,
  "privateKey" text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
`

;(async () => {
  console.log('Creating missing tables...')
  await pool.query(SQL)
  console.log('All tables created successfully.')
  await pool.end()
})().catch(e => { console.error(e); process.exit(1) })

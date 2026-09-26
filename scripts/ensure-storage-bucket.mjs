#!/usr/bin/env node
/**
 * Ensure the local S3-compatible storage bucket exists and is publicly readable.
 *
 * Replaces the old `minio/mc` sidecar. MinIO's community edition is source-only
 * now and `minio/minio` + `minio/mc` were removed from Docker Hub, so that
 * sidecar could no longer be run. RustFS (the current image) does not
 * auto-create buckets — writes fail with NoSuchBucket until it exists — so we
 * create it here with a SigV4-signed CreateBucket.
 *
 * The public-read policy matters just as much: Payload's `generateFileURL`
 * points media straight at R2_ENDPOINT/R2_BUCKET, so a private bucket makes
 * every CMS image 403 in the browser. RustFS ignores the classic
 * `?acl=public-read` call and honours only a bucket policy, so we PUT one
 * granting anonymous s3:GetObject.
 *
 * Both operations are idempotent, so re-running is safe.
 *
 * Usage: node scripts/ensure-storage-bucket.mjs
 * Config comes from R2_* env vars (see .env).
 */

import crypto from 'node:crypto'
import http from 'node:http'
import https from 'node:https'

const ENDPOINT = process.env.R2_ENDPOINT || 'http://localhost:9000'
const BUCKET = process.env.R2_BUCKET || 'shayga-media'
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID || 'minioadmin'
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY || 'minioadmin'
// RustFS wants a concrete region; R2 uses 'auto'. Default to us-east-1 locally.
const REGION = process.env.R2_REGION && process.env.R2_REGION !== 'auto'
  ? process.env.R2_REGION
  : 'us-east-1'

const url = new URL(ENDPOINT)
const host = url.host
const agent = url.protocol === 'https:' ? https : http

const sha256 = (d) => crypto.createHash('sha256').update(d).digest('hex')
const hmac = (key, d) => crypto.createHmac('sha256', key).update(d).digest()

/** Sign a request with AWS SigV4. `query` is the raw, unsorted query string. */
function sign(method, path, query, body) {
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = sha256(body)

  const canonicalHeaders =
    `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = [
    method,
    path,
    query,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const scope = `${dateStamp}/${REGION}/s3/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join('\n')

  let key = hmac(`AWS4${SECRET_KEY}`, dateStamp)
  key = hmac(key, REGION)
  key = hmac(key, 's3')
  key = hmac(key, 'aws4_request')
  const signature = crypto
    .createHmac('sha256', key)
    .update(stringToSign)
    .digest('hex')

  return {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: query ? `${path}?${query}` : path,
    method,
    headers: {
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'Content-Type': 'application/json',
      // RustFS rejects the request with MissingContentLength without this,
      // which surfaces as a confusing 400.
      'Content-Length': Buffer.byteLength(body),
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${scope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  }
}

function call(label, method, path, query, body) {
  return new Promise((resolve) => {
    const req = agent.request(sign(method, path, query, body), (res) => {
      res.resume()
      res.on('end', () => {
        const ok = res.statusCode >= 200 && res.statusCode < 300
        console.log(`  ${ok ? '✓' : '✗'} ${label}: HTTP ${res.statusCode}`)
        resolve(ok)
      })
    })
    req.on('error', (e) => {
      console.error(`  ✗ ${label}: cannot reach ${ENDPOINT} — ${e.message}`)
      resolve(false)
    })
    if (body) req.write(body)
    req.end()
  })
}

const bucketPath = `/${BUCKET}`
const ok = await call('CreateBucket', 'PUT', bucketPath, '', '')

const policy = JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: { AWS: ['*'] },
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${BUCKET}/*`],
    },
  ],
})

const policyOk = ok
  ? await call('Public-read policy', 'PUT', bucketPath, 'policy=', policy)
  : false

if (!ok || !policyOk) process.exit(1)
console.log(`  ✓ bucket "${BUCKET}" ready and publicly readable at ${ENDPOINT}`)

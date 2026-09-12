import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'
import { processDelhiveryWebhook } from '@/lib/delhivery/webhook-processor'

const SIGNATURE_HEADER = 'x-delhivery-signature'

function signaturesMatch(provided: string, expected: string): boolean {
  const providedDigest = crypto.createHash('sha256').update(provided).digest()
  const expectedDigest = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(providedDigest, expectedDigest)
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  const secret = process.env.DELHIVERY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    )
  }

  const signature = request.headers.get(SIGNATURE_HEADER)
  if (!signature || !signaturesMatch(signature, secret)) {
    return new Response('Invalid webhook signature', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const outcome = await processDelhiveryWebhook(payload, rawBody)
    return NextResponse.json({ ok: true, ...outcome })
  } catch (error: any) {
    console.error('[Delhivery Webhook Error]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { lookupPincode } from '@/lib/india-post'
import { getCached, setCache } from '@/lib/pincode-cache'

const PINCODE_RE = /^[1-9][0-9]{5}$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pincode = body.pincode?.toString().trim()

    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 }
      )
    }

    if (!PINCODE_RE.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode. Must be a 6-digit Indian pincode.' },
        { status: 400 }
      )
    }

    const cacheKey = `pincode:${pincode}`

    const cached = getCached(cacheKey)
    if (cached) {
      return NextResponse.json({ data: cached, cached: true })
    }

    const result = await lookupPincode(pincode)

    if (!result) {
      return NextResponse.json(
        { error: 'Pincode not found. Please check and try again.' },
        { status: 404 }
      )
    }

    setCache(cacheKey, result)

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('Pincode verification failed:', err)
    return NextResponse.json(
      { error: 'Unable to verify pincode. Please try again later.' },
      { status: 500 }
    )
  }
}

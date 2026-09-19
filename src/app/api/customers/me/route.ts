import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { getPhoneIdentityByUserId } from '@/lib/phone-identity'

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const customers = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: session.user.id } },
      limit: 1,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers.docs[0] as unknown as Record<string, unknown>

    // Check for verified phone number from phone_identities (login method)
    // Falls back to customer.phone (editable contact info)
    let phone = customer.phone || ''
    try {
      const phoneIdentity = await getPhoneIdentityByUserId(session.user.id)
      if (phoneIdentity?.phoneNumber) {
        phone = phoneIdentity.phoneNumber
      }
    } catch (err) {
      console.error('[customers/me] Failed to get phone identity:', err)
      // Continue with customer.phone fallback
    }

    return NextResponse.json({
      name: customer.name || '',
      email: customer.email || session.user.email || '',
      phone,
    })
  } catch (err) {
    console.error('[customers/me] GET error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone } = body

    const payload = await getPayload({ config })

    const customers = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: session.user.id } },
      limit: 1,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    await payload.update({
      collection: 'customers',
      id: customers.docs[0].id,
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      overrideAccess: true,
    } as any)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[customers/me] PATCH error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

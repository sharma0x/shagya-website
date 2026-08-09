import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { isSameAddress, deduplicateAddresses } from '@/lib/address-utils'

/**
 * GET /api/addresses
 * Fetch all addresses for the logged-in customer.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Find customer
    const customers = await payload.find({
      collection: 'customers',
      where: {
        betterAuthUserId: { equals: session.user.id },
      },
      limit: 1,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers.docs[0]

    // Fetch addresses
    const addresses = await payload.find({
      collection: 'addresses',
      where: {
        customer: { equals: customer.id },
      },
      sort: '-isDefault', // defaults first
      limit: 100,
    })

    const uniqueAddresses = deduplicateAddresses(addresses.docs as any[])

    return NextResponse.json({ addresses: uniqueAddresses })
  } catch (error: any) {
    console.error('[API] GET /api/addresses error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/addresses
 * Create a new address for the logged-in customer.
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = body

    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Find customer
    const customers = await payload.find({
      collection: 'customers',
      where: {
        betterAuthUserId: { equals: session.user.id },
      },
      limit: 1,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers.docs[0]

    // Check if customer already has this exact address saved
    const existing = await payload.find({
      collection: 'addresses',
      where: {
        customer: { equals: customer.id },
      },
      limit: 100,
    })

    const newAddrData = {
      fullName,
      phone,
      line1,
      line2: line2 || '',
      city,
      state,
      pincode,
      country: country || 'India',
    }

    const existingMatch = existing.docs.find((doc: any) =>
      isSameAddress(doc, newAddrData),
    )

    // If setting as default, unset other defaults
    if (isDefault) {
      const existingDefaults = await payload.find({
        collection: 'addresses',
        where: {
          customer: { equals: customer.id },
          isDefault: { equals: true },
        },
      })

      for (const doc of existingDefaults.docs) {
        await payload.update({
          collection: 'addresses',
          id: doc.id,
          data: { isDefault: false },
        })
      }
    }

    if (existingMatch) {
      // Address already exists — update default status if requested, but do not create duplicate
      let address = existingMatch
      if (isDefault && !existingMatch.isDefault) {
        address = await payload.update({
          collection: 'addresses',
          id: existingMatch.id,
          data: { isDefault: true },
        })
      }
      return NextResponse.json({ address })
    }

    // Create new address
    const newAddress = await payload.create({
      collection: 'addresses',
      data: {
        customer: customer.id,
        ...newAddrData,
        isDefault: !!isDefault,
      },
    })

    return NextResponse.json({ address: newAddress })
  } catch (error: any) {
    console.error('[API] POST /api/addresses error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}

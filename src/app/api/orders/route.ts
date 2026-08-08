import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

/**
 * GET /api/orders
 * Returns all orders for the authenticated customer.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Find the customer doc
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

    // Find orders for this customer by email
    const orders = await payload.find({
      collection: 'orders',
      depth: 2,
      where: {
        customerEmail: { equals: customer.email },
      },
      sort: '-createdAt', // newest first
    })

    return NextResponse.json({ orders: orders.docs })
  } catch (error: any) {
    console.error('[API] GET /api/orders error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

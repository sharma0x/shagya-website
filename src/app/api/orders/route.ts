import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { findOrRepairCustomer } from '@/lib/auth-sync'

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

    // Find the customer doc (repairing it first if missing)
    const customer = await findOrRepairCustomer(session.user.id)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customerEmail = customer.email as string

    // A phone user may later set a real email via their profile, but orders
    // placed under the verified fallback email (@phone.shayga.in) are stored
    // with the session email. Query both so order history stays complete.
    const sessionEmail = session.user.email || ''
    const orderEmails = Array.from(
      new Set([customerEmail, sessionEmail].filter(Boolean)),
    )

    // Find orders for this customer by email
    const orders = await payload.find({
      collection: 'orders',
      depth: 2,
      where: {
        customerEmail: { in: orderEmails },
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

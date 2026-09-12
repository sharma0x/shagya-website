import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { generateOrderReceiptPdf, type ReceiptOrder } from '@/lib/receipt'

export const dynamic = 'force-dynamic'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * GET /api/orders/receipt?orderNumber=ORD-00001[&email=customer@example.com]
 *
 * Returns the order receipt as a downloadable PDF.
 *
 * Ownership rules:
 *  - Authenticated customers must own the order (customer email matches).
 *  - Guests must prove ownership by supplying the email used at checkout.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')?.trim()
    const guestEmail = searchParams.get('email')?.trim()

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'orderNumber is required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })
    const session = await auth.api.getSession({ headers: request.headers })

    let ownerEmail: string | null = null

    if (session?.user) {
      const customers = await payload.find({
        collection: 'customers',
        where: {
          betterAuthUserId: { equals: session.user.id },
        },
        limit: 1,
      })

      if (customers.docs.length === 0) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 403 },
        )
      }

      ownerEmail = normalizeEmail(customers.docs[0].email as string)
    } else if (guestEmail) {
      ownerEmail = normalizeEmail(guestEmail)
    } else {
      return NextResponse.json(
        {
          error:
            'Login or provide the email used at checkout to download this receipt',
        },
        { status: 403 },
      )
    }

    const result = await payload.find({
      collection: 'orders',
      where: { orderNumber: { equals: orderNumber } },
      depth: 1,
      limit: 1,
    })

    const order = result.docs[0] as unknown as ReceiptOrder | undefined

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (normalizeEmail(order.customerEmail ?? '') !== ownerEmail) {
      return NextResponse.json(
        { error: 'You are not authorized to download this receipt' },
        { status: 403 },
      )
    }

    const pdf = await generateOrderReceiptPdf(order)

    const body = pdf.buffer.slice(
      pdf.byteOffset,
      pdf.byteOffset + pdf.byteLength,
    ) as ArrayBuffer

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Shayga-${orderNumber}-receipt.pdf"`,
        'Content-Length': String(pdf.byteLength),
      },
    })
  } catch (error: any) {
    console.error('[API] GET /api/orders/receipt error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

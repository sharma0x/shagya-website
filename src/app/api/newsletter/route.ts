import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * POST /api/newsletter
 *
 * Subscribe an email to the newsletter.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Valid email is required.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Check if the user is already subscribed
    const existing = await payload.find({
      collection: 'newsletter-subscribers',
      where: {
        email: { equals: email },
      },
    })

    if (existing.totalDocs > 0) {
      const subscriber = existing.docs[0]
      if (subscriber.status === 'unsubscribed') {
        // Resubscribe them
        await payload.update({
          collection: 'newsletter-subscribers',
          id: subscriber.id,
          data: {
            status: 'subscribed',
          },
        })
      }
      return NextResponse.json(
        { message: 'You are now subscribed to the newsletter.' },
        { status: 200 },
      )
    }

    // Add new subscriber
    await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        email,
        status: 'subscribed',
      },
    })

    return NextResponse.json(
      { message: 'Successfully subscribed to the newsletter.' },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[API] POST /api/newsletter error:', error)

    if (error?.data && error.data.errors && error.data.errors[0]?.message) {
      return NextResponse.json(
        { message: error.data.errors[0].message },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { message: 'Unable to subscribe right now. Please try again.' },
      { status: 500 },
    )
  }
}

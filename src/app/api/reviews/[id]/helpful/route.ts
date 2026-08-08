import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({ headers: request.headers })

    const voterEmail = session?.user?.email ?? null

    if (!voterEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const review = await payload.findByID({
      collection: 'reviews',
      id,
      overrideAccess: true,
    })

    const helpfulUserEmails: string[] = Array.isArray(review.helpfulUserEmails)
      ? (review.helpfulUserEmails as unknown[]).map(String)
      : []
    const alreadyVoted = helpfulUserEmails.includes(voterEmail)

    let helpfulCount = (review.helpfulCount as number) || 0

    if (alreadyVoted) {
      helpfulCount = Math.max(0, helpfulCount - 1)
      await payload.update({
        collection: 'reviews',
        id,
        data: {
          helpfulCount,
          helpfulUserEmails: helpfulUserEmails.filter(
            (e: string) => e !== voterEmail,
          ),
        },
      })
    } else {
      helpfulCount = helpfulCount + 1
      await payload.update({
        collection: 'reviews',
        id,
        data: {
          helpfulCount,
          helpfulUserEmails: [...helpfulUserEmails, voterEmail],
        },
      })
    }

    return NextResponse.json({
      helpfulCount,
      userVoted: !alreadyVoted,
    })
  } catch (error) {
    console.error('[API] POST /api/reviews/[id]/helpful error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

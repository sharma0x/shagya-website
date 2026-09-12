import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const CONTACT_SLUG = 'contact'

/**
 * Finds the Contact form by slug, creating a default one if it is missing so
 * submissions keep working even before an editor configures a form.
 */
async function resolveContactForm(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<number> {
  const existing = await payload.find({
    collection: 'forms',
    where: { slug: { equals: CONTACT_SLUG } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const created = await payload.create({
    collection: 'forms',
    overrideAccess: true,
    data: {
      title: 'Contact',
      slug: CONTACT_SLUG,
      submitButtonText: 'Send Message',
      successMessage: 'Thank you for your message!',
      fields: [
        { label: 'Full Name', name: 'name', type: 'text', required: true },
        {
          label: 'Email Address',
          name: 'email',
          type: 'email',
          required: true,
        },
        { label: 'Message', name: 'message', type: 'textarea', required: true },
      ],
    },
  })
  return created.id
}

/**
 * POST /api/forms/submit
 * Handles public form submissions for the Form Builder.
 */
export async function POST(request: Request) {
  try {
    const { formId, data, honeypot, notRobot } = await request.json()

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Submission data is required' },
        { status: 400 },
      )
    }

    // Honeypot spam protection
    if (honeypot && String(honeypot).trim().length > 0) {
      // Quietly return success to spam bots without doing anything
      return NextResponse.json({
        success: true,
        message: 'Spam filtered successfully.',
      })
    }

    // "I am not a robot" check
    if (notRobot !== true) {
      return NextResponse.json(
        { error: 'Please confirm you are not a robot.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Resolve the target form. When the client only knows a placeholder id
    // (e.g. no form configured yet), fall back to the Contact form.
    let resolvedFormId: number
    const numericFormId = Number(formId)
    if (formId && Number.isInteger(numericFormId)) {
      try {
        await payload.findByID({
          collection: 'forms',
          id: numericFormId,
          overrideAccess: true,
        })
        resolvedFormId = numericFormId
      } catch {
        resolvedFormId = await resolveContactForm(payload)
      }
    } else {
      resolvedFormId = await resolveContactForm(payload)
    }

    // Save submission
    const submission = await payload.create({
      collection: 'form-submissions',
      overrideAccess: true,
      data: {
        form: resolvedFormId,
        data,
        honeypot: honeypot || '',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your submission!',
      submissionId: submission.id,
    })
  } catch (error: any) {
    console.error('[API] Form Submission Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}

import type { CollectionConfig } from 'payload'
import { sendEmail } from '@/lib/email'
import { getAdminEmails } from '@/email/send'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'form',
    group: 'Content',
  },
  access: {
    // Only authenticated admin users can read submissions
    read: ({ req: { user } }) => Boolean(user),
    // Public — anyone can submit a form
    create: () => true,
    // Only authenticated users can update
    update: ({ req: { user } }) => Boolean(user),
    // Only authenticated users can delete
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only send notification on new submissions
        if (operation !== 'create') return doc

        const submission = doc as Record<string, unknown>

        // Check honeypot — if filled, it's likely spam, skip notification
        const honeypot = submission.honeypot as string | undefined
        if (honeypot && honeypot.trim().length > 0) {
          return doc
        }

        // Look up the form to get the notification email
        const rawForm = submission.form as unknown
        let formId: string | number | null = null
        if (typeof rawForm === 'object' && rawForm !== null) {
          const record = rawForm as { id?: unknown; value?: unknown }
          if (typeof record.id === 'string' || typeof record.id === 'number') {
            formId = record.id
          } else if (
            typeof record.value === 'string' ||
            typeof record.value === 'number'
          ) {
            formId = record.value
          }
        } else if (typeof rawForm === 'string' || typeof rawForm === 'number') {
          formId = rawForm
        }
        if (formId == null) return doc

        try {
          const form = await req.payload.findByID({
            collection: 'forms',
            id: formId,
          } as any)

          const formDoc = form as unknown as Record<string, unknown> | undefined
          const formEmailTo = formDoc?.emailTo as string | undefined

          // Notify every address configured in Site Settings (Admin
          // Notification Emails), falling back to the form's own emailTo.
          const adminEmails = await getAdminEmails(req.payload)
          const recipients = [
            ...new Set(
              [...adminEmails, formEmailTo].filter(
                (email): email is string =>
                  typeof email === 'string' && email.trim().length > 0,
              ),
            ),
          ]

          if (recipients.length === 0) return doc

          // Build a human-readable summary of submission data
          const submissionData = submission.data as
            | Record<string, unknown>
            | undefined
          const dataSummary = submissionData
            ? Object.entries(submissionData)
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join('<br>')
            : 'No data provided'

          const formTitle =
            (formDoc?.title as string) || (formDoc?.slug as string) || 'Form'

          await Promise.allSettled(
            recipients.map((to) =>
              sendEmail({
                to,
                subject: `New submission: ${formTitle}`,
                html: `
                <h2>New Form Submission</h2>
                <p><strong>Form:</strong> ${formTitle}</p>
                <hr>
                ${dataSummary}
                <hr>
                <p style="color: #888; font-size: 12px;">
                  Submitted at: ${new Date().toISOString()}
                </p>
              `,
              }),
            ),
          )
        } catch (err) {
          req.payload.logger.error(
            `[form-submissions.afterChange] Failed to send email: ${String(err)}`,
          )
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms' as any,
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      label: 'Submission Data',
    },
    {
      name: 'honeypot',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
  ],
  timestamps: true,
}

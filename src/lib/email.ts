import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_test_dummy')

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (
    !process.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY === 're_test_dummy'
  ) {
    console.log(`[Email] Would send to ${to}: ${subject}`)
    return { success: true, messageId: 'dev-mode' }
  }

  const { data, error } = await resend.emails.send({
    from: 'Shagya <noreply@shagya.com>',
    to,
    subject,
    html,
  })

  if (error) throw error

  return { success: true, messageId: data?.id }
}

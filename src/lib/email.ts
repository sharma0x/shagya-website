import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_test_dummy')

function createMailpitTransport() {
  return nodemailer.createTransport({
    host: process.env.MAILPIT_SMTP_HOST!,
    port: Number(process.env.MAILPIT_SMTP_PORT!),
    secure: false,
    ignoreTLS: true,
  })
}

const isProduction = process.env.NODE_ENV === 'production'

// Staging runs with NODE_ENV=production, so the `!isProduction` check alone
// would send real mail through Resend. EMAIL_TRANSPORT=mailpit forces SMTP
// delivery regardless, which keeps staging from emailing real customers and
// makes the mail flow inspectable in the Mailpit UI. Unset in production, so
// main is unaffected.
const useMailpit =
  process.env.EMAIL_TRANSPORT === 'mailpit' ||
  (!isProduction && !!process.env.MAILPIT_SMTP_HOST)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const fromName = process.env.EMAIL_FROM_NAME || 'Shayga'
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@shayga.in'
  const from = `${fromName} <${fromAddress}>`

  if (useMailpit && process.env.MAILPIT_SMTP_HOST) {
    const transport = createMailpitTransport()
    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    })
    console.log(
      `[Mailpit] Sent to ${to}: ${subject} (messageId: ${info.messageId})`,
    )
    return { success: true, messageId: info.messageId }
  }

  if (
    !process.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY === 're_test_dummy'
  ) {
    console.log(`[Email] Would send to ${to}: ${subject}`)
    return { success: true, messageId: 'dev-mode' }
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  })

  if (error) throw error

  return { success: true, messageId: data?.id }
}

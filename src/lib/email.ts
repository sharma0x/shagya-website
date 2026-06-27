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

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (process.env.MAILPIT_SMTP_HOST) {
    const transport = createMailpitTransport()
    const info = await transport.sendMail({
      from: 'Shayga <noreply@shayga.com>',
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
    from: 'Shayga <noreply@shayga.com>',
    to,
    subject,
    html,
  })

  if (error) throw error

  return { success: true, messageId: data?.id }
}

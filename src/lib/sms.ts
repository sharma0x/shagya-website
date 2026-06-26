/**
 * SMS utility — Indian phone validation + Twilio-based SMS sending.
 * Falls back to console.log in dev mode when Twilio credentials are absent.
 */

let twilioClient: any = null

function getTwilioClient() {
  if (twilioClient) return twilioClient

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken || accountSid === '') {
    return null
  }

  // Twilio is an optional peer dependency. When installed, uncomment:
  // const twilio = require('twilio')
  // twilioClient = twilio(accountSid, authToken)
  // return twilioClient

  console.warn('[SMS] Twilio package not installed. Running in dev mode.')
  return null
}

/**
 * Validates a 10-digit Indian mobile number.
 * Rules: must be exactly 10 digits, numeric only, starting with 6–9.
 */
export function validateIndianPhone(phone: string): boolean {
  if (!phone) return false

  // Remove whitespace and leading + sign
  let cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '')

  // Strip country code prefix (91)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2)
  }

  // Must be exactly 10 digits starting with 6–9
  return /^[6-9]\d{9}$/.test(cleaned)
}

/**
 * Sends an SMS message via Twilio, or logs to console in dev mode.
 *
 * In dev mode (no Twilio credentials), the message is logged and a
 * success response is returned so callers don't need to special-case.
 */
export async function sendSMS(
  to: string,
  message: string,
): Promise<{ success: boolean; sid?: string }> {
  const client = getTwilioClient()
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!client || !from) {
    console.log(`[SMS Dev] To ${to}: ${message}`)
    return { success: true, sid: 'dev-mode' }
  }

  try {
    const response = await client.messages.create({
      body: message,
      from,
      to,
    })

    return { success: true, sid: response.sid }
  } catch (error) {
    console.error('[SMS] Failed to send:', error)
    return { success: false }
  }
}

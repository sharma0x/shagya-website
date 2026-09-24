export const PHONE_LINKED_TO_ANOTHER_ACCOUNT =
  'This phone number is already linked to another account. Please log in with that account or use a different number.'

export function normalizePhoneNumber(phone: string): string {
  const normalized = phone.replace(/[^\d+]/g, '')

  if (!normalized.startsWith('+')) {
    throw new Error('Phone number must start with + and country code')
  }

  return normalized
}

export function isValidE164PhoneNumber(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone)
}

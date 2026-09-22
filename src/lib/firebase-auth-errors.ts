type PhoneAuthOperation = 'send' | 'verify'

const PHONE_AUTH_ERROR_MESSAGES: Record<
  PhoneAuthOperation,
  Record<string, string>
> = {
  send: {
    'auth/captcha-check-failed':
      "We couldn't verify your request. Please try again.",
    'auth/invalid-recaptcha-token':
      'reCAPTCHA verification failed. Please ensure the domain is authorized and try again.',
    'auth/invalid-phone-number': 'Enter a valid mobile number and try again.',
    'auth/network-request-failed':
      'Check your internet connection and try again.',
    'auth/operation-not-allowed':
      'Phone sign-in is temporarily unavailable. Please use email or try again later.',
    'auth/quota-exceeded':
      'We cannot send a verification code right now. Please try again later.',
    'auth/too-many-requests':
      'Too many attempts. Please wait a few minutes and try again.',
  },
  verify: {
    'auth/code-expired': 'This code has expired. Request a new one.',
    'auth/invalid-verification-code': 'The code you entered is incorrect.',
    'auth/network-request-failed':
      'Check your internet connection and try again.',
    'auth/session-expired': 'This code has expired. Request a new one.',
    'auth/too-many-requests':
      'Too many attempts. Please wait a few minutes and try again.',
  },
}

const DEFAULT_MESSAGES: Record<PhoneAuthOperation, string> = {
  send: "We couldn't send a verification code. Please try again.",
  verify: "We couldn't verify that code. Please try again.",
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined
  }

  return typeof error.code === 'string' ? error.code : undefined
}

export function phoneAuthErrorMessage(
  error: unknown,
  operation: PhoneAuthOperation,
): string {
  const code = errorCode(error)

  return (
    (code && PHONE_AUTH_ERROR_MESSAGES[operation][code]) ||
    DEFAULT_MESSAGES[operation]
  )
}

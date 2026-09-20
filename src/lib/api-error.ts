/**
 * Convert an unexpected server error into a safe, user-facing message.
 *
 * Internal DB/adapter errors (Payload's "Failed query: ...") contain SQL and
 * schema details that must never reach the client. The full error is logged
 * server-side; only a friendly generic message is surfaced when the original
 * message looks like an internal failure.
 */
export function toUserFacingError(error: unknown): string {
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : ''

  const generic =
    'Something went wrong while processing your request. Please try again.'

  const looksInternal =
    /Failed query/i.test(message) ||
    /(?:insert into|update\s+\w+\s+set|delete from)\b/i.test(message) ||
    /constraint|not-null|violates|duplicate key|null value in column/i.test(
      message,
    ) ||
    /ECONNREFUSED|connection\s+(?:refused|timed out|reset)/i.test(message)

  if (looksInternal) {
    return generic
  }

  return message || generic
}

export interface AddressFields {
  fullName?: string | null
  phone?: string | null
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  country?: string | null
}

function normalize(str?: string | null): string {
  return (str || '').trim().toLowerCase()
}

/**
 * Checks if two address objects represent the exact same physical address and recipient.
 */
export function isSameAddress(a: AddressFields, b: AddressFields): boolean {
  return (
    normalize(a.fullName) === normalize(b.fullName) &&
    normalize(a.phone) === normalize(b.phone) &&
    normalize(a.line1) === normalize(b.line1) &&
    normalize(a.line2) === normalize(b.line2) &&
    normalize(a.city) === normalize(b.city) &&
    normalize(a.state) === normalize(b.state) &&
    normalize(a.pincode) === normalize(b.pincode) &&
    normalize(a.country || 'India') === normalize(b.country || 'India')
  )
}

/**
 * Deduplicates an array of address objects, preserving order and default status.
 */
export function deduplicateAddresses<
  T extends AddressFields & {
    id?: string | number
    isDefault?: boolean | null
  },
>(addresses: T[]): T[] {
  const result: T[] = []

  for (const addr of addresses) {
    const existingIndex = result.findIndex((existing) =>
      isSameAddress(existing, addr),
    )
    if (existingIndex === -1) {
      result.push(addr)
    } else {
      // If the duplicate has isDefault true, preserve the default flag on the kept address
      if (addr.isDefault && !result[existingIndex].isDefault) {
        result[existingIndex] = { ...addr }
      }
    }
  }

  return result
}

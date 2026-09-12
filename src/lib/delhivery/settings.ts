import type { Payload } from 'payload'
import { getDelhiveryConfig, type DelhiveryConfig } from './config'

/**
 * Returns the Delhivery config for a request. The operational identity
 * fields (pickup location, seller info, client name) are read from
 * Site Settings → Delhivery Shipping so an admin can tweak them without a
 * redeploy. The API token, mode and webhook secret always come from the
 * environment (secrets are never stored in the CMS).
 */
export async function getDelhiverySettings(
  payload: Payload,
): Promise<DelhiveryConfig> {
  const base = getDelhiveryConfig()

  try {
    const settings = (await payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: true,
      depth: 0,
    })) as unknown as {
      delhivery?: Record<string, unknown>
    }

    const d = settings?.delhivery
    const pick = (key: string) =>
      typeof d?.[key] === 'string' ? (d[key] as string).trim() : ''

    return {
      ...base,
      pickupLocation: pick('pickupLocation'),
      pickupPin: pick('pickupPin'),
      clientName: pick('clientName'),
      sellerName: pick('sellerName'),
      sellerAddress: pick('sellerAddress'),
      sellerPhone: pick('sellerPhone'),
      sellerEmail: pick('sellerEmail'),
    }
  } catch {
    return {
      ...base,
      pickupLocation: '',
      pickupPin: '',
      clientName: '',
      sellerName: '',
      sellerAddress: '',
      sellerPhone: '',
      sellerEmail: '',
    }
  }
}

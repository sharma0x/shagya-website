import type { DelhiveryMode } from './types'

export interface DelhiveryConfig {
  mode: DelhiveryMode
  baseUrl: string
  apiToken: string
  pickupLocation: string
  pickupPin: string
  clientName: string
  sellerName: string
  sellerAddress: string
  sellerPhone: string
  sellerEmail: string
  webhookSecret: string
}

const BASE_URLS: Record<DelhiveryMode, string> = {
  test: 'https://staging-express.delhivery.com',
  prod: 'https://track.delhivery.com',
}

export function getDelhiveryConfig(): DelhiveryConfig {
  const apiToken = process.env.DELHIVERY_API_TOKEN ?? ''
  if (!apiToken) {
    throw new Error('DELHIVERY_API_TOKEN is not configured')
  }

  const mode: DelhiveryMode =
    process.env.DELHIVERY_MODE === 'prod' ? 'prod' : 'test'

  // Operational identity fields (pickup location, seller info) are managed in
  // the CMS (Site Settings → Delhivery Shipping), never env vars. Only the
  // token, mode, base URL and webhook secret come from the environment.
  return {
    mode,
    baseUrl: BASE_URLS[mode],
    apiToken,
    pickupLocation: '',
    pickupPin: '',
    clientName: '',
    sellerName: '',
    sellerAddress: '',
    sellerPhone: '',
    sellerEmail: '',
    webhookSecret: process.env.DELHIVERY_WEBHOOK_SECRET ?? '',
  }
}

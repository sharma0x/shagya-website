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

  return {
    mode,
    baseUrl: BASE_URLS[mode],
    apiToken,
    pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION ?? 'SHAYGA B2C',
    pickupPin: process.env.DELHIVERY_PICKUP_PIN ?? '400068',
    clientName: process.env.DELHIVERY_CLIENT_NAME ?? 'SHAYGA B2C',
    sellerName: process.env.DELHIVERY_SELLER_NAME ?? 'Shayga',
    sellerAddress: process.env.DELHIVERY_SELLER_ADDRESS ?? '',
    sellerPhone: process.env.DELHIVERY_SELLER_PHONE ?? '',
    sellerEmail: process.env.DELHIVERY_SELLER_EMAIL ?? '',
    webhookSecret: process.env.DELHIVERY_WEBHOOK_SECRET ?? '',
  }
}

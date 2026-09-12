import { describe, it, expect, vi } from 'vitest'
import { getDelhiverySettings } from '../settings'

vi.mock('../config', () => ({
  getDelhiveryConfig: () => ({
    mode: 'test',
    baseUrl: 'https://staging-express.delhivery.com',
    apiToken: 'token',
    pickupLocation: '',
    pickupPin: '',
    clientName: '',
    sellerName: '',
    sellerAddress: '',
    sellerPhone: '',
    sellerEmail: '',
    webhookSecret: 'secret',
  }),
}))

describe('getDelhiverySettings', () => {
  it('reads operational fields from Site Settings', async () => {
    const payload = {
      findGlobal: vi.fn().mockResolvedValue({
        delhivery: {
          pickupLocation: 'SHAYGA B2C',
          pickupPin: '400068',
          clientName: 'SHAYGA B2C',
          sellerName: 'Shayga',
          sellerAddress: 'Dahisar West, Mumbai 400068',
          sellerPhone: '9065665511',
          sellerEmail: 'shayga.thesareestudio@gmail.com',
        },
      }),
    } as any

    const config = await getDelhiverySettings(payload)
    expect(config.pickupLocation).toBe('SHAYGA B2C')
    expect(config.pickupPin).toBe('400068')
    expect(config.sellerName).toBe('Shayga')
    expect(config.sellerEmail).toBe('shayga.thesareestudio@gmail.com')
    // Secrets still come from the env-based base config
    expect(config.apiToken).toBe('token')
    expect(config.webhookSecret).toBe('secret')
  })

  it('keeps empty operational fields when the CMS group is absent', async () => {
    const payload = {
      findGlobal: vi.fn().mockResolvedValue({}),
    } as any

    const config = await getDelhiverySettings(payload)
    expect(config.pickupLocation).toBe('')
    expect(config.sellerName).toBe('')
  })

  it('falls back to the base config when the CMS read fails', async () => {
    const payload = {
      findGlobal: vi.fn().mockRejectedValue(new Error('boom')),
    } as any

    const config = await getDelhiverySettings(payload)
    expect(config.apiToken).toBe('token')
    expect(config.pickupLocation).toBe('')
  })
})

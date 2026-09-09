import { describe, it, expect, vi, beforeEach } from 'vitest'

// @vitest-environment node

import {
  buildShipmentRequest,
  shipOrderWithDelhivery,
  type ShipOrderInput,
} from '../ship-order'
import type { DelhiveryConfig } from '../config'

const mockFetchWaybill = vi.fn()
const mockCreateShipment = vi.fn()

vi.mock('../shipping', () => ({
  fetchWaybill: (...args: unknown[]) => mockFetchWaybill(...args),
  createShipment: (...args: unknown[]) => mockCreateShipment(...args),
}))

vi.mock('../config', () => ({
  getDelhiveryConfig: (): DelhiveryConfig => ({
    mode: 'test',
    baseUrl: 'https://staging-express.delhivery.com',
    apiToken: 'token',
    pickupLocation: 'SHAYGA B2C',
    pickupPin: '400068',
    clientName: 'SHAYGA B2C',
    sellerName: 'Shayga',
    sellerAddress: 'Dahisar West, Mumbai 400068',
    sellerPhone: '9065665511',
    sellerEmail: 'shayga.thesareestudio@gmail.com',
    webhookSecret: 'secret',
  }),
}))

const config = {
  mode: 'test',
  baseUrl: 'https://staging-express.delhivery.com',
  apiToken: 'token',
  pickupLocation: 'SHAYGA B2C',
  pickupPin: '400068',
  clientName: 'SHAYGA B2C',
  sellerName: 'Shayga',
  sellerAddress: 'Dahisar West, Mumbai 400068',
  sellerPhone: '9065665511',
  sellerEmail: 'shayga.thesareestudio@gmail.com',
  webhookSecret: 'secret',
} as DelhiveryConfig

function baseOrder(overrides: Partial<ShipOrderInput> = {}): ShipOrderInput {
  return {
    id: 'order-1',
    orderNumber: 'ORD-00001',
    status: 'confirmed',
    paymentId: 'pay_123',
    total: 4999,
    shippingAddress: {
      fullName: 'Archana Vaknalli',
      phone: '9065665511',
      line1: 'Prime Elegance',
      line2: '13th Floor, YR Tawade Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400068',
      country: 'India',
    },
    items: [{ product: { name: 'Banarasi Silk Saree' }, quantity: 2 }],
    ...overrides,
  }
}

function mockPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    findByID: vi.fn().mockResolvedValue(baseOrder()),
    update: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
    logger: { error: vi.fn() },
    ...overrides,
  } as any
}

describe('buildShipmentRequest', () => {
  it('maps order into a Delhivery shipment payload', () => {
    const shipment = buildShipmentRequest(baseOrder(), '70351234567', config)

    expect(shipment).toMatchObject({
      name: 'Archana Vaknalli',
      order: 'ORD-00001',
      phone: '9065665511',
      add: 'Prime Elegance 13th Floor, YR Tawade Road',
      pin: '400068',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      payment_mode: 'Prepaid',
      pickup_location: 'SHAYGA B2C',
      quantity: 2,
      weight: 1000,
      total_amount: 4999,
      waybill: '70351234567',
      cod_amount: 0,
      return_pin: '400068',
    })
  })

  it('describes products with quantity', () => {
    const shipment = buildShipmentRequest(baseOrder(), 'WBN', config)
    expect(shipment.products_desc).toBe('Banarasi Silk Saree x2')
  })

  it('falls back to Item for missing product names', () => {
    const order = baseOrder({ items: [{ product: null, quantity: 1 }] })
    const shipment = buildShipmentRequest(order, 'WBN', config)
    expect(shipment.products_desc).toBe('Item x1')
  })
})

describe('shipOrderWithDelhivery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ships a confirmed prepaid order and stores waybill + tracking', async () => {
    mockFetchWaybill.mockResolvedValueOnce(['70351234567'])
    mockCreateShipment.mockResolvedValueOnce({
      packages_queued: true,
      shipments: [{ waybill: '70351234567' }],
    })

    const payload = mockPayload()
    const result = await shipOrderWithDelhivery(payload, 'order-1')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.waybill).toBe('70351234567')

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        id: 'order-1',
        data: expect.objectContaining({
          status: 'shipped',
          trackingId: '70351234567',
          trackingUrl: 'https://www.delhivery.com/track/package/70351234567',
          delhivery: expect.objectContaining({
            waybill: '70351234567',
            status: 'Manifested',
            shippedViaDelhivery: true,
          }),
        }),
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'event-logs',
        data: expect.objectContaining({
          event: 'order.shipped_via_delhivery',
        }),
        overrideAccess: true,
      }),
    )
  })

  it('rejects COD orders', async () => {
    const payload = mockPayload({
      findByID: vi
        .fn()
        .mockResolvedValue(
          baseOrder({ paymentId: 'COD', status: 'confirmed' }),
        ),
    })
    const result = await shipOrderWithDelhivery(payload, 'order-1')

    expect(result).toMatchObject({
      ok: false,
      status: 400,
      reason: expect.stringContaining('prepaid'),
    })
    expect(mockFetchWaybill).not.toHaveBeenCalled()
  })

  it('rejects non-confirmed orders', async () => {
    const payload = mockPayload({
      findByID: vi.fn().mockResolvedValue(baseOrder({ status: 'pending' })),
    })
    const result = await shipOrderWithDelhivery(payload, 'order-1')

    expect(result).toMatchObject({
      ok: false,
      status: 400,
      reason: expect.stringContaining('confirmed'),
    })
  })

  it('rejects high-value orders without ewaybill support', async () => {
    const payload = mockPayload({
      findByID: vi.fn().mockResolvedValue(baseOrder({ total: 60000 })),
    })
    const result = await shipOrderWithDelhivery(payload, 'order-1')

    expect(result).toMatchObject({
      ok: false,
      reason: expect.stringContaining('Ewaybill'),
    })
  })

  it('rejects orders that already have a waybill', async () => {
    const payload = mockPayload({
      findByID: vi
        .fn()
        .mockResolvedValue(baseOrder({ delhivery: { waybill: 'OLD-WBN' } })),
    })
    const result = await shipOrderWithDelhivery(payload, 'order-1')

    expect(result).toMatchObject({ ok: false, status: 400 })
  })

  it('logs failure and leaves order unchanged when manifest fails', async () => {
    mockFetchWaybill.mockResolvedValueOnce(['70351234567'])
    mockCreateShipment.mockRejectedValueOnce(new Error('Delhivery rejected'))

    const payload = mockPayload()
    const result = await shipOrderWithDelhivery(payload, 'order-1')

    expect(result.ok).toBe(false)
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'event-logs',
        data: expect.objectContaining({ event: 'delhivery.ship_failed' }),
        overrideAccess: true,
      }),
    )
  })
})

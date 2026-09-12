import { describe, it, expect, vi, beforeEach } from 'vitest'

// @vitest-environment node

import {
  createShipment,
  fetchWaybill,
  pincodeServiceability,
} from '../shipping'
import type { ShipmentRequest } from '../types'

const mockDelhiveryFetch = vi.fn()

vi.mock('../client', () => ({
  delhiveryFetch: (...args: unknown[]) => mockDelhiveryFetch(...args),
}))

describe('shipping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('pincodeServiceability', () => {
    it('calls pin-codes endpoint with joined pincodes', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({ delivery_codes: [] })
      await pincodeServiceability(['400068', '110001'])
      expect(mockDelhiveryFetch).toHaveBeenCalledWith(
        '/c/api/pin-codes/json/?filter_codes=400068,110001',
      )
    })

    it('throws when no pincodes are given', async () => {
      await expect(pincodeServiceability([])).rejects.toThrow(
        'At least one pincode is required',
      )
    })
  })

  describe('fetchWaybill', () => {
    it('hits bulk waybill endpoint and stringifies values', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({ data: [70351234567] })
      const waybills = await fetchWaybill(1)
      expect(mockDelhiveryFetch).toHaveBeenCalledWith(
        '/waybill/api/bulk/json/?count=1',
      )
      expect(waybills).toEqual(['70351234567'])
    })

    it('splits the comma-separated string format returned by the API', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce('60528410000066,60528410000070')
      const waybills = await fetchWaybill(2)
      expect(waybills).toEqual(['60528410000066', '60528410000070'])
    })

    it('handles a bare single waybill string', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce('60528410000055')
      const waybills = await fetchWaybill(1)
      expect(waybills).toEqual(['60528410000055'])
    })

    it('returns empty array when data is missing', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({})
      const waybills = await fetchWaybill()
      expect(waybills).toEqual([])
    })

    it('rejects counts below 1', async () => {
      await expect(fetchWaybill(0)).rejects.toThrow(
        'Waybill count must be at least 1',
      )
    })
  })

  describe('createShipment', () => {
    it('posts form-encoded format=json wrapper to create.json', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({ packages_queued: true })
      const shipment: ShipmentRequest = {
        name: 'Archana Vaknalli',
        order: 'ORD-00001',
        phone: '9065665511',
        add: 'Line 1, Line 2',
        pin: '400068',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        payment_mode: 'Prepaid',
        pickup_location: 'SHAYGA B2C',
        weight: 1000,
        quantity: 2,
        total_amount: 4999,
        products_desc: 'Saree x2',
        seller_name: 'Shayga',
        seller_add: 'Dahisar West, Mumbai',
        seller_phone: '9065665511',
        return_name: 'Shayga',
        return_add: 'Dahisar West, Mumbai',
        return_city: 'Mumbai',
        return_state: 'Maharashtra',
        return_pin: '400068',
        return_phone: '9065665511',
        waybill: '70351234567',
        cod_amount: 0,
      }

      await createShipment(shipment)

      const [path, options] = mockDelhiveryFetch.mock.calls[0] as [
        string,
        {
          method: string
          headers: Record<string, string>
          body: URLSearchParams
        },
      ]
      expect(path).toBe('/api/cmu/create.json')
      expect(options.method).toBe('POST')
      expect(options.headers['Content-Type']).toBe(
        'application/x-www-form-urlencoded',
      )

      const body = options.body as URLSearchParams
      expect(body.get('format')).toBe('json')
      const data = JSON.parse(body.get('data') ?? '{}')
      expect(data.shipments).toHaveLength(1)
      expect(data.shipments[0].waybill).toBe('70351234567')
      expect(data.shipments[0].payment_mode).toBe('Prepaid')
    })
  })
})

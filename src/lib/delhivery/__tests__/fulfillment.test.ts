import { describe, it, expect, vi, beforeEach } from 'vitest'

// @vitest-environment node

import {
  createPickupRequest,
  generateLabel,
  nextPickupSlotIST,
  trackShipment,
} from '../fulfillment'

const mockDelhiveryFetch = vi.fn()

vi.mock('../client', () => ({
  delhiveryFetch: (...args: unknown[]) => mockDelhiveryFetch(...args),
}))

vi.mock('../config', () => ({
  getDelhiveryConfig: () => ({ pickupLocation: 'SHAYGA B2C' }),
}))

describe('fulfillment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateLabel', () => {
    it('requests a 4R PDF packing slip for the waybill', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({ link: 'https://s3/label.pdf' })
      const { pdfUrl } = await generateLabel('70351234567')
      expect(mockDelhiveryFetch).toHaveBeenCalledWith(
        '/api/p/packing_slip?wbns=70351234567&pdf=true&pdf_size=4R',
      )
      expect(pdfUrl).toBe('https://s3/label.pdf')
    })

    it('extracts pdf_url when link is missing', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({
        pdf_url: 'https://s3/other.pdf',
      })
      const { pdfUrl } = await generateLabel('70351234567')
      expect(pdfUrl).toBe('https://s3/other.pdf')
    })

    it('extracts from nested files when top-level keys are absent', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({
        files: [{ link: 'https://s3/nested.pdf' }],
      })
      const { pdfUrl } = await generateLabel('70351234567')
      expect(pdfUrl).toBe('https://s3/nested.pdf')
    })

    it('extracts pdf_download_link from packages (real API shape)', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({
        packages: [{ pdf_download_link: 'https://s3/packing-slip.pdf' }],
      })
      const { pdfUrl } = await generateLabel('70351234567')
      expect(pdfUrl).toBe('https://s3/packing-slip.pdf')
    })
  })

  describe('createPickupRequest', () => {
    it('posts pickup request with pickup_location from config', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({ pickup_request_id: 'PR-1' })
      const res = await createPickupRequest({
        pickupTime: '11:00:00',
        pickupDate: '2026-09-10',
        expectedPackageCount: 2,
      })

      const [path, options] = mockDelhiveryFetch.mock.calls[0] as [
        string,
        { method: string; body: string },
      ]
      expect(path).toBe('/fm/request/new/')
      expect(options.method).toBe('POST')

      const body = JSON.parse(options.body)
      expect(body).toEqual({
        pickup_time: '11:00:00',
        pickup_date: '2026-09-10',
        pickup_location: 'SHAYGA B2C',
        expected_package_count: 2,
      })
      expect(res.pickupRequestId).toBe('PR-1')
    })

    it('rejects package counts below 1', async () => {
      await expect(
        createPickupRequest({
          pickupTime: '11:00:00',
          pickupDate: '2026-09-10',
          expectedPackageCount: 0,
        }),
      ).rejects.toThrow('expectedPackageCount must be at least 1')
    })

    it('reads pickup_id from the real API response', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({
        pickup_id: 320124198,
        client_name: 'SHAYGA B2C',
      })
      const res = await createPickupRequest({
        pickupTime: '11:00:00',
        pickupDate: '2026-09-10',
        expectedPackageCount: 1,
      })
      expect(res.pickupRequestId).toBe('320124198')
    })
  })

  describe('nextPickupSlotIST', () => {
    it('returns an IST date and a top-of-the-next-hour time', () => {
      const slot = nextPickupSlotIST()
      expect(slot.pickupDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(slot.pickupTime).toMatch(/^\d{2}:00:00$/)
    })
  })

  describe('trackShipment', () => {
    it('fetches tracking for a waybill', async () => {
      mockDelhiveryFetch.mockResolvedValueOnce({
        shipments: [{ AWB: '70351234567', Shipment_Status: 'In Transit' }],
      })
      const res = await trackShipment('70351234567')
      expect(mockDelhiveryFetch).toHaveBeenCalledWith(
        '/api/v1/packages/json/?waybill=70351234567',
      )
      expect(res.shipments?.[0]?.Shipment_Status).toBe('In Transit')
    })
  })
})

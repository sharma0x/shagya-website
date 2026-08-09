import { describe, it, expect } from 'vitest'
import { isSameAddress, deduplicateAddresses } from '../address-utils'

describe('address-utils', () => {
  describe('isSameAddress', () => {
    it('returns true for identical addresses', () => {
      const addrA = {
        fullName: 'Jane Doe',
        phone: '9876543210',
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      }
      const addrB = { ...addrA }
      expect(isSameAddress(addrA, addrB)).toBe(true)
    })

    it('ignores case and surrounding whitespace', () => {
      const addrA = {
        fullName: 'Jane Doe ',
        phone: ' 9876543210 ',
        line1: '123 main st',
        line2: 'apt 4b',
        city: 'MUMBAI',
        state: 'maharashtra',
        pincode: '400001',
        country: 'India',
      }
      const addrB = {
        fullName: 'JANE DOE',
        phone: '9876543210',
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'india',
      }
      expect(isSameAddress(addrA, addrB)).toBe(true)
    })

    it('defaults country to India when missing', () => {
      const addrA = {
        fullName: 'Jane Doe',
        phone: '9876543210',
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      }
      const addrB = {
        fullName: 'Jane Doe',
        phone: '9876543210',
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      }
      expect(isSameAddress(addrA, addrB)).toBe(true)
    })

    it('returns false when any field differs', () => {
      const base = {
        fullName: 'Jane Doe',
        phone: '9876543210',
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      }
      expect(isSameAddress(base, { ...base, line1: '456 Park Ave' })).toBe(
        false,
      )
      expect(isSameAddress(base, { ...base, pincode: '400002' })).toBe(false)
      expect(isSameAddress(base, { ...base, fullName: 'John Doe' })).toBe(false)
    })
  })

  describe('deduplicateAddresses', () => {
    it('removes duplicate addresses from an array', () => {
      const addresses = [
        {
          id: '1',
          fullName: 'Jane Doe',
          phone: '9876543210',
          line1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: false,
        },
        {
          id: '2',
          fullName: 'Jane Doe',
          phone: '9876543210',
          line1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: false,
        },
        {
          id: '3',
          fullName: 'John Smith',
          phone: '9123456789',
          line1: '789 Garden Rd',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          isDefault: true,
        },
      ]

      const deduplicated = deduplicateAddresses(addresses)
      expect(deduplicated).toHaveLength(2)
      expect(deduplicated[0].id).toBe('1')
      expect(deduplicated[1].id).toBe('3')
    })

    it('preserves isDefault if duplicate has isDefault true', () => {
      const addresses = [
        {
          id: '1',
          fullName: 'Jane Doe',
          phone: '9876543210',
          line1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: false,
        },
        {
          id: '2',
          fullName: 'Jane Doe',
          phone: '9876543210',
          line1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true,
        },
      ]

      const deduplicated = deduplicateAddresses(addresses)
      expect(deduplicated).toHaveLength(1)
      expect(deduplicated[0].isDefault).toBe(true)
    })
  })
})

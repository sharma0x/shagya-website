import { describe, it, expect } from 'vitest'
import {
  buildReceiptDefinition,
  generateOrderReceiptPdf,
  type ReceiptOrder,
} from '@/lib/receipt'

const baseOrder: ReceiptOrder = {
  orderNumber: 'ORD-00042',
  customerEmail: 'customer@example.com',
  phone: '9876543210',
  status: 'confirmed',
  subtotal: 4000,
  shipping: 0,
  tax: 0,
  discount: 500,
  total: 3500,
  paymentId: 'pay_ABC123',
  createdAt: '2026-09-11T10:30:00.000Z',
  shippingType: 'standard',
  shippingAddress: {
    fullName: 'Anita Sharma',
    phone: '9876543210',
    line1: '12 Heritage Lane',
    line2: 'Near City Palace',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    country: 'India',
  },
  billingAddress: {
    fullName: 'Anita Sharma',
    line1: '12 Heritage Lane',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    country: 'India',
  },
  items: [
    {
      id: 'item-1',
      product: { name: 'Banarasi Silk Saree', slug: 'banarasi-silk-saree' },
      colorName: 'Rani Pink',
      quantity: 1,
      unitPrice: 4000,
      totalPrice: 4000,
    },
    {
      id: 'item-2',
      product: 42,
      colorName: null,
      quantity: 2,
      unitPrice: 250,
      totalPrice: 500,
    },
  ],
}

describe('buildReceiptDefinition', () => {
  it('includes order metadata and items', () => {
    const def = buildReceiptDefinition(baseOrder)

    const content = def.content as any[]
    expect(content.length).toBeGreaterThan(0)

    // Order number appears in the meta columns block
    const metaColumns = content.find(
      (node) => node && typeof node === 'object' && 'columns' in node,
    )
    const metaJson = JSON.stringify(metaColumns)
    expect(metaJson).toContain('ORD-00042')
    expect(metaJson).toContain('Paid online (Razorpay)')
    expect(metaJson).toContain('Confirmed')

    const bodyJson = JSON.stringify(content)
    expect(bodyJson).toContain('Banarasi Silk Saree')
    expect(bodyJson).toContain('Color: Rani Pink')
    expect(bodyJson).toContain('Handloom product')
  })

  it('renders totals with coupon discount', () => {
    const def = buildReceiptDefinition(baseOrder)
    const json = JSON.stringify(def.content)
    expect(json).toContain('Coupon Discount')
    expect(json).toContain('Total Paid')
    expect(json).toContain('FREE')
  })

  it('omits discount row when there is no discount', () => {
    const def = buildReceiptDefinition({ ...baseOrder, discount: 0 })
    const json = JSON.stringify(def.content)
    expect(json).not.toContain('Coupon Discount')
  })

  it('labels COD payments as Cash on Delivery', () => {
    const def = buildReceiptDefinition({
      ...baseOrder,
      paymentId: 'COD',
      status: 'pending',
    })
    const json = JSON.stringify(def.content)
    expect(json).toContain('Cash on Delivery')
  })

  it('attaches a footer with page numbers', () => {
    const def = buildReceiptDefinition(baseOrder)
    expect(def.footer).toBeTypeOf('function')
    const footer = (def.footer as (page: number, count: number) => any)(1, 2)
    expect(JSON.stringify(footer)).toContain('Page 1 of 2')
  })
})

describe('generateOrderReceiptPdf', () => {
  it('renders a valid PDF buffer', async () => {
    const pdf = await generateOrderReceiptPdf(baseOrder)
    expect(Buffer.isBuffer(pdf)).toBe(true)
    expect(pdf.length).toBeGreaterThan(500)
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  })

  it('handles an order without items', async () => {
    const pdf = await generateOrderReceiptPdf({ ...baseOrder, items: null })
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  })
})

import { describe, it, expect } from 'vitest'
import { Orders } from '../Orders'

describe('Orders collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Orders.slug).toBe('orders')
    })

    it('uses orderNumber as display title', () => {
      expect(Orders.admin?.useAsTitle).toBe('orderNumber')
    })

    it('is in Orders admin group', () => {
      expect(Orders.admin?.group).toBe('Orders')
    })

    it('has timestamps enabled', () => {
      expect(Orders.timestamps).toBe(true)
    })
  })

  describe('Order Number field', () => {
    it('has orderNumber text field (unique, readOnly)', () => {
      const field = Orders.fields?.find(
        (f: any) => f.name === 'orderNumber',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.unique).toBe(true)
      expect(field?.admin?.readOnly).toBe(true)
    })
  })

  describe('Customer fields', () => {
    it('has customerEmail email field (required)', () => {
      const field = Orders.fields?.find(
        (f: any) => f.name === 'customerEmail',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('email')
      expect(field?.required).toBe(true)
    })

    it('has phone text field', () => {
      const field = Orders.fields?.find((f: any) => f.name === 'phone') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })
  })

  describe('Status field', () => {
    it('has status select field with 7 options and default pending', () => {
      const field = Orders.fields?.find((f: any) => f.name === 'status') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('select')
      expect(field?.defaultValue).toBe('pending')

      const values = field?.options?.map((o: any) => o.value)
      expect(values).toHaveLength(7)
      expect(values).toEqual([
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ])
    })
  })

  describe('Financial fields', () => {
    it('has subtotal number field (required, min=0)', () => {
      const field = Orders.fields?.find(
        (f: any) => f.name === 'subtotal',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.required).toBe(true)
      expect(field?.min).toBe(0)
    })

    it('has shipping number field (min=0, defaultValue=0)', () => {
      const field = Orders.fields?.find(
        (f: any) => f.name === 'shipping',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
      expect(field?.defaultValue).toBe(0)
    })

    it('has tax number field (min=0, defaultValue=0)', () => {
      const field = Orders.fields?.find((f: any) => f.name === 'tax') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
      expect(field?.defaultValue).toBe(0)
    })

    it('has discount number field (min=0, defaultValue=0)', () => {
      const field = Orders.fields?.find(
        (f: any) => f.name === 'discount',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
      expect(field?.defaultValue).toBe(0)
    })

    it('has total number field (required, min=0)', () => {
      const field = Orders.fields?.find((f: any) => f.name === 'total') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.required).toBe(true)
      expect(field?.min).toBe(0)
    })
  })

  describe('Payment field', () => {
    it('has paymentId text field', () => {
      const field = Orders.fields?.find(
        (f: any) => f.name === 'paymentId',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })
  })

  describe('Shipping Address group field', () => {
    it('has shippingAddress group field', () => {
      const field = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('group')
    })

    it('shippingAddress has fullName text sub-field', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'fullName')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
    })

    it('shippingAddress has phone text sub-field', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'phone')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
    })

    it('shippingAddress has line1 text sub-field', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'line1')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
    })

    it('shippingAddress has line2 text sub-field', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'line2')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
    })

    it('shippingAddress has city text sub-field', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'city')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
    })

    it('shippingAddress has state text sub-field', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'state')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
    })

    it('shippingAddress has pincode text sub-field', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'pincode')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
    })

    it('shippingAddress has country text sub-field (default=India)', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'shippingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'country')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
      expect(sub?.defaultValue).toBe('India')
    })
  })

  describe('Billing Address group field', () => {
    it('has billingAddress group field', () => {
      const field = Orders.fields?.find(
        (f: any) => f.name === 'billingAddress',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('group')
    })

    it('billingAddress has fullName text sub-field', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'billingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'fullName')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
    })

    it('billingAddress has country text sub-field (default=India)', () => {
      const group = Orders.fields?.find(
        (f: any) => f.name === 'billingAddress',
      ) as any
      const sub = group?.fields?.find((f: any) => f.name === 'country')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('text')
      expect(sub?.defaultValue).toBe('India')
    })
  })

  describe('Items array field', () => {
    it('has items array field', () => {
      const field = Orders.fields?.find((f: any) => f.name === 'items') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('array')
    })

    it('items has product relationship sub-field (required)', () => {
      const array = Orders.fields?.find((f: any) => f.name === 'items') as any
      const sub = array?.fields?.find((f: any) => f.name === 'product')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('relationship')
      expect(sub?.relationTo).toBe('products')
      expect(sub?.required).toBe(true)
    })

    it('items has variant relationship sub-field', () => {
      const array = Orders.fields?.find((f: any) => f.name === 'items') as any
      const sub = array?.fields?.find((f: any) => f.name === 'variant')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('relationship')
      expect(sub?.relationTo).toBe('variants')
    })

    it('items has quantity number sub-field (required, min=1, default=1)', () => {
      const array = Orders.fields?.find((f: any) => f.name === 'items') as any
      const sub = array?.fields?.find((f: any) => f.name === 'quantity')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('number')
      expect(sub?.required).toBe(true)
      expect(sub?.min).toBe(1)
      expect(sub?.defaultValue).toBe(1)
    })

    it('items has unitPrice number sub-field (required, min=0)', () => {
      const array = Orders.fields?.find((f: any) => f.name === 'items') as any
      const sub = array?.fields?.find((f: any) => f.name === 'unitPrice')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('number')
      expect(sub?.required).toBe(true)
      expect(sub?.min).toBe(0)
    })

    it('items has totalPrice number sub-field (required, min=0)', () => {
      const array = Orders.fields?.find((f: any) => f.name === 'items') as any
      const sub = array?.fields?.find((f: any) => f.name === 'totalPrice')
      expect(sub).toBeDefined()
      expect(sub?.type).toBe('number')
      expect(sub?.required).toBe(true)
      expect(sub?.min).toBe(0)
    })
  })

  describe('Before change hook', () => {
    it('has a beforeChange hook', () => {
      const hooks = Orders.hooks
      expect(hooks).toBeDefined()
      expect(hooks?.beforeChange).toBeDefined()
      expect(hooks?.beforeChange?.length).toBeGreaterThan(0)
    })

    it('generates order number on create when no orderNumber is set', async () => {
      const hook = Orders.hooks?.beforeChange?.[0]
      expect(hook).toBeDefined()
      if (!hook) return

      const result = await hook({
        data: { customerEmail: 'test@example.com' },
        operation: 'create',
        req: {
          payload: {
            find: async () => ({ docs: [] }),
          },
        },
      } as any)

      expect(result.orderNumber).toBeDefined()
      expect(result.orderNumber).toMatch(/^ORD-\d{5}$/)
      expect(result.orderNumber).toBe('ORD-00001')
    })

    it('increments order number based on last existing', async () => {
      const hook = Orders.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = await hook({
        data: { customerEmail: 'test@example.com' },
        operation: 'create',
        req: {
          payload: {
            find: async () => ({
              docs: [{ orderNumber: 'ORD-00042' }],
            }),
          },
        },
      } as any)

      expect(result.orderNumber).toBe('ORD-00043')
    })

    it('does not overwrite orderNumber on update operation', async () => {
      const hook = Orders.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = await hook({
        data: { id: 'abc', orderNumber: 'ORD-00099', status: 'shipped' },
        operation: 'update',
        req: {
          payload: {
            find: async () => ({ docs: [] }),
          },
        },
      } as any)

      expect(result.orderNumber).toBe('ORD-00099')
    })
  })

  describe('Total field count', () => {
    it('has exactly 13 top-level fields', () => {
      expect(Orders.fields).toHaveLength(13)
    })
  })
})

import type { CollectionConfig } from 'payload'

/**
 * Append-only audit ledger of inventory movements.
 *
 * Every stock change caused by an order (commit on confirmation, restore on
 * cancellation/refund) is recorded here so the history of a product's stock is
 * never lost by overwriting the `quantity` integer on the product doc.
 *
 * Writes are performed programmatically with `overrideAccess: true` — admins
 * can read but not create/edit/delete entries through the panel.
 */
export const StockMovements: CollectionConfig = {
  slug: 'stock-movements',
  admin: {
    useAsTitle: 'id',
    group: 'Orders',
    defaultColumns: ['product', 'type', 'delta', 'order', 'createdAt'],
    description:
      'Append-only inventory movement ledger. Entries are written automatically on order confirmation and cancellation.',
  },
  access: {
    create: () => false,
    read: ({ req: { user } }) => Boolean(user),
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'variant',
      type: 'relationship',
      relationTo: 'colors',
      admin: {
        description: 'Color variant the movement applies to (variant products)',
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'Order that caused this movement',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Committed', value: 'committed' },
        { label: 'Restored', value: 'restored' },
        { label: 'Reserved', value: 'reserved' },
        { label: 'Released', value: 'released' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'delta',
      type: 'number',
      required: true,
      admin: {
        description: 'Signed change to tracked stock (negative = removed)',
      },
    },
    {
      name: 'quantityAfter',
      type: 'number',
      admin: {
        description: 'Product-level tracked quantity after the movement',
      },
    },
  ],
  timestamps: true,
}

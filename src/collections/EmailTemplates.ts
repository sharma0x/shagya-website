import type { CollectionConfig } from 'payload'

export const EMAIL_TEMPLATE_SLUGS = [
  'order-placed-customer',
  'admin-new-order',
  'order-confirmed-customer',
  'order-processing-customer',
  'order-shipped-customer',
  'order-delivered-customer',
  'order-cancelled-customer',
  'admin-order-cancelled',
  'order-refunded-customer',
  'admin-order-refunded',
  'welcome-customer',
  'verify-email',
  'magic-link',
] as const

export type TemplateSlug = (typeof EMAIL_TEMPLATE_SLUGS)[number]

const SLUG_META: Record<TemplateSlug, { label: string; hint: string }> = {
  'order-placed-customer': {
    label: 'Order Placed (Customer)',
    hint: '{{orderNumber}} {{customerName}} {{orderDate}} {{itemsTable}} {{pricingTable}} {{shippingAddressBlock}} {{storeUrl}}',
  },
  'admin-new-order': {
    label: 'New Order (Admin)',
    hint: '{{orderNumber}} {{customerName}} {{customerEmail}} {{customerPhone}} {{orderDate}} {{itemsTable}} {{pricingTable}} {{shippingAddressBlock}} {{adminOrderUrl}}',
  },
  'order-confirmed-customer': {
    label: 'Payment Confirmed (Customer)',
    hint: '{{orderNumber}} {{customerName}} {{paymentId}} {{total}} {{storeUrl}}',
  },
  'order-processing-customer': {
    label: 'Order Processing (Customer)',
    hint: '{{orderNumber}} {{customerName}} {{storeUrl}}',
  },
  'order-shipped-customer': {
    label: 'Order Shipped (Customer)',
    hint: '{{orderNumber}} {{customerName}} {{storeUrl}}',
  },
  'order-delivered-customer': {
    label: 'Order Delivered (Customer)',
    hint: '{{orderNumber}} {{customerName}} {{storeUrl}}',
  },
  'order-cancelled-customer': {
    label: 'Order Cancelled (Customer)',
    hint: '{{orderNumber}} {{customerName}} {{total}} {{storeUrl}}',
  },
  'admin-order-cancelled': {
    label: 'Order Cancelled (Admin)',
    hint: '{{orderNumber}} {{customerName}} {{customerEmail}} {{total}} {{adminOrderUrl}}',
  },
  'order-refunded-customer': {
    label: 'Refund Initiated (Customer)',
    hint: '{{orderNumber}} {{customerName}} {{total}} {{storeUrl}}',
  },
  'admin-order-refunded': {
    label: 'Refund Processed (Admin)',
    hint: '{{orderNumber}} {{customerName}} {{customerEmail}} {{total}} {{adminOrderUrl}}',
  },
  'welcome-customer': {
    label: 'Welcome Email (Customer)',
    hint: '{{customerName}} {{storeUrl}}',
  },
  'verify-email': {
    label: 'Verify Email (Customer)',
    hint: '{{customerName}} {{verificationUrl}} {{storeUrl}}',
  },
  'magic-link': {
    label: 'Magic Link Sign-in (Customer)',
    hint: '{{verificationUrl}} {{storeUrl}}',
  },
}

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'slug', 'isActive', 'updatedAt'],
    description:
      'Override default transactional email templates. Leave a template inactive to use the built-in default.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Template Name',
      admin: { description: 'A human-readable label shown in the admin list.' },
    },
    {
      name: 'slug',
      type: 'select',
      required: true,
      label: 'Template Identifier',
      unique: true,
      options: EMAIL_TEMPLATE_SLUGS.map((s) => ({
        label: SLUG_META[s].label,
        value: s,
      })),
      admin: {
        description:
          'Identifies which email this template replaces. Each identifier can only have one active override.',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active (override default)',
      defaultValue: true,
      admin: {
        description:
          'When unchecked, the system falls back to the built-in default template for this email.',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: 'Subject Line',
      admin: {
        description:
          'Email subject. Supports template variables, e.g. "Your order {{orderNumber}} is confirmed".',
      },
    },
    {
      name: 'body',
      type: 'code',
      required: true,
      label: 'Email Body (HTML)',
      admin: {
        language: 'html',
        components: {
          Description:
            '@/collections/components/EmailBodyDescription#EmailBodyDescription',
        },
      },
    },
    {
      name: 'preview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/components/EmailPreview#EmailPreview',
        },
      },
    },
  ],
  timestamps: true,
}

import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: ({ req: { user } }) => {
      // Authenticated users (admins in the iframe) see both drafts and published.
      // Anonymous users only see published content.
      return user ? true : { _status: { equals: 'published' } }
    },
    update: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
  },
  fields: [
    // ---- Brand Identity ----
    {
      name: 'siteName',
      type: 'text',
      label: 'Site Name',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: 'Favicon',
    },

    // ---- Email Notifications ----
    {
      name: 'adminNotificationEmails',
      type: 'array',
      label: 'Admin Notification Emails',
      admin: {
        description:
          'All order and system notifications (new orders, cancellations, refunds) are sent to these addresses. Falls back to the ADMIN_EMAIL env var if not set.',
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
      ],
    },

    // ---- Contact Info ----
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Contact Email',
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'Contact Phone',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Address',
    },
    {
      name: 'gstNumber',
      type: 'text',
      label: 'GST Number',
      admin: {
        description:
          'Business GST identification number (e.g., 22AAAAA0000A1Z5). Displayed on invoices and receipts.',
      },
      validate: (val: unknown) => {
        if (!val) return true
        // Indian GST format: 2-digit state code + 10-digit PAN + entity code + Z + checksum
        // Example: 22AAAAA0000A1Z5
        if (
          typeof val === 'string' &&
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val)
        ) {
          return 'Invalid GST format. Expected format: 22AAAAA0000A1Z5 (15 characters)'
        }
        return true
      },
    },

    // ---- Social Media Links ----
    {
      name: 'instagramUrl',
      type: 'text',
      label: 'Instagram URL',
    },
    {
      name: 'facebookUrl',
      type: 'text',
      label: 'Facebook URL',
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      label: 'YouTube URL',
    },
    {
      name: 'whatsappUrl',
      type: 'text',
      label: 'WhatsApp URL',
      admin: {
        description: 'WhatsApp chat link, e.g. https://wa.me/91906566511',
      },
    },
    {
      name: 'pinterestUrl',
      type: 'text',
      label: 'Pinterest URL',
    },

    // ---- Policies ----
    {
      name: 'shippingPolicy',
      type: 'textarea',
      label: 'Shipping Policy',
    },
    {
      name: 'returnPolicy',
      type: 'textarea',
      label: 'Return Policy',
    },

    // ---- Product Page Trust Signals ----
    {
      name: 'trustSignals',
      type: 'array',
      label: 'Product Page Trust Signals',
      minRows: 0,
      maxRows: 6,
      defaultValue: [
        {
          icon: 'shield',
          title: 'Handloom verified',
          detail: 'Sourced directly from the weaving cluster',
        },
        {
          icon: 'truck',
          title: 'Free shipping across India',
          detail: 'Delivered in 5–7 business days',
        },
        {
          icon: 'refresh',
          title: '7-day easy returns',
          detail: 'On unworn, tag-on sarees',
        },
      ],
      admin: {
        description:
          'Shown on every product page below the buy buttons. Remove all rows to hide the section.',
      },
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Icon',
          required: true,
          defaultValue: 'shield',
          options: [
            { label: 'Shield — verification', value: 'shield' },
            { label: 'Truck — shipping', value: 'truck' },
            { label: 'Arrows — returns/exchange', value: 'refresh' },
            { label: 'Badge — quality/certified', value: 'badge' },
            { label: 'Box — packaging/delivery', value: 'package' },
            { label: 'Sparkles — highlights', value: 'sparkles' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: true,
        },
        {
          name: 'detail',
          type: 'text',
          label: 'Detail',
          required: true,
        },
      ],
    },

    // ---- Announcement Bar ----
    {
      name: 'announcementBar',
      type: 'group',
      label: 'Announcement Bar',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable Announcement Bar',
          defaultValue: true,
        },
        {
          name: 'announcements',
          type: 'array',
          label: 'Announcements',
          minRows: 1,
          maxRows: 10,
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Announcement Text',
              required: true,
            },
            {
              name: 'link',
              type: 'text',
              label: 'Link URL (optional)',
            },
          ],
        },
      ],
    },

    // ---- Store Configuration ----
    {
      name: 'gstPercent',
      type: 'number',
      label: 'GST Percent',
      defaultValue: 5,
    },
    {
      name: 'currency',
      type: 'text',
      label: 'Currency',
      defaultValue: 'INR',
    },
    {
      name: 'standardShippingRate',
      type: 'number',
      label: 'Standard Shipping Rate',
      defaultValue: 150,
      admin: {
        description: 'The cost for standard shipping.',
      },
    },
    {
      name: 'expressShippingRate',
      type: 'number',
      label: 'Express Shipping Rate',
      defaultValue: 350,
      admin: {
        description: 'The cost for express shipping.',
      },
    },
    {
      name: 'freeShippingThreshold',
      type: 'number',
      label: 'Free Shipping Threshold',
      defaultValue: 5000,
      admin: {
        description:
          'Cart subtotal value required to qualify for free shipping.',
      },
    },
    {
      name: 'codFee',
      type: 'number',
      label: 'Cash on Delivery Fee',
      defaultValue: 100,
      min: 0,
      admin: {
        description: 'Additional charge applied when customers choose COD.',
      },
    },

    // ---- Coupons & Offers ----
    {
      name: 'activeCoupons',
      type: 'relationship',
      relationTo: 'coupons',
      hasMany: true,
      label: 'Featured Coupon Codes',
      admin: {
        description:
          'Select coupons to display on the checkout page under pre-populated offers',
      },
    },

    // ---- Delhivery Shipping ----
    {
      name: 'delhivery',
      type: 'group',
      label: 'Delhivery Shipping',
      admin: {
        description:
          'Fulfilment identity used when manifesting orders with Delhivery. Leave a field blank to fall back to its environment variable (DELHIVERY_*).',
      },
      fields: [
        {
          name: 'pickupLocation',
          type: 'text',
          label: 'Pickup Location Name',
          admin: {
            description:
              'Pickup point name registered in the Delhivery One Panel (e.g. SHAYGA B2C).',
          },
        },
        {
          name: 'pickupPin',
          type: 'text',
          label: 'Pickup Pincode',
          admin: {
            description: 'Origin pincode used for shipments and return labels.',
          },
        },
        {
          name: 'clientName',
          type: 'text',
          label: 'Client Name',
          admin: {
            description: 'Client/account name shown to Delhivery.',
          },
        },
        {
          name: 'sellerName',
          type: 'text',
          label: 'Seller Name',
        },
        {
          name: 'sellerAddress',
          type: 'textarea',
          label: 'Seller Address',
        },
        {
          name: 'sellerPhone',
          type: 'text',
          label: 'Seller Phone',
        },
        {
          name: 'sellerEmail',
          type: 'email',
          label: 'Seller Email',
        },
      ],
    },
  ],
}

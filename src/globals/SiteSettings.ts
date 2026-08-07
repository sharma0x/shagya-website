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
      name: 'adminNotificationEmail',
      type: 'email',
      label: 'Admin Notification Email',
      admin: {
        description:
          'All order and system notifications (new orders, cancellations, refunds) are sent to this address. Falls back to the ADMIN_EMAIL env var if not set.',
      },
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
  ],
}

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
          name: 'text',
          type: 'text',
          label: 'Announcement Text',
          defaultValue:
            'Free shipping on orders above ₹999 \u00A0·\u00A0 Easy 7-day returns',
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

    // ---- Coupons & Offers ----
    {
      name: 'activeCoupons',
      type: 'relationship',
      relationTo: 'coupons',
      hasMany: true,
      label: 'Featured Coupon Codes',
      admin: {
        description: 'Select coupons to display on the checkout page under pre-populated offers',
      },
    },
  ],
}

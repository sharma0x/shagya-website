import type { TemplateSlug } from '@/collections/EmailTemplates'

export interface EmailDefault {
  subject: string
  body: string
}

// Brand hex approximations of the OKLCH design tokens
// brand-700 ≈ #6B2448  gold-500 ≈ #B5922A  neutral-50 ≈ #FAF5F7
// text-dark  ≈ #2A1E24  text-mid ≈ #6B5E63  border ≈ #E8DDE2

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Shayga</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF5F7;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF5F7;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border:1px solid #E8DDE2;">
  <tr>
    <td style="background-color:#ffffff;padding:30px 40px;text-align:left;">
      <table cellpadding="0" cellspacing="0" style="margin:0;">
        <tr>
          <td valign="middle" style="padding-right:12px;">
            <img src="{{storeUrl}}/shayga-logo.svg" alt="Logo" width="32" height="32" style="display:block; border:none;" />
          </td>
          <td valign="middle">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:0.02em;color:#6B2448;font-weight:400;">Shagya</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td height="2" style="background-color:#B5922A;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr>
    <td style="padding:40px;color:#2A1E24;font-size:15px;line-height:1.65;">
${content}
    </td>
  </tr>
  <tr><td height="1" style="background-color:#E8DDE2;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr>
    <td style="background-color:#FAF5F7;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:11px;color:#9B8E93;font-style:italic;letter-spacing:0.05em;">Heritage Handloom &middot; Crafted since 1987</p>
      <p style="margin:0;font-size:11px;color:#B5A8AD;">
        <a href="{{storeUrl}}/shop" style="color:#6B2448;text-decoration:none;">Shop</a>
        &nbsp;&middot;&nbsp;
        <a href="{{storeUrl}}/account/orders" style="color:#6B2448;text-decoration:none;">My Orders</a>
        &nbsp;&middot;&nbsp;
        <a href="{{storeUrl}}/contact" style="color:#6B2448;text-decoration:none;">Contact</a>
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function btn(href: string, label: string): string {
  return `<div style="margin:36px 0 0;text-align:center;">
  <a href="${href}" style="display:inline-block;background-color:#6B2448;color:#FAF5F7;font-size:14px;text-decoration:none;padding:14px 36px;letter-spacing:0.06em;">${label}</a>
</div>`
}

function kv(label: string, value: string): string {
  return `<tr>
    <td style="font-size:13px;color:#9B8E93;width:150px;vertical-align:top;padding:4px 0;">${label}</td>
    <td style="font-size:14px;color:#2A1E24;padding:4px 0;">${value}</td>
  </tr>`
}

function sectionLabel(text: string): string {
  return `<p style="margin:28px 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.09em;color:#9B8E93;">${text}</p>`
}

export const DEFAULT_TEMPLATES: Record<TemplateSlug, EmailDefault> = {
  // ── Customer: order placed ─────────────────────────────────────────────────
  'order-placed-customer': {
    subject: 'Order {{orderNumber}} received — Shayga',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Thank you, {{customerName}}</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">We've received your order and will begin processing it as soon as payment is confirmed.</p>

<table cellpadding="0" cellspacing="0">
  ${kv('Order', '<strong>{{orderNumber}}</strong>')}
  ${kv('Date', '{{orderDate}}')}
</table>

${sectionLabel('Order Summary')}
{{itemsTable}}
{{pricingTable}}

${sectionLabel('Delivery Address')}
<p style="margin:0;font-size:14px;color:#2A1E24;line-height:1.75;">{{shippingAddressBlock}}</p>

${btn('{{storeUrl}}/account/orders/{{orderNumber}}', 'Track Your Order')}
`),
  },

  // ── Admin: new order ───────────────────────────────────────────────────────
  'admin-new-order': {
    subject: '[New Order] {{orderNumber}} — {{customerName}}',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:20px;font-weight:400;color:#6B2448;">New Order Received</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">A new order has been placed on Shayga.</p>

<table cellpadding="0" cellspacing="0">
  ${kv('Order', '<strong>{{orderNumber}}</strong>')}
  ${kv('Date', '{{orderDate}}')}
  ${kv('Customer', '{{customerName}}')}
  ${kv('Email', '<a href="mailto:{{customerEmail}}" style="color:#6B2448;text-decoration:none;">{{customerEmail}}</a>')}
  ${kv('Phone', '{{customerPhone}}')}
</table>

${sectionLabel('Items')}
{{itemsTable}}
{{pricingTable}}

${sectionLabel('Shipping Address')}
<p style="margin:0;font-size:14px;color:#2A1E24;line-height:1.75;">{{shippingAddressBlock}}</p>

${btn('{{adminOrderUrl}}', 'View in Admin')}
`),
  },

  // ── Customer: payment confirmed ────────────────────────────────────────────
  'order-confirmed-customer': {
    subject: 'Payment confirmed — Order {{orderNumber}}',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Payment Received</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Your payment for order <strong>{{orderNumber}}</strong> has been confirmed. We're getting your sarees ready.</p>

<table cellpadding="0" cellspacing="0">
  ${kv('Order', '<strong>{{orderNumber}}</strong>')}
  ${kv('Amount Paid', '&#8377;{{total}}')}
  ${kv('Payment ID', '<span style="font-family:monospace;color:#6B5E63;">{{paymentId}}</span>')}
</table>

<p style="margin:28px 0 0;font-size:14px;color:#6B5E63;">You'll receive another email when your order is dispatched.</p>

${btn('{{storeUrl}}/account/orders/{{orderNumber}}', 'View Order')}
`),
  },

  // ── Customer: processing ───────────────────────────────────────────────────
  'order-processing-customer': {
    subject: 'Order {{orderNumber}} is being prepared',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Your order is being prepared</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Dear {{customerName}}, we've started preparing your order <strong>{{orderNumber}}</strong> with care.</p>

<p style="margin:0;font-size:14px;color:#6B5E63;">Our team is handpicking and quality-checking each item. You'll hear from us as soon as it is dispatched.</p>

${btn('{{storeUrl}}/account/orders/{{orderNumber}}', 'View Order')}
`),
  },

  // ── Customer: shipped ──────────────────────────────────────────────────────
  'order-shipped-customer': {
    subject: 'Your order {{orderNumber}} is on its way',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Your order is on its way</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Dear {{customerName}}, your order <strong>{{orderNumber}}</strong> has been dispatched.</p>

<p style="margin:0 0 20px;font-size:14px;color:#6B5E63;">Please allow 5–7 business days for delivery. For any questions write to <a href="mailto:care@shayga.in" style="color:#6B2448;text-decoration:none;">care@shayga.in</a>.</p>

${btn('{{storeUrl}}/account/orders/{{orderNumber}}', 'View Order')}
`),
  },

  // ── Customer: delivered ────────────────────────────────────────────────────
  'order-delivered-customer': {
    subject: 'Your Shayga order has arrived — {{orderNumber}}',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Your order has been delivered</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Dear {{customerName}}, we're delighted that your order <strong>{{orderNumber}}</strong> has arrived.</p>

<p style="margin:0 0 16px;font-size:14px;color:#6B5E63;">We hope your sarees are everything you envisioned. If something is not right, you have 7 days to initiate a return.</p>

<p style="margin:0 0 0;font-size:14px;color:#6B5E63;">Your review also helps other customers — we'd love to hear your thoughts.</p>

${btn('{{storeUrl}}/account/orders/{{orderNumber}}', 'Leave a Review')}
`),
  },

  // ── Customer: cancelled ────────────────────────────────────────────────────
  'order-cancelled-customer': {
    subject: 'Your order {{orderNumber}} has been cancelled',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Order Cancelled</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Dear {{customerName}}, your order <strong>{{orderNumber}}</strong> has been cancelled.</p>

<table cellpadding="0" cellspacing="0">
  ${kv('Order', '<strong>{{orderNumber}}</strong>')}
  ${kv('Amount', '&#8377;{{total}}')}
</table>

<p style="margin:24px 0 16px;font-size:14px;color:#6B5E63;">If a payment was made, a refund will be processed within 5–7 business days to your original payment method.</p>

<p style="margin:0;font-size:14px;color:#6B5E63;">Questions? Write to <a href="mailto:care@shayga.in" style="color:#6B2448;text-decoration:none;">care@shayga.in</a>.</p>

${btn('{{storeUrl}}', 'Continue Shopping')}
`),
  },

  // ── Admin: order cancelled ─────────────────────────────────────────────────
  'admin-order-cancelled': {
    subject: '[Cancelled] Order {{orderNumber}} — {{customerName}}',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:20px;font-weight:400;color:#6B2448;">Order Cancelled</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">The following order has been cancelled.</p>

<table cellpadding="0" cellspacing="0">
  ${kv('Order', '<strong>{{orderNumber}}</strong>')}
  ${kv('Customer', '{{customerName}}')}
  ${kv('Email', '<a href="mailto:{{customerEmail}}" style="color:#6B2448;text-decoration:none;">{{customerEmail}}</a>')}
  ${kv('Total', '&#8377;{{total}}')}
</table>

${btn('{{adminOrderUrl}}', 'View in Admin')}
`),
  },

  // ── Customer: refunded ─────────────────────────────────────────────────────
  'order-refunded-customer': {
    subject: 'Refund initiated for order {{orderNumber}}',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Refund Initiated</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Dear {{customerName}}, your refund for order <strong>{{orderNumber}}</strong> has been initiated.</p>

<table cellpadding="0" cellspacing="0">
  ${kv('Order', '<strong>{{orderNumber}}</strong>')}
  ${kv('Refund Amount', '&#8377;{{total}}')}
</table>

<p style="margin:24px 0 16px;font-size:14px;color:#6B5E63;">Please allow 5–7 business days for the amount to reflect in your account. The timeline depends on your bank or payment provider.</p>

<p style="margin:0;font-size:14px;color:#6B5E63;">Need help? Write to <a href="mailto:care@shayga.in" style="color:#6B2448;text-decoration:none;">care@shayga.in</a>.</p>
`),
  },

  // ── Admin: order refunded ──────────────────────────────────────────────────
  'admin-order-refunded': {
    subject: '[Refunded] Order {{orderNumber}} — &#8377;{{total}}',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:20px;font-weight:400;color:#6B2448;">Refund Processed</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">A refund has been processed for the following order.</p>

<table cellpadding="0" cellspacing="0">
  ${kv('Order', '<strong>{{orderNumber}}</strong>')}
  ${kv('Customer', '{{customerName}}')}
  ${kv('Email', '<a href="mailto:{{customerEmail}}" style="color:#6B2448;text-decoration:none;">{{customerEmail}}</a>')}
  ${kv('Refund Amount', '<strong style="color:#6B2448;">&#8377;{{total}}</strong>')}
</table>

${btn('{{adminOrderUrl}}', 'View in Admin')}
`),
  },

  // ── Customer: welcome ──────────────────────────────────────────────────────
  'welcome-customer': {
    subject: 'Welcome to Shayga, {{customerName}}',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#6B2448;">Welcome, {{customerName}}</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Thank you for joining Shayga — where every thread carries a story.</p>

<p style="margin:0 0 16px;font-size:14px;color:#6B5E63;">Your account is ready. Explore our collection of handcrafted sarees, each woven with care by master artisans across India.</p>

<p style="margin:0 0 0;font-size:14px;color:#6B5E63;">Questions? We're always here at <a href="mailto:care@shayga.in" style="color:#6B2448;text-decoration:none;">care@shayga.in</a>.</p>

${btn('{{storeUrl}}', 'Explore Collection')}
`),
  },

  // ── Customer: verify email ──────────────────────────────────────────────────
  'verify-email': {
    subject: 'Verify your email — Shayga',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Verify your email</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Hi {{customerName}}, welcome to Shayga. Please confirm your email address to activate your account.</p>

<p style="margin:0 0 6px;font-size:14px;color:#6B5E63;">This link is valid for 1 hour.</p>

${btn('{{verificationUrl}}', 'Verify Email')}

<p style="margin:28px 0 0;font-size:13px;color:#9B8E93;">If you didn't create an account with Shayga, you can safely ignore this email.</p>
`),
  },

  // ── Customer: magic link sign-in ────────────────────────────────────────────
  'magic-link': {
    subject: 'Sign in to Shayga',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Sign in to Shayga</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Use the button below to sign in to your Shayga account. This link is valid for 10 minutes.</p>

${btn('{{verificationUrl}}', 'Sign In')}

<p style="margin:28px 0 0;font-size:13px;color:#9B8E93;">If you didn't request this, you can safely ignore this email.</p>
`),
  },
  'back-in-stock': {
    subject: "It's back! {{productName}} is in stock again",
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Great news — it's back!</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;"><strong>{{productName}}</strong> is back in stock at {{storeName}}. Handloom sarees are made in small batches — don't wait too long.</p>

${btn('{{productUrl}}', 'View & Shop')}

<p style="margin:28px 0 0;font-size:13px;color:#9B8E93;">You're getting this because you asked to be notified when this product was back in stock.</p>
`),
  },

  // ── Customer: password reset ─────────────────────────────────────────────────
  'password-reset': {
    subject: 'Reset your Shayga password',
    body: wrap(`
<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#6B2448;">Reset your password</h2>
<p style="margin:0 0 24px;font-size:14px;color:#6B5E63;padding-bottom:20px;border-bottom:1px solid #E8DDE2;">Hi {{customerName}}, we received a request to reset your Shayga account password.</p>

<p style="margin:0 0 6px;font-size:14px;color:#6B5E63;">Click the button below to set a new password. This link is valid for 1 hour.</p>

${btn('{{passwordResetUrl}}', 'Reset Password')}

<p style="margin:28px 0 0;font-size:13px;color:#9B8E93;">If you didn't request this, you can safely ignore this email. Your current password will remain unchanged.</p>
`),
  },
}

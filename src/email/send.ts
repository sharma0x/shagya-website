import type { Payload } from 'payload'
import { renderEmail } from './render'
import { getServerURL } from '@/lib/env'
import {
  buildItemsTable,
  buildPricingTable,
  buildAddressBlock,
  formatINR,
  formatDate,
  type OrderItem,
  type OrderAddress,
  type OrderTotals,
} from './builders'

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function getBaseURL(): Promise<string> {
  return getServerURL()
}

async function getAdminEmail(payload: Payload): Promise<string> {
  try {
    const settings = (await payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: true,
    })) as unknown as Record<string, unknown>
    if (typeof settings?.adminNotificationEmail === 'string') {
      return settings.adminNotificationEmail
    }
  } catch {
    // fall through
  }
  return process.env.ADMIN_EMAIL || 'admin@shayga.in'
}

async function safeSend(
  payload: Payload,
  to: string,
  subject: string,
  html: string,
  label: string,
): Promise<void> {
  try {
    await payload.sendEmail({ to, subject, html })
    payload.logger.info(`[Email] ✓ "${label}" → ${to}`)

    await payload.create({
      collection: 'email-logs',
      data: {
        to,
        subject,
        status: 'sent',
        label,
        html,
      },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.error(`[Email] ✗ "${label}" → ${to}: ${err}`)

    await payload.create({
      collection: 'email-logs',
      data: {
        to,
        subject,
        status: 'failed',
        error: String(err),
        label,
        html,
      },
      overrideAccess: true,
    })
  }
}

interface PopulatedOrder {
  id: string
  orderNumber: string
  customerEmail: string
  phone?: string | null
  paymentId?: string | null
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  shippingAddress?: OrderAddress | null
  items: OrderItem[]
  createdAt: string
}

async function fetchOrder(
  payload: Payload,
  id: string,
): Promise<PopulatedOrder | null> {
  try {
    const doc = await payload.findByID({
      collection: 'orders',
      id,
      depth: 2,
      overrideAccess: true,
    })
    return doc as unknown as PopulatedOrder
  } catch (err) {
    payload.logger.error(`[Email] Could not fetch order ${id}: ${err}`)
    return null
  }
}

async function resolveCustomerName(
  payload: Payload,
  email: string,
): Promise<string> {
  try {
    const result = await payload.find({
      collection: 'customers',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })
    const name = (
      result.docs[0] as unknown as Record<string, unknown> | undefined
    )?.name
    if (typeof name === 'string' && name.trim()) return name
  } catch {
    // fall through
  }
  return email.split('@')[0]
}

function buildOrderVars(
  order: PopulatedOrder,
  customerName: string,
  storeUrl: string,
  adminOrderUrl: string,
): Record<string, string> {
  const totals: OrderTotals = {
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    discount: order.discount,
    total: order.total,
  }

  return {
    orderNumber: order.orderNumber,
    customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.phone || '—',
    orderDate: formatDate(order.createdAt),
    paymentId: order.paymentId || '—',
    total: formatINR(order.total),
    itemsTable: buildItemsTable(order.items),
    pricingTable: buildPricingTable(totals),
    shippingAddressBlock: buildAddressBlock(order.shippingAddress),
    storeUrl,
    adminOrderUrl,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fires on order create: sends "order received" to customer and "new order" to admin.
 * Non-blocking — should be called with .catch() or fire-and-forget.
 */
export async function sendOrderPlacedEmails(
  payload: Payload,
  orderId: string,
): Promise<void> {
  const order = await fetchOrder(payload, orderId)
  if (!order) return

  const [storeUrl, adminEmail, customerName] = await Promise.all([
    getBaseURL(),
    getAdminEmail(payload),
    resolveCustomerName(payload, order.customerEmail),
  ])

  const adminOrderUrl = `${storeUrl}/admin/collections/orders/${order.id}`
  const vars = buildOrderVars(order, customerName, storeUrl, adminOrderUrl)

  const [custEmail, adminEmailData] = await Promise.all([
    renderEmail(payload, 'order-placed-customer', vars),
    renderEmail(payload, 'admin-new-order', vars),
  ])

  await Promise.all([
    safeSend(
      payload,
      order.customerEmail,
      custEmail.subject,
      custEmail.html,
      'order-placed-customer',
    ),
    safeSend(
      payload,
      adminEmail,
      adminEmailData.subject,
      adminEmailData.html,
      'admin-new-order',
    ),
  ])
}

type StatusSlugMap = {
  customerSlug?: Parameters<typeof renderEmail>[1]
  adminSlug?: Parameters<typeof renderEmail>[1]
}

const STATUS_SLUGS: Record<string, StatusSlugMap> = {
  confirmed: { customerSlug: 'order-confirmed-customer' },
  processing: { customerSlug: 'order-processing-customer' },
  shipped: { customerSlug: 'order-shipped-customer' },
  delivered: { customerSlug: 'order-delivered-customer' },
  cancelled: {
    customerSlug: 'order-cancelled-customer',
    adminSlug: 'admin-order-cancelled',
  },
  refunded: {
    customerSlug: 'order-refunded-customer',
    adminSlug: 'admin-order-refunded',
  },
}

/**
 * Fires on order status change: sends appropriate emails to customer and/or admin.
 * Non-blocking — should be called with .catch() or fire-and-forget.
 */
export async function sendOrderStatusEmails(
  payload: Payload,
  orderId: string,
  newStatus: string,
): Promise<void> {
  const config = STATUS_SLUGS[newStatus]
  if (!config) return

  const order = await fetchOrder(payload, orderId)
  if (!order) return

  const [storeUrl, adminEmail, customerName] = await Promise.all([
    getBaseURL(),
    getAdminEmail(payload),
    resolveCustomerName(payload, order.customerEmail),
  ])

  const adminOrderUrl = `${storeUrl}/admin/collections/orders/${order.id}`
  const vars = buildOrderVars(order, customerName, storeUrl, adminOrderUrl)

  const sends: Promise<void>[] = []

  if (config.customerSlug) {
    sends.push(
      renderEmail(payload, config.customerSlug, vars).then(
        ({ subject, html }) =>
          safeSend(
            payload,
            order.customerEmail,
            subject,
            html,
            config.customerSlug!,
          ),
      ),
    )
  }

  if (config.adminSlug) {
    sends.push(
      renderEmail(payload, config.adminSlug, vars).then(({ subject, html }) =>
        safeSend(payload, adminEmail, subject, html, config.adminSlug!),
      ),
    )
  }

  await Promise.all(sends)
}

/**
 * Fires on customer create (via auth sync): sends a welcome email.
 * Non-blocking — should be called with .catch() or fire-and-forget.
 */
export async function sendWelcomeEmail(
  payload: Payload,
  customerEmail: string,
  customerName: string,
): Promise<void> {
  const storeUrl = await getBaseURL()
  const { subject, html } = await renderEmail(payload, 'welcome-customer', {
    customerName: customerName || customerEmail.split('@')[0],
    storeUrl,
  })
  await safeSend(payload, customerEmail, subject, html, 'welcome-customer')
}

/**
 * Sends the email verification link during signup / sign-in.
 * Called from Better Auth's `sendVerificationEmail` callback.
 */
export async function sendVerificationEmail(
  payload: Payload,
  to: string,
  customerName: string,
  verificationUrl: string,
): Promise<void> {
  const storeUrl = await getBaseURL()
  const { subject, html } = await renderEmail(payload, 'verify-email', {
    customerName: customerName || to.split('@')[0],
    verificationUrl,
    storeUrl,
  })
  await safeSend(payload, to, subject, html, 'verify-email')
}

/**
 * Sends a magic-link sign-in email.
 * Called from Better Auth's `magicLink.sendMagicLink` callback.
 */
export async function sendMagicLinkEmail(
  payload: Payload,
  to: string,
  verificationUrl: string,
): Promise<void> {
  const storeUrl = await getBaseURL()
  const { subject, html } = await renderEmail(payload, 'magic-link', {
    verificationUrl,
    storeUrl,
  })
  await safeSend(payload, to, subject, html, 'magic-link')
}

/**
 * Sends a password-reset email.
 * Called from Better Auth's `emailAndPassword.sendResetPassword`.
 */
export async function sendResetPasswordEmail(
  payload: Payload,
  to: string,
  customerName: string,
  passwordResetUrl: string,
): Promise<void> {
  const storeUrl = await getBaseURL()
  const { subject, html } = await renderEmail(payload, 'password-reset', {
    customerName: customerName || to.split('@')[0],
    passwordResetUrl,
    storeUrl,
  })
  await safeSend(payload, to, subject, html, 'password-reset')
}

/**
 * Sends a back-in-stock notification email.
 */
export async function sendBackInStockEmail(
  payload: Payload,
  to: string,
  product: any,
): Promise<void> {
  const storeUrl = await getBaseURL()
  const productUrl = `${storeUrl}/products/${product.slug}`
  const { subject, html } = await renderEmail(payload, 'back-in-stock', {
    productName: product.name || 'Product',
    productUrl,
    storeUrl,
    storeName: 'Shayga',
  })
  await safeSend(payload, to, subject, html, 'back-in-stock')
}

/**
 * Sends a one-time passcode to the customer's email address.
 * Used by the login and guest-checkout OTP flow.
 */
export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  const storeName = 'Shayga'
  const subject = `Your Shayga verification code: ${otp}`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;padding:24px;background:#fafafa;border-radius:12px">
  <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">${storeName}</h2>
  <p style="margin:0 0 16px;color:#555;line-height:1.6">Use the code below to verify your identity. This code expires in 5 minutes.</p>
  <div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:20px;text-align:center;margin-bottom:16px">
    <span style="font-size:32px;font-weight:700;letter-spacing:6px;color:#1a1a1a">${otp}</span>
  </div>
  <p style="margin:0;font-size:12px;color:#999">If you didn't request this, you can safely ignore this email.</p>
</body>
</html>`

  // Lazy-load Payload to send via the configured email adapter
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    await safeSend(payload, to, subject, html, 'otp-email')
  } catch {
    // Fire-and-forget: log and continue
    console.warn('[sendOTPEmail] Could not send — email adapter may not be configured')
  }
}

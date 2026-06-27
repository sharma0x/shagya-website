// Shared HTML builders for email templates

export interface OrderAddress {
  fullName?: string | null
  phone?: string | null
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  country?: string | null
}

export interface OrderItem {
  product: unknown
  variant?: unknown
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderTotals {
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
}

export function formatINR(amount: number): string {
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function buildItemsTable(items: OrderItem[]): string {
  if (!items?.length) return ''

  const rows = items
    .map((item) => {
      const product = item.product as Record<string, unknown> | null
      const variant = item.variant as Record<string, unknown> | null
      const name = (product?.name as string) || 'Product'
      const variantLabel = variant?.name
        ? `<br><span style="font-size:12px;color:#9B8E93;">${variant.name as string}</span>`
        : ''

      return `<tr>
        <td style="padding:10px 10px 10px 0;border-bottom:1px solid #F0E8EC;font-size:14px;color:#2A1E24;">${name}${variantLabel}</td>
        <td style="padding:10px;border-bottom:1px solid #F0E8EC;font-size:14px;color:#6B5E63;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0 10px 10px;border-bottom:1px solid #F0E8EC;font-size:14px;color:#2A1E24;text-align:right;">&#8377;${formatINR(item.totalPrice)}</td>
      </tr>`
    })
    .join('')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px;">
    <tr>
      <th style="padding:6px 10px 8px 0;font-size:11px;color:#9B8E93;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;border-bottom:1px solid #E8DDE2;text-align:left;">Item</th>
      <th style="padding:6px 10px 8px;font-size:11px;color:#9B8E93;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;border-bottom:1px solid #E8DDE2;text-align:center;">Qty</th>
      <th style="padding:6px 0 8px 10px;font-size:11px;color:#9B8E93;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;border-bottom:1px solid #E8DDE2;text-align:right;">Amount</th>
    </tr>
    ${rows}
  </table>`
}

export function buildPricingTable(totals: OrderTotals): string {
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:3px 0;font-size:14px;color:#6B5E63;">${label}</td>
      <td style="padding:3px 0;font-size:14px;color:#2A1E24;text-align:right;">${value}</td>
    </tr>`

  const rows: string[] = [
    row('Subtotal', `&#8377;${formatINR(totals.subtotal)}`),
  ]
  if (totals.shipping > 0)
    rows.push(row('Shipping', `&#8377;${formatINR(totals.shipping)}`))
  if (totals.tax > 0) rows.push(row('GST', `&#8377;${formatINR(totals.tax)}`))
  if (totals.discount > 0)
    rows.push(row('Discount', `-&#8377;${formatINR(totals.discount)}`))

  const totalRow = `<tr>
    <td style="padding:10px 0 2px;font-size:15px;font-weight:600;color:#2A1E24;border-top:1px solid #E8DDE2;">Total</td>
    <td style="padding:10px 0 2px;font-size:15px;font-weight:600;color:#6B2448;text-align:right;border-top:1px solid #E8DDE2;">&#8377;${formatINR(totals.total)}</td>
  </tr>`

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 4px;">
    ${rows.join('')}${totalRow}
  </table>`
}

export function buildAddressBlock(
  addr: OrderAddress | null | undefined,
): string {
  if (!addr) return '—'

  const parts = [
    addr.fullName,
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.pincode].filter(Boolean).join(', '),
    addr.country || 'India',
    addr.phone ? `Phone: ${addr.phone}` : null,
  ].filter(Boolean) as string[]

  return parts.join('<br>')
}

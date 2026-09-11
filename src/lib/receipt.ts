import pdfmake from 'pdfmake'
import type { TDocumentDefinitions } from 'pdfmake'
import vfsFonts from 'pdfmake/build/vfs_fonts'
import { formatINR } from '@/email/builders'

// ─── Brand palette (hex approximations of the OKLCH tokens in globals.css) ──
const WINE = '#42112E'
const WINE_ACCENT = '#6B2448'
const INK = '#2A1E24'
const MUTED = '#6B5E63'
const FAINT = '#9B8E93'
const HAIRLINE = '#E8DDE2'
const SURFACE = '#F7F1F4'

export interface ReceiptAddress {
  fullName?: string | null
  phone?: string | null
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  country?: string | null
}

export interface ReceiptItem {
  id?: string | null
  product?:
    | { name?: string | null; slug?: string | null }
    | string
    | number
    | null
  colorName?: string | null
  quantity?: number | null
  unitPrice?: number | null
  totalPrice?: number | null
}

export interface ReceiptOrder {
  orderNumber?: string | null
  customerEmail?: string | null
  phone?: string | null
  status?: string | null
  subtotal?: number | null
  shipping?: number | null
  tax?: number | null
  discount?: number | null
  total?: number | null
  paymentId?: string | null
  createdAt?: string | null
  shippingType?: string | null
  shippingAddress?: ReceiptAddress | null
  billingAddress?: ReceiptAddress | null
  items?: ReceiptItem[] | null
}

const TITLE = 'SHAYGA'
const SUBTITLE = 'ORDER RECEIPT'
const SUPPORT_EMAIL = 'orders@shayga.in'
const SITE_URL = 'shayga.in'

let fontsRegistered = false

/**
 * Registers the bundled Roboto fonts into the shared pdfmake instance once.
 * Font bytes are stored in the virtual file system as plain Uint8Arrays
 * (not Node Buffers) so pdfkit's `instanceof Uint8Array` check also passes
 * inside jsdom test environments, where Buffer and Uint8Array come from
 * different realms.
 */
function ensureFonts(): void {
  if (fontsRegistered) return
  fontsRegistered = true

  for (const [filename, content] of Object.entries(vfsFonts)) {
    const bytes = Buffer.from(content, 'base64')
    pdfmake.virtualfs.writeFileSync(
      filename,
      new Uint8Array(bytes) as unknown as Buffer,
    )
  }

  pdfmake.setFonts({
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  })

  // The receipt never embeds external resources.
  pdfmake.setUrlAccessPolicy(() => false)
  pdfmake.setLocalAccessPolicy(() => false)
}

function itemName(item: ReceiptItem): string {
  const product = item.product
  if (product && typeof product === 'object' && product.name) {
    return product.name
  }
  return 'Handloom product'
}

function addressLines(addr: ReceiptAddress | null | undefined): string[] {
  if (!addr) return ['—']

  const parts: (string | null)[] = [
    addr.fullName || null,
    addr.line1 || null,
    addr.line2 || null,
    [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') || null,
    addr.country || 'India',
    addr.phone ? `Phone: ${addr.phone}` : null,
  ]
  return parts.filter((p): p is string => Boolean(p)) as string[]
}

function statusLabel(status?: string | null): string {
  if (!status) return '—'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function paymentMethodLabel(paymentId?: string | null): string {
  if (!paymentId) return '—'
  if (paymentId === 'COD') return 'Cash on Delivery'
  return 'Paid online (Razorpay)'
}

function fullWidthBand(): unknown {
  return {
    table: {
      widths: ['*'],
      body: [
        [
          {
            stack: [
              {
                text: TITLE,
                color: '#FFFFFF',
                fontSize: 24,
                bold: true,
                characterSpacing: 1,
              },
              {
                text: SUBTITLE,
                color: HAIRLINE,
                fontSize: 8,
                characterSpacing: 3,
              },
            ],
            fillColor: WINE,
            margin: [16, 14, 16, 12],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, 0, 0, 18],
  }
}

function metaField(label: string, value: string, bold = false): unknown {
  return {
    stack: [
      {
        text: label.toUpperCase(),
        fontSize: 7,
        bold: true,
        color: FAINT,
        characterSpacing: 1,
      },
      { text: value, fontSize: 10.5, bold, color: INK, margin: [0, 3, 0, 0] },
    ],
  }
}

function sectionTitle(label: string): unknown {
  return {
    text: label,
    fontSize: 8,
    bold: true,
    color: WINE_ACCENT,
    characterSpacing: 1.5,
    margin: [0, 0, 0, 6],
  }
}

function addressBlock(
  title: string,
  addr: ReceiptAddress | null | undefined,
): unknown {
  return {
    width: '*',
    stack: [
      sectionTitle(title),
      ...addressLines(addr).map((line) => ({
        text: line,
        fontSize: 9.5,
        color: MUTED,
        lineHeight: 1.35,
      })),
    ],
  }
}

function itemsTableBody(order: ReceiptOrder): unknown[][] {
  const items = order.items ?? []
  const body: unknown[][] = [
    [
      { text: 'ITEM', style: 'tableHeader' },
      { text: 'QTY', style: 'tableHeaderCenter' },
      { text: 'UNIT PRICE', style: 'tableHeaderRight' },
      { text: 'AMOUNT', style: 'tableHeaderRight' },
    ],
  ]

  items.forEach((item, index) => {
    const stack: unknown[] = [
      { text: itemName(item), fontSize: 9.5, bold: true, color: INK },
    ]
    if (item.colorName) {
      stack.push({
        text: `Color: ${item.colorName}`,
        fontSize: 8,
        color: MUTED,
      })
    }
    const fill = index % 2 === 1 ? SURFACE : '#FFFFFF'
    body.push([
      { stack, fillColor: fill, margin: [8, 6, 8, 6] },
      {
        text: String(item.quantity ?? 1),
        fontSize: 9.5,
        color: MUTED,
        alignment: 'center',
        fillColor: fill,
        margin: [0, 6, 0, 6],
      },
      {
        text: `₹${formatINR(item.unitPrice ?? 0)}`,
        fontSize: 9.5,
        color: MUTED,
        alignment: 'right',
        fillColor: fill,
        margin: [0, 6, 0, 6],
      },
      {
        text: `₹${formatINR(item.totalPrice ?? 0)}`,
        fontSize: 9.5,
        bold: true,
        color: INK,
        alignment: 'right',
        fillColor: fill,
        margin: [0, 6, 8, 6],
      },
    ])
  })

  if (items.length === 0) {
    body.push([
      {
        text: 'No items on this order.',
        fontSize: 9,
        color: FAINT,
        colSpan: 4,
        alignment: 'center',
        margin: [0, 10, 0, 10],
      },
      {},
      {},
      {},
    ])
  }

  return body
}

function totalsTable(order: ReceiptOrder): unknown {
  const rows: unknown[][] = []
  const pushRow = (
    label: string,
    value: string,
    opts: Record<string, unknown> = {},
  ) => {
    rows.push([
      {
        text: label,
        fontSize: 9.5,
        color: MUTED,
        margin: [8, 3, 0, 3],
        ...opts,
      },
      {
        text: value,
        fontSize: 9.5,
        color: INK,
        bold: Boolean(opts.bold),
        alignment: 'right',
        margin: [0, 3, 8, 3],
      },
    ])
  }

  pushRow('Bag Subtotal', `₹${formatINR(order.subtotal ?? 0)}`)
  if (order.tax && order.tax > 0) {
    pushRow('GST', `₹${formatINR(order.tax)}`)
  }
  pushRow(
    'Shipping',
    (order.shipping ?? 0) === 0 ? 'FREE' : `₹${formatINR(order.shipping ?? 0)}`,
  )
  if (order.discount && order.discount > 0) {
    pushRow('Coupon Discount', `−₹${formatINR(order.discount)}`)
  }

  rows.push([
    {
      text: 'Total Paid',
      fontSize: 11,
      bold: true,
      color: INK,
      fillColor: SURFACE,
      margin: [8, 6, 0, 6],
    },
    {
      text: `₹${formatINR(order.total ?? 0)}`,
      fontSize: 11,
      bold: true,
      color: WINE_ACCENT,
      fillColor: SURFACE,
      alignment: 'right',
      margin: [0, 6, 8, 6],
    },
  ])

  return {
    table: {
      widths: ['*', 'auto'],
      body: rows,
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, 10, 0, 0],
  }
}

/**
 * Builds the pdfmake document definition for an order receipt.
 * Pure — no side effects — so it can be unit tested in isolation.
 */
export function buildReceiptDefinition(
  order: ReceiptOrder,
): TDocumentDefinitions {
  const placedOn = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  const paymentLabel = paymentMethodLabel(order.paymentId)
  const paymentDetail =
    order.paymentId && order.paymentId !== 'COD'
      ? order.paymentId
      : paymentLabel

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    info: {
      title: `${TITLE} ${order.orderNumber ?? ''} ${SUBTITLE}`.trim(),
      author: TITLE,
    },
    defaultStyle: {
      font: 'Roboto',
      color: INK,
    },
    styles: {
      tableHeader: {
        fontSize: 7.5,
        bold: true,
        color: '#FFFFFF',
        margin: [8, 6, 0, 6],
      },
      tableHeaderCenter: {
        fontSize: 7.5,
        bold: true,
        color: '#FFFFFF',
        alignment: 'center',
        margin: [0, 6, 0, 6],
      },
      tableHeaderRight: {
        fontSize: 7.5,
        bold: true,
        color: '#FFFFFF',
        alignment: 'right',
        margin: [0, 6, 8, 6],
      },
    },
    content: [
      fullWidthBand(),

      {
        columns: [
          metaField('Order No', order.orderNumber ?? '—', true),
          metaField('Placed On', placedOn),
          metaField('Payment', paymentLabel),
          metaField('Status', statusLabel(order.status), true),
        ],
        columnGap: 14,
        margin: [0, 0, 0, 18],
      },

      {
        columns: [
          addressBlock(
            'BILLED TO',
            order.billingAddress ?? order.shippingAddress,
          ),
          addressBlock('SHIP TO', order.shippingAddress),
        ],
        columnGap: 24,
        margin: [0, 0, 0, 18],
      },

      sectionTitle('ORDERED MASTERPIECES'),

      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: itemsTableBody(order),
        },
        layout: {
          hLineWidth: () => 0.5,
          hLineColor: () => HAIRLINE,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
          fillColor: () => '#FFFFFF',
        },
        margin: [0, 0, 0, 6],
      },

      {
        columns: [
          {
            width: '*',
            stack: [
              {
                text: 'PAYMENT DETAILS',
                fontSize: 8,
                bold: true,
                color: WINE_ACCENT,
                characterSpacing: 1.5,
                margin: [0, 10, 0, 6],
              },
              {
                text: `Payment ID: ${order.paymentId ?? '—'}`,
                fontSize: 8.5,
                color: MUTED,
              },
              {
                text: `Method: ${paymentLabel}`,
                fontSize: 8.5,
                color: MUTED,
                margin: [0, 2, 0, 0],
              },
              {
                text: `Shipping: ${order.shippingType === 'express' ? 'Express' : 'Standard'}`,
                fontSize: 8.5,
                color: MUTED,
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            width: 210,
            stack: [totalsTable(order)],
          },
        ],
        columnGap: 24,
        margin: [0, 4, 0, 16],
      },

      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 0.5,
            lineColor: HAIRLINE,
          },
        ],
        margin: [0, 0, 0, 8],
      },

      {
        text: [
          { text: 'Crafted with heritage. ', fontSize: 8, color: FAINT },
          { text: 'Questions? Write to ', fontSize: 8, color: FAINT },
          { text: SUPPORT_EMAIL, fontSize: 8, color: WINE_ACCENT },
          { text: ` • ${SITE_URL}`, fontSize: 8, color: FAINT },
        ],
      },
    ],
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: 'This is a computer-generated receipt and does not require a signature.',
          fontSize: 7,
          color: FAINT,
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          fontSize: 7,
          color: FAINT,
          alignment: 'right',
        },
      ],
      margin: [40, 12, 40, 20],
    }),
  }
}

/**
 * Renders an order receipt PDF and returns the raw PDF bytes.
 */
export async function generateOrderReceiptPdf(
  order: ReceiptOrder,
): Promise<Buffer> {
  ensureFonts()
  const document = pdfmake.createPdf(buildReceiptDefinition(order))
  return document.getBuffer()
}

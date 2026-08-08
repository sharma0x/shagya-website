'use client'

import { ProductShareButton } from './ProductShareButton'

interface WhatsAppOrderButtonProps {
  phone?: string
  productName: string
  productSlug: string
  productId: string | number
  productPrice?: number
  productImage?: string
}

export function WhatsAppOrderButton(props: WhatsAppOrderButtonProps) {
  return <ProductShareButton {...props} />
}

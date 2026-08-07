'use client'

import { useState } from 'react'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductActions } from '@/components/product/ProductActions'

interface PDPClientSectionProps {
  product: any
  isOutOfStock: boolean
  children: React.ReactNode
}

export function PDPClientSection({
  product,
  isOutOfStock,
  children,
}: PDPClientSectionProps) {
  const defaultVariant = product.colorVariants?.[0]
  const defaultUrls =
    defaultVariant?.gallery?.map((g: any) =>
      typeof g.image === 'object' && g.image !== null
        ? g.image.url
        : '/images/placeholder.jpg',
    ) ?? []

  const [imageUrls, setImageUrls] = useState<string[]>(defaultUrls)

  return (
    <>
      <div className="lg:col-span-7">
        <ProductGallery imageUrls={imageUrls} productName={product.name} />
      </div>
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          {children}
          <div className="mt-7">
            <ProductActions
              product={product}
              isOutOfStock={isOutOfStock}
              onVariantChange={setImageUrls}
            />
          </div>
        </div>
      </div>
    </>
  )
}

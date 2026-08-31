'use client'

import { Fragment, useState } from 'react'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductActions } from '@/components/product/ProductActions'
import { resolveVariantIndex } from '@/lib/product-utils'

interface PDPClientSectionProps {
  product: any
  isOutOfStock: boolean
  /** Color slug from the `?color=` deep link — preselects that variant */
  initialColorSlug?: string | null
  children: React.ReactNode
  /** Rendered below the buy actions (color picker + CTAs) — e.g. trust signals */
  belowActions?: React.ReactNode
}

export function PDPClientSection({
  product,
  isOutOfStock,
  initialColorSlug,
  children,
  belowActions,
}: PDPClientSectionProps) {
  const variants = product.colorVariants ?? []
  const initialVariantIndex = resolveVariantIndex(variants, initialColorSlug)
  const defaultVariant = variants[initialVariantIndex]
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
          <div key="product-actions" className="mt-7">
            <ProductActions
              product={product}
              isOutOfStock={isOutOfStock}
              initialVariantIndex={initialVariantIndex}
              onVariantChange={setImageUrls}
            />
          </div>
          {belowActions != null && (
            <Fragment key="below-actions">{belowActions}</Fragment>
          )}
        </div>
      </div>
    </>
  )
}

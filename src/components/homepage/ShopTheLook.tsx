'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

export interface ProductHotspot {
  productName: string
  productSlug: string
  price: number
  x: number
  y: number
}

interface ShopTheLookProps {
  imageUrl: string
  headline: string
  subheading: string
  hotspots: ProductHotspot[]
  ctaText?: string
  ctaLink?: string
}

export function ShopTheLook({
  imageUrl,
  headline,
  subheading,
  hotspots,
  ctaText,
  ctaLink,
}: ShopTheLookProps) {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null)

  return (
    <section className="bg-white">
      <div className="container-page py-10 sm:py-14 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {headline}
          </h2>
          <p className="font-body mt-3 text-sm text-neutral-500 sm:text-base">
            {subheading}
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl">
          <SkeletonImage
            src={imageUrl}
            alt={headline}
            width={1200}
            height={900}
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
          />

          {hotspots.map((hotspot, i) => (
            <div
              key={i}
              className="absolute z-10"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onMouseEnter={() => setActiveHotspot(i)}
              onMouseLeave={() => setActiveHotspot(null)}
            >
              <button
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-600 shadow-lg transition-all duration-200 hover:scale-110',
                  activeHotspot === i && 'scale-110 bg-brand-500',
                )}
                aria-label={`View ${hotspot.productName}`}
              >
                <Plus
                  className={cn(
                    'h-3 w-3 text-white transition-transform duration-200',
                    activeHotspot === i && 'rotate-45',
                  )}
                />
              </button>

              <div
                className={cn(
                  'absolute left-1/2 mt-2 w-48 -translate-x-1/2 rounded-xl border border-neutral-100 bg-white p-3 shadow-lg transition-all duration-200',
                  activeHotspot === i
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-2 opacity-0',
                )}
              >
                <p className="font-display text-xs font-semibold text-neutral-900">
                  {hotspot.productName}
                </p>
                <p className="font-body mt-0.5 text-xs text-brand-700">
                  ₹{hotspot.price.toLocaleString('en-IN')}
                </p>
                <Link
                  href={`/products/${hotspot.productSlug}`}
                  className="font-display text-brand-600 hover:text-brand-700 mt-1.5 inline-block text-[11px] font-semibold"
                >
                  Shop Now →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {ctaText && ctaLink && (
          <div className="mt-8 text-center">
            <Link
              href={ctaLink}
              className="font-display text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4 transition-colors"
            >
              {ctaText}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

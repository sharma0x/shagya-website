'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { ImageZoomModal } from '@/components/product/ImageZoomModal'

interface ProductGalleryProps {
  imageUrls: string[]
  productName: string
}

export function ProductGallery({
  imageUrls,
  productName,
}: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="font-body relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-sm text-neutral-400">
        No images available
      </div>
    )
  }

  const total = imageUrls.length

  function prev() {
    setActiveIdx((i) => (i - 1 + total) % total)
  }

  function next() {
    setActiveIdx((i) => (i + 1) % total)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image — all images stacked, active one fades in */}
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-100">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute inset-0 z-20 cursor-zoom-in"
          aria-label="Zoom into image"
        />
        <div className="absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-neutral-600 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </div>
        {imageUrls.map((url, idx) => (
          <div
            key={idx}
            className="absolute inset-0"
            style={{
              opacity: idx === activeIdx ? 1 : 0,
              transition: 'opacity 380ms ease-in-out',
              zIndex: idx === activeIdx ? 1 : 0,
            }}
          >
            <SkeletonImage
              src={url}
              alt={idx === 0 ? productName : `${productName} — view ${idx + 1}`}
              fill
              priority={idx === 0}
              className="object-cover"
              unoptimized={url.startsWith('https://placehold.co')}
            />
          </div>
        ))}

        {/* Inner border overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl border border-neutral-900/5" />

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-700 opacity-0 shadow-md backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute top-1/2 right-3 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-700 opacity-0 shadow-md backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    idx === activeIdx
                      ? 'h-1.5 w-5 bg-white'
                      : 'h-1.5 w-1.5 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
      {zoomOpen && (
        <ImageZoomModal
          images={imageUrls}
          initialIndex={activeIdx}
          productName={productName}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {imageUrls.slice(0, 5).map((url, idx) => {
            const isActive = idx === activeIdx
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`focus-visible:ring-brand-500 relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'ring-brand-600 ring-2 ring-offset-1'
                    : 'opacity-55 hover:opacity-90'
                }`}
              >
                <SkeletonImage
                  src={url}
                  alt={`View ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={url.startsWith('https://placehold.co')}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

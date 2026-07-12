'use client'

import { useRef, useState, useCallback } from 'react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { ZoomIn } from 'lucide-react'

interface ProductImageZoomProps {
  imageUrl: string
  productName: string
  className?: string
}

const LENS_DIAMETER = 160
const ZOOM = 2.5
const IMG_W = 1200
const IMG_H = 1500

export function ProductImageZoom({
  imageUrl,
  productName,
  className,
}: ProductImageZoomProps) {
  const [hover, setHover] = useState(false)
  const [lensStyle, setLensStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const r = LENS_DIAMETER / 2

    // Cursor position as percentage (0-1)
    let px = (e.clientX - rect.left) / rect.width
    let py = (e.clientY - rect.top) / rect.height
    px = Math.max(0, Math.min(1, px))
    py = Math.max(0, Math.min(1, py))

    // Lens position: center on cursor, clamped to edges
    const left = Math.max(0, Math.min(rect.width - LENS_DIAMETER, px * rect.width - r))
    const top = Math.max(0, Math.min(rect.height - LENS_DIAMETER, py * rect.height - r))

    // Background position to show the magnified area
    // The lens background is the full image at zoom level,
    // positioned so the cursor area appears magnified
    const bgW = rect.width * ZOOM
    const bgH = rect.height * ZOOM
    const bgX = (px * rect.width * ZOOM) - r
    const bgY = (py * rect.height * ZOOM) - r

    setLensStyle({
      left,
      top,
      width: LENS_DIAMETER,
      height: LENS_DIAMETER,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${bgW}px ${bgH}px`,
      backgroundPosition: `-${bgX}px -${bgY}px`,
      backgroundRepeat: 'no-repeat',
    })
  }, [imageUrl])

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-2xl bg-neutral-100 ${className ?? ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: hover ? 'none' : 'zoom-in' }}
    >
      <div className="aspect-[3/4] w-full">
        <SkeletonImage
          src={imageUrl}
          alt={productName}
          fill
          className="object-cover"
          unoptimized={imageUrl.startsWith('https://placehold.co')}
          priority
        />
      </div>

      {/* Circular magnifier lens */}
      {hover && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white/70 shadow-xl"
          style={lensStyle}
        />
      )}

      {/* Hover hint */}
      <div className="pointer-events-none absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-neutral-500 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <ZoomIn className="h-4 w-4" />
      </div>
    </div>
  )
}

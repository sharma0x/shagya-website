'use client'

import { useRef, useState, useCallback } from 'react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { ZoomIn } from 'lucide-react'
import { isUnoptimizedImage } from '@/lib/image-url'

interface ProductImageZoomProps {
  imageUrl: string
  productName: string
  className?: string
}

const LENS_DIAMETER = 160
const ZOOM_HOVER = 2.5
const ZOOM_TOUCH = 3.5
const IMG_W = 1200
const IMG_H = 1500

export function ProductImageZoom({
  imageUrl,
  productName,
  className,
}: ProductImageZoomProps) {
  const [hover, setHover] = useState(false)
  const [touching, setTouching] = useState(false)
  const [lensStyle, setLensStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const updateLens = useCallback(
    (clientX: number, clientY: number, zoom: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const r = LENS_DIAMETER / 2

      // Pointer position as percentage (0-1), clamped to the image bounds
      const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

      // Lens position: center on the pointer, clamped to edges
      const left = Math.max(
        0,
        Math.min(rect.width - LENS_DIAMETER, px * rect.width - r),
      )
      const top = Math.max(
        0,
        Math.min(rect.height - LENS_DIAMETER, py * rect.height - r),
      )

      // Background image rendered at `zoom` scale, positioned so the pointer
      // area appears magnified inside the lens.
      const bgW = rect.width * zoom
      const bgH = rect.height * zoom
      const bgX = px * rect.width * zoom - r
      const bgY = py * rect.height * zoom - r

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
    },
    [imageUrl],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      updateLens(e.clientX, e.clientY, ZOOM_HOVER)
    },
    [updateLens],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return
      setTouching(true)
      updateLens(e.touches[0].clientX, e.touches[0].clientY, ZOOM_TOUCH)
    },
    [updateLens],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return
      // Prevent the page from scrolling/refreshing while dragging the image
      e.preventDefault()
      updateLens(e.touches[0].clientX, e.touches[0].clientY, ZOOM_TOUCH)
    },
    [updateLens],
  )

  const handleTouchEnd = useCallback(() => {
    setTouching(false)
  }, [])

  const lensVisible = hover || touching

  return (
    <div
      ref={containerRef}
      className={`group relative touch-none overflow-hidden rounded-2xl bg-neutral-100 ${className ?? ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ cursor: lensVisible ? 'none' : 'zoom-in' }}
    >
      <div className="aspect-[3/4] w-full">
        <SkeletonImage
          src={imageUrl}
          alt={productName}
          fill
          className="object-cover"
          unoptimized={isUnoptimizedImage(imageUrl)}
          priority
        />
      </div>

      {/* Circular magnifier lens (desktop hover + mobile drag) */}
      {lensVisible && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white/70 shadow-xl"
          style={lensStyle}
        />
      )}

      {/* Hover/drag hint */}
      <div className="pointer-events-none absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-neutral-500 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 md:opacity-100">
        <ZoomIn className="h-4 w-4" />
      </div>
    </div>
  )
}

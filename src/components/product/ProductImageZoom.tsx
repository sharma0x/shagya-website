'use client'

import { useState, useRef, useCallback } from 'react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { ZoomIn } from 'lucide-react'

interface ProductImageZoomProps {
  imageUrl: string
  productName: string
  zoomLevel?: number
  className?: string
}

const IMG_W = 1200
const IMG_H = 1500
const LENS_SIZE = 120 // px — size of the hover lens
const ZOOM = 2.5 // magnification level

export function ProductImageZoom({
  imageUrl,
  productName,
  zoomLevel = ZOOM,
  className,
}: ProductImageZoomProps) {
  const [hover, setHover] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Cursor position relative to image (0 to 1)
    let px = (e.clientX - rect.left) / rect.width
    let py = (e.clientY - rect.top) / rect.height

    // Clamp
    px = Math.max(0, Math.min(1, px))
    py = Math.max(0, Math.min(1, py))

    // Lens position (center lens on cursor, clamped to edges)
    const lensX = px * rect.width - LENS_SIZE / 2
    const lensY = py * rect.height - LENS_SIZE / 2

    setLensPos({
      x: Math.max(0, Math.min(rect.width - LENS_SIZE, lensX)),
      y: Math.max(0, Math.min(rect.height - LENS_SIZE, lensY)),
    })

    // Background position for zoom panel
    // The zoom panel shows a region of the image centered on the cursor
    const zoomedW = IMG_W * zoomLevel
    const zoomedH = IMG_H * zoomLevel

    setBgPos({
      x: px * (zoomedW - rect.width),
      y: py * (zoomedH - rect.height),
    })
  }, [zoomLevel])

  const handleMouseEnter = useCallback(() => setHover(true), [])
  const handleMouseLeave = useCallback(() => setHover(false), [])

  return (
    <div className="flex gap-3">
      {/* Main image with lens */}
      <div
        ref={containerRef}
        className={`group relative flex-1 overflow-hidden rounded-2xl bg-neutral-100 ${className ?? ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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

        {/* Lens overlay — follows cursor, shows where zoom is focused */}
        {hover && (
          <div
            className="pointer-events-none absolute border-2 border-white/80 shadow-lg"
            style={{
              left: lensPos.x,
              top: lensPos.y,
              width: LENS_SIZE,
              height: LENS_SIZE,
              background: 'rgba(255,255,255,0.15)',
            }}
          />
        )}

        {/* Zoom-in hint icon (visible when not hovering) */}
        {!hover && (
          <div className="pointer-events-none absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-neutral-500 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Zoom panel (right side) — only on desktop */}
      <div className="relative hidden flex-1 overflow-hidden rounded-2xl bg-neutral-100 lg:block">
        {hover ? (
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${IMG_W * zoomLevel}px ${IMG_H * zoomLevel}px`,
              backgroundPosition: `-${bgPos.x}px -${bgPos.y}px`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <ZoomIn className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="font-body mt-2 text-xs text-neutral-400">
                Hover over image
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

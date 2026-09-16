'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { ZoomIn } from 'lucide-react'
import { isUnoptimizedImage } from '@/lib/image-url'
import { trackImageZoom } from '@/lib/analytics'

interface ProductImageZoomProps {
  imageUrl: string
  productName: string
  /** Enables GA4 `image_zoom` events (hover + pinch). Omit to skip tracking. */
  productId?: string | number
  className?: string
}

const HOVER_SCALE = 1.7
const MAX_PINCH_SCALE = 2.75
const ZOOM_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function ProductImageZoom({
  imageUrl,
  productName,
  productId,
  className,
}: ProductImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pinchRef = useRef({ active: false, startDist: 1, startScale: 1 })
  const lastZoomEventRef = useRef(0)
  const [pinching, setPinching] = useState(false)

  /**
   * Hover-zoom fires on every mouseenter — throttle so a few hover in/out
   * cycles don't dominate the event table.
   */
  const trackZoom = useCallback(
    (mode: 'hover' | 'pinch') => {
      if (!productId) return
      const now = Date.now()
      if (now - lastZoomEventRef.current < 1200) return
      lastZoomEventRef.current = now
      trackImageZoom({
        product: { id: productId, name: productName },
        mode,
      })
    },
    [productId, productName],
  )

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    const stage = stageRef.current
    if (!el || !stage) return
    const rect = el.getBoundingClientRect()
    stage.style.transformOrigin = `${e.clientX - rect.left}px ${e.clientY - rect.top}px`
  }

  const handleMouseEnter = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    trackZoom('hover')
    stageRef.current?.style.setProperty('--zoom-scale', String(HOVER_SCALE))
  }

  const handleMouseLeave = () => {
    stageRef.current?.style.removeProperty('--zoom-scale')
  }

  useEffect(() => {
    const el = containerRef.current
    const stage = stageRef.current
    if (!el || !stage) return

    const getDistance = (touches: TouchList) =>
      Math.hypot(
        touches[1].clientX - touches[0].clientX,
        touches[1].clientY - touches[0].clientY,
      )

    const currentScale = () => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(stage).transform)
      return matrix.a || 1
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return
      const p = pinchRef.current
      p.active = true
      p.startDist = Math.max(1, getDistance(e.touches))
      p.startScale = currentScale()
      stage.style.transition = 'none'
      setPinching(true)
      trackZoom('pinch')
    }

    const onTouchMove = (e: TouchEvent) => {
      const p = pinchRef.current
      if (!p.active || e.touches.length !== 2) return
      // Two fingers are down: block page scroll + native pinch-zoom and
      // drive the zoom ourselves. Single-finger scrolling stays native.
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const scale = Math.min(
        MAX_PINCH_SCALE,
        Math.max(1, (getDistance(e.touches) / p.startDist) * p.startScale),
      )
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
      stage.style.transformOrigin = `${midX}px ${midY}px`
      stage.style.transform = `scale(${scale})`
    }

    const endPinch = () => {
      if (!pinchRef.current.active) return
      pinchRef.current.active = false
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      stage.style.transition = reduceMotion
        ? 'none'
        : `transform 500ms ${ZOOM_EASE}`
      stage.style.transform = ''
      stage.style.transformOrigin = '50% 50%'
      setPinching(false)
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) endPinch()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [trackZoom])

  return (
    <div
      ref={containerRef}
      className={`group relative cursor-zoom-in touch-pan-y overflow-hidden rounded-2xl bg-neutral-100 select-none ${className ?? ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[3/4] w-full">
        <div
          ref={stageRef}
          className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{
            transformOrigin: '50% 50%',
            transform: 'scale(var(--zoom-scale, 1))',
          }}
        >
          <SkeletonImage
            src={imageUrl}
            alt={productName}
            fill
            className="object-cover"
            unoptimized={isUnoptimizedImage(imageUrl)}
            priority
          />
        </div>
      </div>

      {/* Hover / pinch hint */}
      <div
        className={`pointer-events-none absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-neutral-500 shadow-sm backdrop-blur-sm transition-opacity duration-300 ${
          pinching ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <ZoomIn className="h-4 w-4" />
      </div>
    </div>
  )
}

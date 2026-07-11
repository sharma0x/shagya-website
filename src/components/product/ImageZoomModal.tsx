'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

interface ImageZoomModalProps {
  images: string[]
  initialIndex: number
  productName: string
  onClose: () => void
}

export function ImageZoomModal({
  images,
  initialIndex,
  productName,
  onClose,
}: ImageZoomModalProps) {
  const [activeIdx, setActiveIdx] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 })
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const total = images.length

  const resetZoom = useCallback(() => {
    setScale(1)
    setPos({ x: 0, y: 0 })
  }, [])

  const goTo = useCallback(
    (index: number) => {
      setActiveIdx(index)
      resetZoom()
    },
    [resetZoom],
  )

  const prev = useCallback(() => {
    goTo((activeIdx - 1 + total) % total)
  }, [activeIdx, total, goTo])

  const next = useCallback(() => {
    goTo((activeIdx + 1) % total)
  }, [activeIdx, total, goTo])

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  // Prevent body scroll
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = orig
    }
  }, [])

  // Mouse wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale((s) => {
      const next = s - e.deltaY * 0.001
      return Math.max(1, Math.min(4, next))
    })
    // Zoom toward cursor position
    setPos((p) => {
      if (scale <= 1 && e.deltaY > 0) return { x: 0, y: 0 }
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return p
      const mx = e.clientX - rect.left - rect.width / 2
      const my = e.clientY - rect.top - rect.height / 2
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      return { x: p.x * factor + mx * 0.1, y: p.y * factor + my * 0.1 }
    })
  }, [scale])

  // Mouse drag to pan
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return
      setDragging(true)
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        posX: pos.x,
        posY: pos.y,
      }
    },
    [scale, pos],
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return
      setPos({
        x: dragStart.current.posX + e.clientX - dragStart.current.x,
        y: dragStart.current.posY + e.clientY - dragStart.current.y,
      })
    },
    [dragging],
  )

  const onMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  // Touch handlers for pinch zoom + drag
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        pinchStart.current = { dist: Math.hypot(dx, dy), scale }
      } else if (e.touches.length === 1) {
        setDragging(true)
        dragStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          posX: pos.x,
          posY: pos.y,
        }
      }
    },
    [scale, pos],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchStart.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const newDist = Math.hypot(dx, dy)
        const newScale = Math.max(1, Math.min(4, pinchStart.current.scale * (newDist / pinchStart.current.dist)))
        setScale(newScale)
      } else if (e.touches.length === 1 && dragging) {
        setPos({
          x: dragStart.current.posX + e.touches[0].clientX - dragStart.current.x,
          y: dragStart.current.posY + e.touches[0].clientY - dragStart.current.y,
        })
      }
    },
    [dragging],
  )

  const onTouchEnd = useCallback(() => {
    setDragging(false)
    pinchStart.current = null
  }, [])

  // Double-click to zoom toggle
  const onDoubleClick = useCallback(() => {
    setScale((s) => (s > 1 ? 1 : 2))
    setPos({ x: 0, y: 0 })
  }, [])

  return (
    <div
      className="fixed inset-0 z-[130] flex flex-col bg-neutral-950/95 backdrop-blur-sm"
      role="dialog"
      aria-label="Image zoom"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-body text-sm text-white/60">
          {activeIdx + 1} / {total}
        </span>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close zoom"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={onDoubleClick}
        style={{ cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-out' }}
      >
        <div
          className="flex h-full w-full items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          }}
        >
          <SkeletonImage
            src={images[activeIdx]}
            alt={`${productName} — image ${activeIdx + 1}`}
            width={1200}
            height={1500}
            className="max-h-full max-w-full object-contain select-none"
            unoptimized={images[activeIdx]?.startsWith('https://placehold.co')}
            priority
          />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-center gap-4 px-4 py-3">
        <button
          onClick={prev}
          className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`rounded-full transition-all duration-200 ${
                idx === activeIdx
                  ? 'h-1.5 w-5 bg-white'
                  : 'h-1.5 w-1.5 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

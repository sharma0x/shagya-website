'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export interface HeroImage {
  src: string
  alt: string
  caption?: string
  region?: string
}

interface HeroGalleryProps {
  images: HeroImage[]
}

// Each panel cycles on its own rhythm so they rarely change together
const DURATIONS: [number, number, number] = [8000, 6200, 9500]
// Starting image index per panel — ensures all three open on different sarees
const START_OFFSETS: [number, number, number] = [0, 1, 2]

export function HeroGallery({ images }: HeroGalleryProps) {
  const count = Math.max(images.length, 1)

  const [indices, setIndices] = useState<[number, number, number]>([
    START_OFFSETS[0] % count,
    START_OFFSETS[1] % count,
    START_OFFSETS[2] % count,
  ])

  // Start true to avoid hydration mismatch — real value set in effect
  const [reducedMotion, setReducedMotion] = useState(true)
  const timersRef = useRef<(ReturnType<typeof setTimeout> | null)[]>([
    null,
    null,
    null,
  ])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    // Need at least 4 images to guarantee each panel always holds a unique index
    // while still being able to advance. With our 6-image minimum this is always true.
    if (reducedMotion || count <= 3) return

    function schedule(panelIdx: 0 | 1 | 2) {
      timersRef.current[panelIdx] = setTimeout(() => {
        setIndices((prev) => {
          // Indices currently shown in the *other* two panels
          const occupied = new Set(
            ([0, 1, 2] as const)
              .filter((p) => p !== panelIdx)
              .map((p) => prev[p]),
          )
          // Walk forward until we find an index no other panel is showing
          let next = (prev[panelIdx] + 1) % count
          let guard = 0
          while (occupied.has(next) && guard < count) {
            next = (next + 1) % count
            guard++
          }
          const result = [...prev] as [number, number, number]
          result[panelIdx] = next
          return result
        })
        schedule(panelIdx)
      }, DURATIONS[panelIdx])
    }

    schedule(0)
    schedule(1)
    schedule(2)

    return () => {
      timersRef.current.forEach((t) => t && clearTimeout(t))
      timersRef.current = [null, null, null]
    }
  }, [reducedMotion, count])

  const fadeDuration = reducedMotion ? '0ms' : '900ms'

  // Renders a single panel: all images stacked, active one is opaque.
  // Crossfade is pure CSS opacity — no layout shift, no remounting.
  function panel(panelIdx: 0 | 1 | 2, className = '') {
    const activeIdx = indices[panelIdx]
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-neutral-100 ${className}`}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              opacity: i === activeIdx ? 1 : 0,
              transition: `opacity ${fadeDuration} ease-in-out`,
              zIndex: i === activeIdx ? 1 : 0,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
              unoptimized={img.src.startsWith('https://placehold.co')}
              priority={panelIdx === 0 && i === 0}
            />
            {/* Subtle warp-grain texture overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0 3px, oklch(0.13 0.04 346) 3px 4px)',
              }}
            />
            {/* Caption */}
            {(img.caption || img.region) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/65 to-transparent p-5">
                {img.caption && (
                  <p className="font-display text-sm font-semibold text-white drop-shadow-sm">
                    {img.caption}
                  </p>
                )}
                {img.region && (
                  <p className="font-body mt-0.5 text-[11px] text-white/75">
                    {img.region}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* ── Mobile: single tall panel ── */}
      <div className="lg:hidden">
        {panel(0, 'aspect-[4/5] w-full shadow-xl')}
      </div>

      {/* ── Desktop: asymmetric 3-panel mosaic ── */}
      {/*
        Layout (right half of hero grid):
          ┌──────────────┬──────────┐
          │              │  Panel B │
          │   Panel A    │ (top rt) │
          │  (tall left) ├──────────┤
          │              │  Panel C │
          │              │ (bot rt) │
          └──────────────┴──────────┘
      */}
      <div
        className="hidden lg:grid"
        style={{
          gridTemplateColumns: '57% 43%',
          gridTemplateRows: '1fr 1fr',
          gap: '10px',
          aspectRatio: '4 / 5',
        }}
      >
        {/* Panel A — tall, left, spans both rows */}
        <div style={{ gridRow: '1 / span 2', gridColumn: '1' }}>
          {panel(0, 'h-full w-full shadow-xl')}
        </div>
        {/* Panel B — top right */}
        {panel(1, 'h-full w-full shadow-md')}
        {/* Panel C — bottom right */}
        {panel(2, 'h-full w-full shadow-md')}
      </div>

      {/* Decorative zari hairline below the mosaic */}
      <div className="rule-gold absolute -inset-x-3 -bottom-3 hidden h-px md:block" />
    </div>
  )
}

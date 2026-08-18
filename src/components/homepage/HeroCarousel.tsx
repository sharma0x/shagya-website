'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

export interface HeroSlide {
  imageUrl: string
  link: string
}

interface HeroCarouselProps {
  slides: HeroSlide[]
  heading?: string
  tagline?: string
}

export function HeroCarousel({
  slides,
  heading = 'Shayga',
  tagline = 'Handwoven narratives from Varanasi',
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const goTo = useCallback((index: number) => {
    setCurrent(index)
  }, [])

  useEffect(() => {
    if (paused || slides.length <= 1) return

    intervalRef.current = setInterval(advance, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, slides.length, advance])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrent((prev) => (prev + 1) % slides.length)
      } else {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
      }
    }
  }

  if (!slides.length) return null

  return (
    <section className="motion-safe:select-none" aria-label="Featured weaves">
      {/* Brand heading — centered wordmark with hairline underline */}
      <div className="container-page pt-10 pb-6 text-center sm:pt-14 sm:pb-8">
        <h1 className="font-display text-hero text-brand-950 font-bold tracking-tight">
          {heading}
        </h1>
        <div
          className="bg-gold-400 mx-auto mt-4 h-px w-24 sm:mt-5 sm:w-28"
          aria-hidden="true"
        />
        <p className="text-brand-700/60 font-body mt-4 text-sm tracking-wide sm:text-base">
          {tagline}
        </p>
      </div>

      {/* Image carousel — text-free, each slide links out */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="group"
        aria-roledescription="carousel"
      >
        <div className="relative aspect-[4/5] sm:aspect-[21/9] md:aspect-[21/8]">
          {slides.map((slide, i) => (
            <Link
              key={i}
              href={slide.link || '/'}
              className={cn(
                'absolute inset-0 cursor-pointer transition-opacity duration-700 ease-out',
                i === current ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden={i !== current}
              aria-label={`View featured weave ${i + 1} of ${slides.length}`}
              tabIndex={i === current ? 0 : -1}
            >
              <SkeletonImage
                src={slide.imageUrl}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
                priority={i === 0}
              />
            </Link>
          ))}
        </div>

        {slides.length > 1 && (
          <div
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            role="tablist"
            aria-label="Slide navigation"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === current
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/70',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

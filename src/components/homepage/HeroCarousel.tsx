'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

export interface HeroSlide {
  imageUrl: string
  heading: React.ReactNode
  subheading: string
  ctaText: string
  ctaLink: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
}

interface HeroCarouselProps {
  slides: HeroSlide[]
  brandingTag?: string
}

export function HeroCarousel({ slides, brandingTag = 'Shayga Handlooms' }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index)
    },
    []
  )

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
    <section
      className="relative overflow-hidden motion-safe:select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured Collections"
    >
      <div className="relative aspect-[4/5] sm:aspect-[21/9] md:aspect-[21/8]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
            aria-hidden={i !== current}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${slides.length}`}
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />
          </div>
        ))}

        <div className="container-page relative flex h-full items-center">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-white/70 uppercase">
              <span className="bg-brand-400 h-px w-6" />
              {brandingTag}
            </div>

            <h1 className="font-display text-3xl leading-[1.1] font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {slides[current].heading}
            </h1>

            <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-white/80 sm:text-base">
              {slides[current].subheading}
            </p>

            <div className="mt-5 flex flex-row flex-wrap items-center gap-3">
              <Link
                href={slides[current].ctaLink}
                className="group bg-brand-600 hover:bg-brand-500 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all active:scale-[0.97]"
              >
                {slides[current].ctaText}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              {slides[current].secondaryCtaText && (
                <Link
                  href={slides[current].secondaryCtaLink || '/about'}
                  className="group text-brand-950 inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/90 px-5 text-sm font-semibold shadow-sm transition-all hover:bg-white active:scale-[0.97]"
                >
                  {slides[current].secondaryCtaText}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>

            <div className="mt-6 flex items-center gap-5 text-xs text-white/60">
              <div>
                <span className="font-display block text-base font-semibold text-white">
                  6
                </span>
                <span className="text-[10px]">Weaving clusters</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="font-display block text-base font-semibold text-white">
                  10+
                </span>
                <span className="text-[10px]">Traditional weaves</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="font-display block text-base font-semibold text-white">
                  100%
                </span>
                <span className="text-[10px]">Maker-traced</span>
              </div>
            </div>
          </div>
        </div>
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
                i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}

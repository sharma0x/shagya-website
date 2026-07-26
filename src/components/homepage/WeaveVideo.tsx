import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface WeaveVideoProps {
  headline?: string
  subheading?: string
  ctaText?: string
  ctaLink?: string
}

export function WeaveVideo({
  headline = 'Every saree has a maker. Meet yours.',
  subheading = 'Watch a master weaver at the loom — each thread placed by hand, each motif a memory passed down through generations.',
  ctaText = 'Explore the craft',
  ctaLink = '/about',
}: WeaveVideoProps) {
  return (
    <section className="bg-neutral-950">
      <div className="px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-md text-center">
          <span className="font-display text-gold-300 text-[10px] font-semibold tracking-[0.2em] uppercase">
            The Craft
          </span>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {headline}
          </h2>
          <p className="font-body mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            {subheading}
          </p>

          <div className="mt-6 flex items-center gap-5 border-t border-neutral-800 pt-6 text-xs text-neutral-500">
            <div>
              <span className="font-display block text-base font-semibold text-white">
                6
              </span>
              <span>Weaving clusters</span>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div>
              <span className="font-display block text-base font-semibold text-white">
                +10
              </span>
              <span>Weave types</span>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div>
              <span className="font-display block text-base font-semibold text-white">
                +30
              </span>
              <span>Artisan families</span>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={ctaLink}
              className="group bg-gold-300 hover:bg-gold-200 inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-neutral-950 transition-all active:scale-[0.97]"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

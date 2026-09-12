import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton rounded-md', className)} aria-hidden="true" />
  )
}

export function SkeletonText({
  lines = 2,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3',
            i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full',
          )}
        />
      ))}
    </div>
  )
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg bg-white',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="aspect-[3/4] w-full rounded-t-lg rounded-b-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-4 w-1/3" />
      </div>
    </div>
  )
}

export function CategoryCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-neutral-100',
        className,
      )}
      aria-hidden="true"
    >
      <div className="skeleton aspect-[4/5] w-full sm:aspect-square" />
      <div className="absolute right-0 bottom-0 left-0 p-4 sm:p-5">
        <Skeleton className="h-5 w-24 bg-white/40 sm:h-6 sm:w-28" />
      </div>
    </div>
  )
}

export function CollectionCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function CollectionsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BlogPostSkeleton() {
  return (
    <div className="flex items-center gap-5 py-6" aria-hidden="true">
      <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="mt-4 h-4 w-24" />
      </div>
    </div>
  )
}

export function BlogIndexGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * HeroSkeleton matches the full-width HeroCarousel banner layout.
 */
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <section
      className={cn('motion-safe:select-none', className)}
      aria-label="Loading featured weaves"
      aria-hidden="true"
    >
      <div className="relative overflow-hidden">
        <div className="skeleton relative aspect-[21/9] w-full md:aspect-[21/8]" />
        {/* Placeholder for carousel indicator dots */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          <div className="h-2 w-6 rounded-full bg-white/70 shadow-xs" />
          <div className="h-2 w-2 rounded-full bg-white/40 shadow-xs" />
          <div className="h-2 w-2 rounded-full bg-white/40 shadow-xs" />
        </div>
      </div>
    </section>
  )
}

export function CategoryHeaderSkeleton() {
  return (
    <>
      <div className="inline-flex items-center gap-1.5">
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="mt-8 border-b border-neutral-200 pb-10">
        <Skeleton className="h-10 w-48 md:h-12 md:w-64" />
        <Skeleton className="mt-4 h-4 w-full max-w-md" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-sm" />
      </div>
    </>
  )
}

/**
 * ProductGallerySkeleton matches ProductGallery (main image + 5 thumbnails grid).
 */
export function ProductGallerySkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-[460px] flex-col gap-3"
      aria-hidden="true"
    >
      {/* Main Image */}
      <div className="overflow-hidden rounded-2xl bg-neutral-100">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      </div>
      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/**
 * ProductInfoSkeleton matches PDP details column layout.
 */
export function ProductInfoSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Brand / Weave tags */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-28 rounded-md" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-4/5" />
      </div>

      {/* Pricing */}
      <div className="space-y-2 border-b border-neutral-100 pb-5">
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Color swatches */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-full" />
          ))}
        </div>
      </div>

      {/* Actions / Buttons */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Details accordion */}
      <div className="space-y-4 border-t border-neutral-100 pt-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

export function CheckoutLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header navigation skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Steps display skeleton */}
        <div className="mx-auto mb-10 flex max-w-md items-center justify-center gap-4 sm:gap-8">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Form Fields */}
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
              <Skeleton className="mb-6 h-6 w-48" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="mt-4 h-12 w-full rounded-xl" />
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
              <Skeleton className="mb-6 h-6 w-40" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-xs">
              <Skeleton className="mb-6 h-6 w-32" />
              <div className="space-y-4 border-b border-neutral-100 pb-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-20 w-16 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="mt-2 h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 py-6">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between pt-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SectionHeaderSkeleton({
  align = 'left',
  size = 'default',
}: {
  align?: 'left' | 'center'
  size?: 'default' | 'sm'
}) {
  return (
    <div
      className={cn(size === 'sm' ? 'mb-4' : 'mb-8 md:mb-12')}
      aria-hidden="true"
    >
      <div
        className={cn(
          'bg-brand-600/30 mb-3 h-px w-10',
          align === 'center' ? 'mx-auto' : 'mx-auto sm:mx-0',
        )}
      />
      <div
        className={cn(
          'flex flex-col gap-1',
          align === 'center'
            ? 'items-center text-center'
            : 'items-center sm:flex-row sm:items-start sm:justify-between',
        )}
      >
        <Skeleton
          className={cn(
            size === 'sm' ? 'h-6 w-36 md:w-44' : 'h-8 w-48 md:h-10 md:w-64',
          )}
        />
        {align !== 'center' && (
          <Skeleton className="hidden h-4 w-20 sm:block" />
        )}
      </div>
      <Skeleton
        className={cn(
          'mt-2 h-4 w-72 max-w-full',
          align === 'center' ? 'mx-auto' : 'mx-auto sm:mx-0',
        )}
      />
    </div>
  )
}

export function ProductSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="bg-brand-50/20" aria-hidden="true">
      <div className="container-page py-6 sm:py-8 md:py-10">
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function ReviewsSkeleton() {
  return (
    <div className="space-y-6 py-8" aria-hidden="true">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function OffersSkeleton() {
  return (
    <div
      className="space-y-3 rounded-2xl border border-amber-200/60 bg-amber-50/30 p-5"
      aria-hidden="true"
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  )
}

export function CategoriesGridSkeleton() {
  return (
    <section className="bg-white" aria-hidden="true">
      <div className="container-page py-6 sm:py-8 md:py-10">
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function SpotlightsGridSkeleton() {
  return (
    <section className="bg-white" aria-hidden="true">
      <div className="container-page py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
          {[1, 2, 3].map((col) => (
            <div key={col} className="space-y-4">
              <SectionHeaderSkeleton size="sm" />
              <div className="grid grid-cols-2 gap-2">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BlogGridSkeleton() {
  return (
    <section className="bg-white" aria-hidden="true">
      <div className="container-page py-6 sm:py-8 md:py-10">
        <SectionHeaderSkeleton />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-2xl border border-neutral-100 p-5"
            >
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

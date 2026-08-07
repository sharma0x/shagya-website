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

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <div className="mt-4 space-y-2 px-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-4 w-1/3" />
      </div>
    </div>
  )
}

export function CategoryCardSkeleton() {
  return <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
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

export function HeroSkeleton() {
  return (
    <div
      className="relative flex aspect-[4/5] w-full items-center overflow-hidden bg-neutral-100/50 sm:aspect-[21/9] md:aspect-[21/8]"
      aria-hidden="true"
    >
      <div className="container-page relative flex h-full w-full items-center">
        <div className="w-full max-w-xl">
          {/* Tag skeleton */}
          <div className="mb-3 flex items-center gap-2">
            <Skeleton className="h-px w-6" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Heading skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/4 sm:h-12 md:h-14 lg:w-4/5" />
            <Skeleton className="h-10 w-2/3 sm:h-12 md:h-14 lg:w-3/5" />
          </div>

          {/* Subheading skeleton */}
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>

          {/* Buttons skeleton */}
          <div className="mt-6 flex flex-row flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-40 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>

          {/* Stats skeleton */}
          <div className="mt-8 flex items-center gap-5">
            <div className="space-y-1">
              <Skeleton className="h-5 w-6" />
              <Skeleton className="h-2 w-20" />
            </div>
            <div className="h-8 w-px bg-neutral-200/50" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-2 w-20" />
            </div>
            <div className="h-8 w-px bg-neutral-200/50" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
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

export function ProductGallerySkeleton() {
  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row" aria-hidden="true">
      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="aspect-[3/4] w-20 shrink-0 rounded-lg lg:w-full"
          />
        ))}
      </div>
      {/* Main Image */}
      <Skeleton className="aspect-[3/4] w-full flex-1 rounded-2xl" />
    </div>
  )
}

export function ProductInfoSkeleton() {
  return (
    <div className="space-y-8" aria-hidden="true">
      {/* Title & Price */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full rounded-lg lg:h-10" />
          <Skeleton className="h-8 w-3/4 rounded-lg lg:h-10" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Variant Selection */}
      <div className="space-y-4 py-4">
        <Skeleton className="h-5 w-48" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>

      {/* Details accordion */}
      <div className="space-y-4 pt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-neutral-100 pb-4">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        ))}
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

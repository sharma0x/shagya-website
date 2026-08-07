import {
  ProductCardSkeleton,
  HeroSkeleton,
  Skeleton,
} from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="bg-surface min-h-screen pb-12">
      <HeroSkeleton />

      <div className="container mx-auto px-4 py-12 md:py-16 lg:px-8">
        {/* Section title skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

import {
  ProductGallerySkeleton,
  ProductInfoSkeleton,
  Skeleton,
} from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="bg-surface min-h-screen py-12 md:py-16">
      <div className="container-page">
        {/* Back Link Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
        </div>

        {/* PDP Main Grid */}
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <ProductGallerySkeleton />
          </div>
          <div className="lg:col-span-5">
            <ProductInfoSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

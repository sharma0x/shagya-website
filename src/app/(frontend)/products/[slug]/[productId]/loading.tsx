import {
  ProductGallerySkeleton,
  ProductInfoSkeleton,
  Skeleton,
} from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <ProductGallerySkeleton />
          <ProductInfoSkeleton />
        </div>
      </div>
    </div>
  )
}

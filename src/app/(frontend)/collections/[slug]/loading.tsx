import {
  CategoryHeaderSkeleton,
  ProductCardSkeleton,
  Skeleton,
} from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="bg-surface min-h-screen py-10">
      <div className="container-page">
        <CategoryHeaderSkeleton />
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Sidebar skeleton for desktop */}
          <div className="hidden w-64 shrink-0 space-y-6 lg:block">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-8 h-6 w-3/4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="flex-1 space-y-6">
            <div className="mb-6 flex justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

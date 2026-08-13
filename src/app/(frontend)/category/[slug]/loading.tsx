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
          {/* Sidebar skeleton for desktop — w-48 matches the real filter sidebar */}
          <div className="hidden w-48 shrink-0 space-y-6 lg:block">
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

          {/* Product grid skeleton — matches the real product grid layout */}
          <div className="flex-1 space-y-6">
            <div className="mb-6 flex justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

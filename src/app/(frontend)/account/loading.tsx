import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-12">
          {/* Sidebar skeleton */}
          <div className="hidden space-y-4 pt-2 lg:col-span-1 lg:block">
            <Skeleton className="mb-6 h-6 w-32" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-40" />
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="space-y-8 lg:col-span-3">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

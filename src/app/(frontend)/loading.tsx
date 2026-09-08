import {
  HeroSkeleton,
  CategoriesGridSkeleton,
  SpotlightsGridSkeleton,
  ProductSectionSkeleton,
} from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen overflow-hidden pb-12">
      <HeroSkeleton />
      <CategoriesGridSkeleton />
      <SpotlightsGridSkeleton />
      <ProductSectionSkeleton count={4} />
    </div>
  )
}

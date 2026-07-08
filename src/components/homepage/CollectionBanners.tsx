import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

export interface CollectionBannerData {
  title: string
  subtitle: string
  imageUrl: string
  link: string
}

interface CollectionBannersProps {
  banners: CollectionBannerData[]
  headline?: string
  subheading?: string
}

export function CollectionBanners({
  banners,
  headline = 'Curated Collections',
  subheading = 'Discover sarees handpicked for every moment',
}: CollectionBannersProps) {
  if (!banners.length) return null

  return (
    <section className="bg-white">
      <div className="container-page py-10 sm:py-14 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {headline}
          </h2>
          <p className="font-body mt-3 text-sm text-neutral-500 sm:text-base">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {banners.map((banner) => (
            <Link
              key={banner.title}
              href={banner.link}
              className="group relative overflow-hidden rounded-2xl bg-neutral-100"
            >
              <div className="aspect-[4/5] sm:aspect-[3/4] md:aspect-[16/10]">
                <SkeletonImage
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6">
                  <h3 className="font-display text-lg font-semibold text-white sm:text-xl">
                    {banner.title}
                  </h3>
                  <p className="font-body mt-1 text-xs text-white/70 sm:text-sm">
                    {banner.subtitle}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/80 sm:text-sm">
                    Explore
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

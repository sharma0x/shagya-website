import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { CollectionsGridSkeleton } from '@/components/ui/Skeleton'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isUnoptimizedImage } from '@/lib/image-url'

function ImagePanel({
  src,
  alt,
  className,
  rounded = 'rounded-2xl',
}: {
  src: string
  alt: string
  className?: string
  rounded?: string
}) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${rounded} ${className ?? ''}`}
    >
      <SkeletonImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        unoptimized={isUnoptimizedImage(src)}
      />
      {/* subtle texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 3px, oklch(0.13 0.04 346) 3px 4px)',
        }}
      />
    </div>
  )
}

// No DB access at build time — must render dynamically
export const dynamic = 'force-dynamic'

async function CollectionsList() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'collections',
    limit: 100,
    depth: 1,
    sort: 'name',
  })
  const dbCollections = result.docs as any[]

  const collectionsWithCovers = dbCollections.map((col) => {
    let coverImage = '/images/products/saree-01.jpg'
    if (col.image && typeof col.image === 'object') {
      coverImage = col.image.sizes?.card?.url || col.image.url || coverImage
    }
    return {
      ...col,
      coverImage,
    }
  })

  if (collectionsWithCovers.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-2xl border border-neutral-100 bg-white py-16 text-center shadow-xs">
        <p className="font-body text-sm text-neutral-500">
          No collections available at this time.
        </p>
        <Link
          href="/"
          className="font-display text-brand-700 hover:text-brand-800 mt-4 inline-block text-xs font-semibold underline"
        >
          Return Home
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {collectionsWithCovers.map((col) => (
        <Link
          key={col.id}
          href={`/collections/${col.slug}`}
          className="group block overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <ImagePanel
            src={col.coverImage}
            alt={col.name}
            className="aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-[1.02]"
            rounded="rounded-none"
          />
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display group-hover:text-brand-700 text-xl font-semibold text-neutral-900 transition-colors">
                {col.name}
              </h3>
              <span className="group-hover:bg-brand-50 group-hover:text-brand-700 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
            <p className="font-body mt-2 text-sm leading-relaxed text-neutral-500">
              {col.description || 'Explore the curated selection.'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function CollectionsPage() {
  return (
    <div className="bg-surface min-h-screen py-12">
      <div className="container-page">
        {/* Back Link */}
        <Link
          href="/"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mt-8 border-b border-neutral-200 pb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            Our Collections
          </h1>
          <p className="font-body mt-4 max-w-3xl text-base leading-relaxed text-neutral-500">
            Curated narratives woven in silk and cotton. Explore heritage
            weavers, seasonal edits, and festive selections.
          </p>
        </div>

        {/* Collections list */}
        <Suspense fallback={<CollectionsGridSkeleton />}>
          <CollectionsList />
        </Suspense>
      </div>
    </div>
  )
}

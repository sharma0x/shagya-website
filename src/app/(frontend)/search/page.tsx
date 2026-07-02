import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProductCard } from '@/components/product/ProductCard'

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

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
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover"
        unoptimized={src.startsWith('https://placehold.co')}
      />
    </div>
  )
}

interface FTSProductResult {
  id: number
  type: 'product'
  name: string
  slug: string
  basePrice: number | null
  compareAtPrice: number | null
  fabric: string | null
  weave: string | null
  rank: number
}

interface FTSPostResult {
  id: number
  type: 'post'
  title: string
  slug: string
  excerpt: string | null
  rank: number
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  const payload = await getPayload({ config })
  let products: FTSProductResult[] = []
  let posts: FTSPostResult[] = []

  if (q.trim()) {
    const limit = 50
    const result = await payload.find({
      collection: 'search',
      where: {
        title: {
          like: q,
        },
      },
      limit,
      depth: 1,
    })

    const docs = result.docs
      .filter(
        (d: any) =>
          d.doc &&
          typeof d.doc.value === 'object' &&
          ['products', 'posts'].includes(d.doc.relationTo),
      )
      .map((d: any, index: number) => {
        const type = d.doc.relationTo === 'products' ? 'product' : 'post'
        const docValue = d.doc.value

        if (type === 'product') {
          return {
            id: docValue.id,
            type: 'product',
            name: docValue.name,
            slug: docValue.slug,
            basePrice: docValue.basePrice || null,
            compareAtPrice: docValue.compareAtPrice || null,
            fabric:
              typeof docValue.fabric === 'object'
                ? docValue.fabric?.title
                : docValue.fabric,
            weave: docValue.weave,
            rank: d.priority || limit - index,
          } as FTSProductResult
        }

        return {
          id: docValue.id,
          type: 'post',
          title: docValue.title,
          slug: docValue.slug,
          excerpt: docValue.excerpt,
          rank: d.priority || limit - index,
        } as FTSPostResult
      })
      .sort((a, b) => b.rank - a.rank)

    products = docs.filter((d): d is FTSProductResult => d.type === 'product')
    posts = docs.filter((d): d is FTSPostResult => d.type === 'post')
  }

  const hasResults = products.length > 0 || posts.length > 0

  return (
    <div className="bg-surface min-h-screen py-10">
      <div className="container-page">
        {/* Back Link */}
        <Link
          href="/"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Search Header */}
        <div className="mt-8 border-b border-neutral-200 pb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            Search Results
          </h1>
          <p className="font-body mt-4 text-base text-neutral-500">
            {q.trim()
              ? `Showing results for "${q}"`
              : 'Enter a search query to browse sarees.'}
          </p>

          <form
            action="/search"
            method="GET"
            className="mt-8 flex max-w-md gap-3"
          >
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by fabric, weave, occasion..."
              className="font-body focus:border-brand-500 h-12 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 font-display inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {q.trim() && (
          <div className="mt-10">
            {!hasResults ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="font-display text-lg font-semibold text-neutral-800">
                  No results found
                </h3>
                <p className="font-body mt-2 text-sm text-neutral-500">
                  We couldn&apos;t find anything matching your search terms. Try
                  searching for &quot;Silk&quot;, &quot;Banarasi&quot;, or
                  &quot;Cotton&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Sarees */}
                {products.length > 0 && (
                  <section>
                    <h2 className="font-display text-gold-600 mb-6 text-xs font-semibold tracking-[0.18em] uppercase">
                      Sarees ({products.length})
                    </h2>
                    <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
                      {products.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          variant="grid"
                          showWishlist
                          showActions
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Journal */}
                {posts.length > 0 && (
                  <section>
                    <div className="rule-gold mb-6" />
                    <h2 className="font-display text-gold-600 mb-6 text-xs font-semibold tracking-[0.18em] uppercase">
                      Journal ({posts.length})
                    </h2>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {posts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group block"
                        >
                          <p className="font-display group-hover:text-brand-700 text-base font-semibold text-neutral-900 transition-colors">
                            {post.title}
                          </p>
                          {post.excerpt && (
                            <p className="font-body mt-2 line-clamp-2 text-sm text-neutral-500">
                              {post.excerpt}
                            </p>
                          )}
                          <p className="font-display text-brand-700 mt-3 text-xs font-medium">
                            Read article →
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

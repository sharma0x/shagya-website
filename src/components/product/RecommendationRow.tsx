import Link from 'next/link'
import Image from 'next/image'

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

interface RecommendationProduct {
  id: number | string
  name: string
  slug?: string | null
  basePrice: number
  compareAtPrice?: number | null
  weave?: string | null
  fabric?: string | null
  gallery?: any
}

interface RecommendationRowProps {
  title: string
  products: any[]
  className?: string
}

export function RecommendationRow({
  title,
  products,
  className,
}: {
  title: string
  products: any[]
  className?: string
}) {
  if (products.length === 0) return null

  return (
    <section className={className}>
      <h2 className="font-display text-lg font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((p) => {
          const imageUrl =
            p.gallery?.[0]?.image && typeof p.gallery[0].image === 'object'
              ? p.gallery[0].image.sizes?.card?.url ||
                p.gallery[0].image.url
              : ph(600, 800, '69254e', 'f5e8ee', p.name)

          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group w-40 shrink-0"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                <Image
                  src={imageUrl || ''}
                  alt={p.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                  unoptimized={imageUrl?.startsWith('https://placehold.co')}
                />
              </div>
              <div className="mt-3 px-0.5">
                <p className="font-display group-hover:text-brand-700 line-clamp-2 text-xs font-semibold text-neutral-900 transition-colors">
                  {p.name}
                </p>
                <p className="font-body mt-0.5 text-[10px] text-neutral-400">
                  {p.weave} · {p.fabric}
                </p>
                <div className="font-display text-brand-700 mt-1.5 text-xs font-semibold">
                  <span>₹{p.basePrice.toLocaleString('en-IN')}</span>
                  {p.compareAtPrice && p.compareAtPrice > p.basePrice && (
                    <span className="ml-1.5 text-[10px] font-normal text-neutral-400 line-through">
                      ₹{p.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

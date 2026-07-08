import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

export interface WeaveInfo {
  name: string
  origin: string
  description: string
  feature: string
  imageUrl: string
  link: string
}

interface WeaveLibraryProps {
  weaves?: WeaveInfo[]
  headline?: string
  subheading?: string
}

const DEFAULT_WEAVES: WeaveInfo[] = [
  {
    name: 'Banarasi',
    origin: 'Varanasi, Uttar Pradesh',
    description:
      'Known for its opulent gold and silver brocade work, Banarasi silk sarees are a bridal essential. Each piece takes 15-45 days to weave by hand.',
    feature: 'Fine zari brocade with Mughal-inspired floral motifs',
    imageUrl: '/images/hero/hero-main.png',
    link: '/category/banarasi',
  },
  {
    name: 'Chanderi',
    origin: 'Chanderi, Madhya Pradesh',
    description:
      'Lightweight and sheer, Chanderi sarees blend silk and cotton for an ethereal drape. Their transparency and glossy texture make them unique.',
    feature: 'Sheer texture with coin-sized buttis and gold borders',
    imageUrl: '/images/hero/hero-main.png',
    link: '/category/chanderi',
  },
  {
    name: 'Kanjeevaram',
    origin: 'Kanchipuram, Tamil Nadu',
    description:
      'The queen of silks. Kanjeevaram sarees are prized for their durability, rich texture, and contrasting borders. Temple motifs are a signature.',
    feature: 'Heavy pure mulberry silk with temple border design',
    imageUrl: '/images/hero/hero-main.png',
    link: '/category/kanchipuram',
  },
  {
    name: 'Tussar',
    origin: 'Bhagalpur, Bihar',
    description:
      'Also called Kosa silk, Tussar is a textured wild silk with a natural gold sheen. It breathes well and softens beautifully with every wear.',
    feature: 'Textured, matte gold sheen from wild silkworms',
    imageUrl: '/images/hero/hero-main.png',
    link: '/category/tussar',
  },
  {
    name: 'Maheshwari',
    origin: 'Maheshwar, Madhya Pradesh',
    description:
      'A reversible border makes Maheshwari unique. Cotton-silk blend, lightweight, and perfect for daily elegance with its distinctive check patterns.',
    feature: 'Reversible border with distinctive striped and checked patterns',
    imageUrl: '/images/hero/hero-main.png',
    link: '/category/maheshwari',
  },
]

export function WeaveLibrary({
  weaves,
  headline = 'The Weave Library',
  subheading = 'Know what you wear. Every weave has a story, a place, and a pair of hands that mastered it over centuries.',
}: WeaveLibraryProps) {
  const displayWeaves = (weaves?.length ? weaves : DEFAULT_WEAVES)
  if (!displayWeaves.length) return null

  return (
    <section className="bg-brand-50/30">
      <div className="container-page py-10 sm:py-14 md:py-16">
        <div className="mb-8 text-center">
          <span className="font-display text-[10px] font-semibold tracking-[0.2em] text-brand-600 uppercase">
            Craft Education
          </span>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {headline}
          </h2>
          <p className="font-body mt-3 max-w-[60ch] text-sm text-neutral-500 sm:text-base mx-auto">
            {subheading}
          </p>
        </div>

        <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-5">
          {displayWeaves.map((weave) => (
            <Link
              key={weave.name}
              href={weave.link}
              className="group flex w-[280px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:w-auto sm:flex-shrink"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                <SkeletonImage
                  src={weave.imageUrl}
                  alt={weave.name}
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-display text-xs font-medium tracking-wider text-brand-600 uppercase">
                  {weave.origin}
                </p>
                <h3 className="font-display mt-1 text-base font-semibold text-neutral-900">
                  {weave.name}
                </h3>
                <p className="font-body mt-2 flex-1 text-xs leading-relaxed text-neutral-500">
                  {weave.description}
                </p>
                <div className="mt-3 border-t border-neutral-100 pt-3">
                  <p className="font-body text-[11px] italic text-neutral-400">
                    &ldquo;{weave.feature}&rdquo;
                  </p>
                  <span className="font-display text-brand-600 mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                    Explore {weave.name}
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

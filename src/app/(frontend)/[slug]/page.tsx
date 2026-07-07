import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react'
import type { FormDoc } from '@/components/page/ContactForm'
import { ContactForm } from '@/components/page/ContactForm'
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; id?: string }>
}

function LexicalRenderer({ content }: { content: any }) {
  if (!content || !content.root || !Array.isArray(content.root.children)) {
    return null
  }
  return (
    <div className="font-body space-y-4 text-[0.9375rem] leading-7 text-neutral-600">
      {content.root.children.map((block: any, idx: number) => {
        if (block.type === 'paragraph' && Array.isArray(block.children)) {
          return (
            <p key={idx}>
              {block.children.map((node: any, nIdx: number) => {
                if (node.type === 'text') {
                  return node.text
                }
                return null
              })}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}

export default async function CatchAllPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && Boolean(id)
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })

  const page: any = isPreview
    ? await payload.findByID({
        collection: 'pages',
        id: id!,
        draft: true,
        overrideAccess: false,
        user: user ?? undefined,
        depth: 2,
      })
    : ((
        await payload.find({
          collection: 'pages',
          where: {
            slug: { equals: slug },
            status: { equals: 'published' },
          },
          limit: 1,
          depth: 2,
        })
      ).docs[0] as any)

  if (!page) {
    return notFound()
  }

  const template = page.template || 'default'

  // If page is contact, search for contact form
  let contactFormDoc = null
  if (template === 'contact') {
    const forms = await payload.find({
      collection: 'forms',
      where: {
        slug: { equals: 'contact' },
      },
      limit: 1,
    })
    contactFormDoc = (forms.docs[0] as FormDoc) || null
  }

  return (
    <div className="bg-surface min-h-screen">
      {isPreview && <RefreshRouteOnSave />}
      {/* Template Header if not default */}
      {template === 'about' && (
        <div className="bg-brand-950 relative overflow-hidden px-4 py-24 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(105,37,78,0.25),rgba(255,255,255,0))]" />
          <div className="relative z-10 mx-auto max-w-3xl space-y-4">
            <span className="text-gold-300 font-display text-[10px] font-semibold tracking-widest uppercase">
              SHAYGA - The Saree Studio Heritage
            </span>
            <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
              {page.title}
            </h1>
            <p className="font-body mx-auto max-w-xl text-sm text-neutral-300 sm:text-base">
              Weaving stories of Indian tradition, silk craftsmanship, and
              timeless drape aesthetics.
            </p>
          </div>
        </div>
      )}

      {template === 'contact' && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-16 text-center">
          <div className="mx-auto max-w-3xl space-y-3">
            <span className="text-brand-700 font-display text-[10px] font-semibold tracking-widest uppercase">
              Connect With Us
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {page.title}
            </h1>
            <p className="font-body mx-auto max-w-xl text-sm text-neutral-500">
              Have queries about our weaves, customizations, or shipping? Write
              to us.
            </p>
          </div>
        </div>
      )}

      {template === 'faq' && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-16 text-center">
          <div className="mx-auto max-w-3xl space-y-3">
            <span className="text-brand-700 font-display text-[10px] font-semibold tracking-widest uppercase">
              Help & Support
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {page.title}
            </h1>
            <p className="font-body mx-auto max-w-xl text-sm text-neutral-500">
              Answers to common queries regarding ordering, shipping, and
              product care.
            </p>
          </div>
        </div>
      )}

      {/* Render Template Specific Custom Section */}
      {template === 'contact' && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-4 py-12 sm:px-6 md:grid-cols-12 lg:px-8">
          {/* Contact Details */}
          <div className="font-body space-y-8 md:col-span-5">
            <div className="space-y-6">
              <h3 className="font-display text-base font-semibold tracking-wider text-neutral-900 uppercase">
                Heritage Studio
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600">
                Experience the authentic handloom collection in person. Visits
                by appointment only.
              </p>
            </div>

            <div className="space-y-4 text-sm text-neutral-600">
              <div className="flex items-start gap-4">
                <MapPin className="text-brand-600 mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-display font-semibold text-neutral-900">
                    Registered Office
                  </p>
                  <p className="mt-1">
                    D-48/144, Luxa, Godowlia Road, Varanasi, Uttar Pradesh,
                    221001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="text-brand-600 mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-display font-semibold text-neutral-900">
                    Email Address
                  </p>
                  <a
                    href="mailto:care@shayga.com"
                    className="hover:text-brand-700 transition-colors"
                  >
                    care@shayga.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-brand-600 mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-display font-semibold text-neutral-900">
                    Phone Support
                  </p>
                  <a
                    href="tel:+919876543210"
                    className="hover:text-brand-700 transition-colors"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Builder */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs sm:p-8 md:col-span-7">
            <ContactForm form={contactFormDoc} />
          </div>
        </div>
      )}

      {/* Render Blocks — all non-hero blocks share max-w-4xl for consistent edge alignment */}
      <div className="space-y-20 py-12">
        {page.content?.map((block: any, idx: number) => {
          switch (block.blockType || block.slug) {
            case 'hero':
              return (
                <div
                  key={idx}
                  className="relative flex h-[60vh] items-center justify-center overflow-hidden px-4 text-center"
                >
                  {block.backgroundImage?.url && (
                    <Image
                      src={block.backgroundImage.url}
                      alt={block.heading || 'Hero'}
                      fill
                      priority
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-neutral-950/45" />
                  <div className="relative z-10 mx-auto max-w-2xl space-y-4">
                    <h2 className="font-display text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
                      {block.heading}
                    </h2>
                    <p className="font-body mx-auto max-w-xl text-sm text-neutral-100 sm:text-base">
                      {block.subheading}
                    </p>
                    {block.ctaText && block.ctaLink && (
                      <Link
                        href={block.ctaLink}
                        className="bg-brand-600 hover:bg-brand-700 font-display inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
                      >
                        {block.ctaText}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )

            case 'textImage':
              return (
                <div
                  key={idx}
                  className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
                >
                  {block.image?.url ? (
                    <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                      <div
                        className={
                          block.imagePosition === 'right' ? 'md:order-1' : ''
                        }
                      >
                        <h3 className="font-display mb-4 text-2xl font-bold text-neutral-900">
                          {block.heading}
                        </h3>
                        <LexicalRenderer content={block.body} />
                      </div>
                      <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                        <img
                          src={block.image.url}
                          alt={block.heading || 'Content image'}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-display mb-4 text-2xl font-bold text-neutral-900">
                        {block.heading}
                      </h3>
                      <LexicalRenderer content={block.body} />
                    </>
                  )}
                </div>
              )

            case 'featureGrid':
              return (
                <div
                  key={idx}
                  className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
                >
                  {block.heading && (
                    <h3 className="font-display mb-8 text-xl font-semibold text-neutral-900">
                      {block.heading}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {block.features?.map((item: any, fIdx: number) => (
                      <div
                        key={fIdx}
                        className="space-y-2 rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs"
                      >
                        <h4 className="font-display text-sm font-semibold text-neutral-900">
                          {item.title}
                        </h4>
                        <p className="font-body text-sm leading-relaxed text-neutral-500">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )

            case 'testimonials':
              return (
                <div
                  key={idx}
                  className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
                >
                  {block.heading && (
                    <h3 className="font-display mb-8 text-xl font-semibold text-neutral-900">
                      {block.heading}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {block.items?.map((item: any, tIdx: number) => (
                      <div
                        key={tIdx}
                        className="flex flex-col justify-between rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs"
                      >
                        <p className="font-body text-sm leading-relaxed text-neutral-600 italic">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                          {item.avatar?.url && (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                              <img
                                src={item.avatar.url}
                                alt={item.name}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h5 className="font-display text-xs font-semibold text-neutral-900">
                              {item.name}
                            </h5>
                            <p className="font-body mt-0.5 text-[10px] text-neutral-400">
                              {item.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )

            case 'faq':
              return (
                <div
                  key={idx}
                  className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
                >
                  {block.heading && (
                    <h3 className="font-display mb-6 flex items-center gap-2 text-xl font-semibold text-neutral-900">
                      <HelpCircle className="text-brand-600 h-5 w-5 shrink-0" />
                      {block.heading}
                    </h3>
                  )}
                  <div className="space-y-3">
                    {block.questions?.map((item: any, qIdx: number) => (
                      <div
                        key={qIdx}
                        className="space-y-2 rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs"
                      >
                        <h4 className="font-display text-sm font-semibold text-neutral-900">
                          {item.question}
                        </h4>
                        <p className="font-body text-sm leading-relaxed text-neutral-500">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )

            case 'cta':
              return (
                <div
                  key={idx}
                  className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
                >
                  <div className="bg-brand-50 border-brand-100/50 space-y-4 rounded-3xl border p-8 text-center sm:p-12">
                    <h3 className="font-display text-brand-950 text-2xl font-bold">
                      {block.heading}
                    </h3>
                    <p className="font-body mx-auto max-w-lg text-sm leading-relaxed text-neutral-600">
                      {block.body}
                    </p>
                    {block.buttonText && block.buttonLink && (
                      <div className="pt-2">
                        <Link
                          href={block.buttonLink}
                          className="bg-brand-600 hover:bg-brand-700 font-display inline-flex h-11 items-center gap-1.5 rounded-xl px-6 text-xs font-semibold text-white transition-all"
                        >
                          {block.buttonText}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )

            default:
              return null
          }
        })}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (result.docs.length === 0) return {}

  const page = result.docs[0] as any
  return {
    title: page.metaTitle || `${page.title} — SHAYGA - The Saree Studio Heritage`,
    description:
      page.metaDescription ||
      `Explore the dynamic blocks on this SHAYGA - The Saree Studio web app page.`,
  }
}

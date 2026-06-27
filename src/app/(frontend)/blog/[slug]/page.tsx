import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'
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
    <div className="font-body space-y-6 text-sm leading-relaxed text-neutral-700 sm:text-base">
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
        if (block.type === 'heading' && Array.isArray(block.children)) {
          const Tag = (block.tag || 'h2') as 'h2' | 'h3' | 'h4'
          const style =
            Tag === 'h2'
              ? 'font-display text-xl sm:text-2xl font-bold text-neutral-900 mt-8 mb-4'
              : 'font-display text-lg font-semibold text-neutral-900 mt-6 mb-3'
          return (
            <Tag key={idx} className={style}>
              {block.children.map((node: any) => node.text || '')}
            </Tag>
          )
        }
        return null
      })}
    </div>
  )
}

export default async function BlogDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && Boolean(id)
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })

  const post: any = isPreview
    ? await payload.findByID({
        collection: 'posts',
        id: id!,
        draft: true,
        overrideAccess: false,
        user: user ?? undefined,
        depth: 2,
      })
    : ((
        await payload.find({
          collection: 'posts',
          where: {
            slug: { equals: slug },
            status: { equals: 'published' },
          },
          limit: 1,
          depth: 2,
        })
      ).docs[0] as any)

  if (!post) {
    return notFound()
  }

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Journal Entry'

  return (
    <div className="bg-surface min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      {isPreview && <RefreshRouteOnSave />}
      <article className="mx-auto max-w-3xl space-y-8">
        {/* Navigation back */}
        <Link
          href="/blog"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Journal
        </Link>

        {/* Article Meta / Headers */}
        <div className="space-y-4">
          <div className="font-body flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-neutral-300" />
              {dateStr}
            </span>
            {post.author?.name && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-neutral-300" />
                By {post.author.name}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="font-body border-brand-300 border-l-2 py-1 pl-4 text-sm leading-relaxed text-neutral-500 italic sm:text-base">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Featured Image */}
        {post.featuredImage?.url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-100 shadow-xs">
            <img
              src={post.featuredImage.url}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Rich Text Body Content */}
        <div className="border-neutral-150 border-t pt-8">
          <LexicalRenderer content={post.content} />
        </div>
      </article>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (result.docs.length === 0) return {}

  const post = result.docs[0] as any
  return {
    title: `${post.title} — Shagya Journal`,
    description:
      post.excerpt || `Read the latest story on our Indian handloom blog.`,
  }
}

import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

export const revalidate = 3600 // cache for 1 hour

export default async function BlogIndexPage() {
  let posts: any[] = []

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      depth: 2,
    })
    posts = result.docs as any[]
  } catch {
    posts = []
  }

  return (
    <div className="bg-surface min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Title Block */}
        <div className="mb-16 space-y-3 text-center">
          <span className="text-brand-700 font-display text-[10px] font-semibold tracking-widest uppercase">
            The Shayga Journal
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Weaving Chronicles
          </h1>
          <p className="font-body mx-auto max-w-xl text-sm text-neutral-500">
            Insights into the heritage of Varanasi handlooms, styling tips, and
            pure silk care.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-neutral-100 bg-white py-16 text-center shadow-xs">
            <p className="font-body text-sm text-neutral-500">
              No journal entries published yet.
            </p>
            <Link
              href="/"
              className="font-display text-brand-700 hover:text-brand-800 mt-4 inline-block text-xs font-semibold underline"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const imageUrl = post.featuredImage?.url
              const dateStr = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Journal Entry'

              return (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs transition-all duration-300 hover:shadow-md"
                >
                  {/* Card Cover */}
                  <div className="relative h-56 w-full overflow-hidden border-b border-neutral-100 bg-neutral-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="font-display flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-400 uppercase">
                        Journal
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div className="space-y-3">
                      {/* Meta */}
                      <div className="font-body flex items-center gap-4 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dateStr}
                        </span>
                        {post.author?.name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author.name}
                          </span>
                        )}
                      </div>

                      {/* Header */}
                      <h3 className="font-display group-hover:text-brand-700 text-sm leading-snug font-semibold tracking-tight text-neutral-900 transition-colors">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="font-body line-clamp-2 text-xs leading-relaxed text-neutral-500">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-display text-brand-700 hover:text-brand-800 group/link mt-5 inline-flex items-center gap-1 self-start text-xs font-semibold"
                    >
                      Read Article
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

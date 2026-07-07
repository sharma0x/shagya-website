import { getPayload } from 'payload'
import config from '@payload-config'
import { cn } from '@/lib/utils'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

interface InstagramGalleryProps {
  className?: string
}

export async function InstagramGallery({ className }: InstagramGalleryProps) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'instagram-posts',
    sort: 'sortOrder',
    limit: 5,
  })

  const posts = result.docs

  if (posts.length === 0) return null

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5',
        className,
      )}
    >
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink || 'https://instagram.com/shayga'}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-xl bg-neutral-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="aspect-square">
            <SkeletonImage
              src={post.thumbnailUrl || post.mediaUrl || ''}
              alt={post.caption?.slice(0, 100) || 'Instagram post'}
              fill
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Hover overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
            <svg
              className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" />
            </svg>
          </div>
        </a>
      ))}
    </div>
  )
}

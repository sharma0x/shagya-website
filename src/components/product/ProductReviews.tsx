'use client'

import { useState } from 'react'
import { Rating } from '@/components/ui/Rating'
import { Star } from 'lucide-react'

export interface ReviewData {
  id: string
  title: string
  body: string
  rating: number
  createdAt: string
  verifiedPurchase: boolean
  customer: {
    name: string
    image?: string | null
  }
  images?: {
    image?: {
      url?: string | null
      sizes?: { thumbnail?: { url?: string | null } }
    } | null
  }[]
}

interface ProductReviewsProps {
  reviews: ReviewData[]
  averageRating: number
  totalCount: number
}

export function ProductReviews({
  reviews,
  averageRating,
  totalCount,
}: ProductReviewsProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  return (
    <section className="border-t border-neutral-200 pt-12">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        {/* Sidebar: Rating Summary */}
        <div className="lg:col-span-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-neutral-900">
            Customer Reviews
          </h2>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-4xl font-bold text-neutral-900">
              {averageRating.toFixed(1)}
            </span>
            <div>
              <Rating value={Math.round(averageRating)} size="md" />
              <p className="font-body mt-1 text-xs text-neutral-500">
                {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 py-12 text-center">
              <Star className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="font-display mt-3 text-sm font-semibold text-neutral-500">
                No reviews yet
              </p>
              <p className="font-body mt-1 text-xs text-neutral-400">
                Be the first to review this saree.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-neutral-100 pb-6 last:border-0"
                >
                  {/* Header: Avatar + Name + Verified + Date */}
                  <div className="flex items-center gap-3">
                    {review.customer.image ? (
                      <img
                        src={review.customer.image}
                        alt={review.customer.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-brand-100 text-brand-600 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
                        {(review.customer.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-display text-sm font-semibold text-neutral-900">
                        {review.customer.name || 'Customer'}
                      </p>
                      <div className="flex items-center gap-2">
                        <Rating value={review.rating} size="sm" />
                        {review.verifiedPurchase && (
                          <span className="font-body text-[10px] font-medium text-green-600">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-body text-[11px] text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Title + Body */}
                  <div className="mt-3">
                    <h3 className="font-display text-sm font-semibold text-neutral-800">
                      {review.title}
                    </h3>
                    <p className="font-body mt-1 text-sm leading-relaxed text-neutral-600">
                      {review.body}
                    </p>
                  </div>

                  {/* Review Photos */}
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.images.map((img, i) => {
                        const thumbUrl =
                          img.image?.sizes?.thumbnail?.url ||
                          img.image?.url
                        const fullUrl = img.image?.url
                        if (!thumbUrl || !fullUrl) return null
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setExpandedImage(
                                expandedImage === fullUrl ? null : fullUrl,
                              )
                            }
                            className="relative overflow-hidden rounded-lg border border-neutral-100"
                          >
                            <img
                              src={thumbUrl}
                              alt={`Review photo ${i + 1}`}
                              className="h-20 w-20 object-cover transition-transform hover:scale-105"
                              loading="lazy"
                            />
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Expanded photo preview */}
                  {expandedImage && (
                    <div className="relative mt-3 overflow-hidden rounded-xl bg-neutral-100">
                      <img
                        src={expandedImage}
                        alt="Review photo"
                        className="max-h-96 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setExpandedImage(null)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white transition-colors hover:bg-black/80"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

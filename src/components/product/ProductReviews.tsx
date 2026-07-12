'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Rating } from '@/components/ui/Rating'
import { useSession } from '@/lib/auth-client'
import { Star, Edit3, Loader2, Check, Camera, X } from 'lucide-react'

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
  productId: string | number
  productSlug: string
}

const STAR_LABELS: Record<number, string> = {
  5: 'Excellent',
  4: 'Good',
  3: 'Average',
  2: 'Below Average',
  1: 'Poor',
}

export function ProductReviews({
  reviews,
  averageRating,
  totalCount,
  productId,
  productSlug,
}: ProductReviewsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formRating, setFormRating] = useState(0)
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formImages, setFormImages] = useState<File[]>([])
  const [formPreviews, setFormPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  const handleWriteReview = useCallback(() => {
    if (!session?.user) {
      router.push(`/account/login?redirect=/products/${productSlug}`)
      return
    }
    setShowForm(true)
    setSubmitted(false)
  }, [session, router, productSlug])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormImages((prev) => [...prev, ...files])
    files.forEach((f) => {
      const url = URL.createObjectURL(f)
      setFormPreviews((prev) => [...prev, url])
    })
  }

  const removeImage = (idx: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx))
    setFormPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formRating < 1) {
      setFormError('Please select a rating')
      return
    }
    if (!formTitle.trim()) {
      setFormError('Please enter a review title')
      return
    }
    if (!formBody.trim()) {
      setFormError('Please write your review')
      return
    }

    setSubmitting(true)
    setFormError('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formRating,
          title: formTitle.trim(),
          body: formBody.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit review')
      }

      setSubmitted(true)
      setShowForm(false)
      setFormRating(0)
      setFormTitle('')
      setFormBody('')
      setFormImages([])
      setFormPreviews([])
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const ratingBars = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length
    const pct = totalCount > 0 ? (count / totalCount) * 100 : 0
    return { star, count, pct }
  })

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
              {totalCount > 0 ? averageRating.toFixed(1) : '—'}
            </span>
            <div>
              <Rating value={Math.round(averageRating)} size="md" />
              <p className="font-body mt-1 text-xs text-neutral-500">
                {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {/* Rating breakdown bars */}
          {totalCount > 0 && (
            <div className="mt-5 space-y-1.5">
              {ratingBars.map(({ star, pct }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-right text-neutral-500">{star} ★</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-1.5 rounded-full bg-amber-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-neutral-400">{Math.round(pct)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Write Review Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleWriteReview}
              className="font-display border-brand-600 text-brand-700 hover:bg-brand-50 inline-flex h-10 items-center gap-1.5 rounded-xl border px-5 text-xs font-semibold transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Write a Review
            </button>
          </div>
        </div>

        {/* Main: Reviews List + Form */}
        <div className="lg:col-span-8">
          {/* Inline Review Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-brand-100 bg-brand-50/30 p-5">
              <h3 className="font-display text-sm font-semibold text-neutral-900">
                Share your experience
              </h3>

              {formError && (
                <p className="mt-3 text-xs text-red-600">{formError}</p>
              )}

              {/* Star Picker */}
              <div className="mt-4">
                <label className="font-display text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Your Rating
                </label>
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className={`transition-all ${
                        star <= formRating
                          ? 'scale-110 text-amber-400'
                          : 'text-neutral-300 hover:text-amber-300'
                      }`}
                    >
                      <Star
                        className="h-7 w-7"
                        fill={star <= formRating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                  {formRating > 0 && (
                    <span className="font-body text-xs text-neutral-500">
                      {STAR_LABELS[formRating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="mt-4">
                <label className="font-display text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Review Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="font-body focus:border-brand-500 mt-1.5 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none"
                />
              </div>

              {/* Body */}
              <div className="mt-4">
                <label className="font-display text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Your Review
                </label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Tell us what you loved about this saree — the fabric, the weave, the drape..."
                  rows={4}
                  className="font-body focus:border-brand-500 mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none"
                />
              </div>

              {/* Image Upload */}
              <div className="mt-4">
                <label className="font-display text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Add Photos (optional)
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {formPreviews.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[10px] text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-500">
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError('') }}
                  className="font-display h-10 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-500 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-display bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-1.5 rounded-xl px-5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Review
                </button>
              </div>
            </form>
          )}

          {/* Success message */}
          {submitted && (
            <div className="mb-8 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-xs text-green-700">
              <Check className="h-4 w-4 text-green-600" />
              Review submitted! It will appear after approval.
            </div>
          )}

          {/* Reviews List */}
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
                  <div className="flex items-center gap-3">
                    {review.customer.image ? (
                      <img src={review.customer.image} alt={review.customer.name} className="h-9 w-9 rounded-full object-cover" />
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
                          <span className="font-body text-[10px] font-medium text-green-600">Verified Purchase</span>
                        )}
                      </div>
                    </div>
                    <span className="font-body text-[11px] text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-display text-sm font-semibold text-neutral-800">{review.title}</h3>
                    <p className="font-body mt-1 text-sm leading-relaxed text-neutral-600">{review.body}</p>
                  </div>

                  {review.images && review.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.images.map((img, i) => {
                        const thumbUrl = img.image?.sizes?.thumbnail?.url || img.image?.url
                        const fullUrl = img.image?.url
                        if (!thumbUrl || !fullUrl) return null
                        return (
                          <button key={i} type="button"
                            onClick={() => setExpandedImage(expandedImage === fullUrl ? null : fullUrl)}
                            className="overflow-hidden rounded-lg border border-neutral-100"
                          >
                            <img src={thumbUrl} alt="" className="h-20 w-20 object-cover transition-transform hover:scale-105" loading="lazy" />
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {expandedImage && (
                    <div className="relative mt-3 overflow-hidden rounded-xl bg-neutral-100">
                      <img src={expandedImage} alt="" className="max-h-96 w-full object-contain" />
                      <button type="button" onClick={() => setExpandedImage(null)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80">
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

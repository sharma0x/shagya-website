'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Rating } from '@/components/ui/Rating'
import { useSession } from '@/lib/auth-client'
import { Star, Edit3, Loader2, Check, Camera, X, ChevronDown, ThumbsUp, ShieldCheck } from 'lucide-react'

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

type SortMode = 'recent' | 'highest'

export function ProductReviews({
  reviews: allReviews,
  averageRating,
  totalCount,
  productId,
  productSlug,
}: ProductReviewsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [formRating, setFormRating] = useState(0)
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formImages, setFormImages] = useState<File[]>([])
  const [formPreviews, setFormPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  const reviews = useMemo(() => {
    const sorted = [...allReviews]
    if (sortMode === 'recent') return sorted
    return sorted.sort((a, b) => b.rating - a.rating)
  }, [allReviews, sortMode])

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
    files.forEach((f) => setFormPreviews((prev) => [...prev, URL.createObjectURL(f)]))
  }

  const removeImage = (idx: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx))
    setFormPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formRating < 1) { setFormError('Please select a rating'); return }
    if (!formTitle.trim()) { setFormError('Please enter a review title'); return }
    if (!formBody.trim()) { setFormError('Please write your review'); return }
    setSubmitting(true)
    setFormError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating: formRating, title: formTitle.trim(), body: formBody.trim() }),
      })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed') }
      setSubmitted(true)
      setShowForm(false)
      setFormRating(0); setFormTitle(''); setFormBody(''); setFormImages([]); setFormPreviews([])
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const ratingBars = [5, 4, 3, 2, 1].map((star) => {
    const count = allReviews.filter((r) => Math.round(r.rating) === star).length
    const pct = totalCount > 0 ? (count / totalCount) * 100 : 0
    return { star, count, pct }
  })

  return (
    <section className="border-t border-neutral-200 pt-12">
      {/* ── Rating Summary Row (Amazon-style) ── */}
      <div className="grid gap-8 md:grid-cols-12">
        {/* Left: Big rating number */}
        <div className="md:col-span-4 md:border-r md:border-neutral-100 md:pr-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-neutral-900">
            Customer Reviews
          </h2>

          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-5xl font-bold leading-none text-neutral-900">
              {totalCount > 0 ? averageRating.toFixed(1) : '—'}
            </span>
            <span className="font-body text-sm text-neutral-500">out of 5</span>
          </div>

          <div className="mt-3">
            <Rating value={Math.round(averageRating)} size="md" />
          </div>

          <p className="font-body mt-2 text-sm text-neutral-500">
            {totalCount} global {totalCount === 1 ? 'rating' : 'ratings'}
          </p>

          {/* Rating breakdown */}
          {totalCount > 0 && (
            <div className="mt-5 space-y-2">
              {ratingBars.map(({ star, pct, count }) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSortMode('highest')}
                  className="flex w-full items-center gap-3 text-xs transition-colors hover:opacity-80"
                >
                  <span className="w-14 flex-shrink-0 text-right text-neutral-600 hover:text-brand-600">
                    {star} star
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-3 rounded-full bg-amber-400 transition-all"
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                  <span className="w-9 flex-shrink-0 text-right text-neutral-400">{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Write Review Button */}
          <button
            type="button"
            onClick={handleWriteReview}
            className="font-display bg-brand-600 hover:bg-brand-700 mt-6 inline-flex h-10 items-center gap-1.5 rounded-xl px-6 text-xs font-semibold text-white transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Write a Customer Review
          </button>
        </div>

        {/* Right: Reviews list */}
        <div className="md:col-span-8">
          {/* Submitted confirmation */}
          {submitted && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
              <Check className="h-4 w-4 text-green-600" />
              Review submitted! It will appear after approval.
            </div>
          )}

          {/* Review Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-brand-200 bg-brand-50/20 p-6">
              <h3 className="font-display text-base font-semibold text-neutral-900">
                Share your thoughts with other customers
              </h3>

              {formError && <p className="mt-3 text-xs text-red-600">{formError}</p>}

              {/* Star Picker */}
              <div className="mt-5">
                <label className="font-display text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Overall rating
                </label>
                <div className="mt-2 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setFormRating(star)}
                      className={`transition-all ${star <= formRating ? 'scale-110 text-amber-400' : 'text-neutral-300 hover:text-amber-300'}`}>
                      <Star className="h-8 w-8" fill={star <= formRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  {formRating > 0 && (
                    <span className="font-body ml-2 text-sm font-medium text-neutral-600">{STAR_LABELS[formRating]}</span>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="mt-5">
                <label className="font-display text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Add a headline
                </label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="What's most important to know?"
                  className="font-body focus:border-brand-500 mt-1.5 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none" />
              </div>

              {/* Body */}
              <div className="mt-5">
                <label className="font-display text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Write your review
                </label>
                <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Tell us what you loved about this saree — the fabric, the weave, the drape..."
                  rows={4}
                  className="font-body focus:border-brand-500 mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none" />
              </div>

              {/* Photo Upload */}
              <div className="mt-5">
                <label className="font-display text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Add photos (optional)
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {formPreviews.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[10px] text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 transition-colors">
                    <Camera className="h-5 w-5" />
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); setFormError('') }}
                  className="font-display h-10 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-500 hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="font-display bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-1.5 rounded-xl px-5 text-xs font-semibold text-white transition-colors disabled:opacity-50">
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Review
                </button>
              </div>
            </form>
          )}

          {/* Sort + Reviews */}
          {allReviews.length > 0 && (
            <>
              {/* Sort bar */}
              <div className="mb-5 flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-neutral-900">
                  {sortMode === 'recent' ? 'Top Reviews' : 'Highest Rated'}
                </p>
                <div className="relative">
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="font-body text-neutral-600 h-9 appearance-none rounded-lg border border-neutral-200 bg-white pr-8 pl-3 text-xs outline-none focus:border-brand-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              {/* Review Cards */}
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review.id}>
                    {/* Customer header */}
                    <div className="flex items-center gap-3">
                      {review.customer.image ? (
                        <img src={review.customer.image} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-neutral-100" />
                      ) : (
                        <div className="bg-brand-100 text-brand-600 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ring-2 ring-neutral-100">
                          {(review.customer.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="font-display text-sm font-semibold text-neutral-900">
                        {review.customer.name || 'Customer'}
                      </p>
                    </div>

                    {/* Rating + Title */}
                    <div className="mt-3 flex items-center gap-2">
                      <Rating value={review.rating} size="sm" />
                      <span className="font-display text-sm font-bold text-neutral-800">
                        {review.title}
                      </span>
                    </div>

                    {/* Date */}
                    <p className="font-body mt-1 text-xs text-neutral-400">
                      Reviewed on{' '}
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>

                    {/* Verified badge */}
                    {review.verifiedPurchase && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="font-body text-[11px] font-medium text-red-600">
                          <ShieldCheck className="mr-0.5 inline h-3.5 w-3.5" />
                          Verified Purchase
                        </span>
                      </div>
                    )}

                    {/* Body */}
                    <p className="font-body mt-3 text-sm leading-relaxed text-neutral-600">
                      {review.body}
                    </p>

                    {/* Review Photos */}
                    {review.images && review.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.images.map((img, i) => {
                          const thumbUrl = img.image?.sizes?.thumbnail?.url || img.image?.url
                          const fullUrl = img.image?.url
                          if (!thumbUrl || !fullUrl) return null
                          return (
                            <button key={i} type="button"
                              onClick={() => setExpandedImage(expandedImage === fullUrl ? null : fullUrl)}
                              className="overflow-hidden rounded-lg border border-neutral-200">
                              <img src={thumbUrl} alt="" className="h-16 w-16 object-cover transition-transform hover:scale-105" loading="lazy" />
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Expanded image */}
                    {expandedImage && review.images?.some((img) => img.image?.url === expandedImage) && (
                      <div className="relative mt-3 overflow-hidden rounded-xl bg-neutral-100">
                        <img src={expandedImage} alt="" className="max-h-80 w-full object-contain" />
                        <button type="button" onClick={() => setExpandedImage(null)}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80">✕</button>
                      </div>
                    )}

                    {/* Helpful button */}
                    <button type="button"
                      className="font-body mt-3 inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-[11px] text-neutral-500 transition-colors hover:bg-neutral-50">
                      <ThumbsUp className="h-3 w-3" />
                      Helpful
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {allReviews.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-neutral-100 py-16 text-center">
              <Star className="mx-auto h-10 w-10 text-neutral-200" />
              <p className="font-display mt-4 text-base font-semibold text-neutral-500">
                No customer reviews yet
              </p>
              <p className="font-body mt-1 text-sm text-neutral-400">
                Be the first to share your experience.
              </p>
              <button type="button" onClick={handleWriteReview}
                className="font-display bg-brand-600 hover:bg-brand-700 mt-5 inline-flex h-10 items-center gap-1.5 rounded-xl px-5 text-xs font-semibold text-white transition-colors">
                <Edit3 className="h-3.5 w-3.5" />
                Write a Review
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

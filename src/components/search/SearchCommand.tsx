'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, CornerDownLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

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

type SearchResult = FTSProductResult | FTSPostResult

interface SearchResponse {
  docs: SearchResult[]
  totalDocs: number
}

const SUGGESTIONS = [
  'Silk',
  'Banarasi',
  'Cotton',
  'Handloom',
  'Bridal',
  'Kanchipuram',
]

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

function getResultUrl(doc: SearchResult): string {
  if (doc.type === 'product') return `/products/${doc.slug}`
  return `/blog/${doc.slug}`
}

function ProductThumbnail({ doc }: { doc: FTSProductResult }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
      <Image
        src={ph(56, 56, '69254e', 'f5e8ee', doc.name.charAt(0) || 'S')}
        alt={doc.name}
        fill
        sizes="56px"
        className="object-cover"
        unoptimized
      />
    </div>
  )
}

interface SearchCommandProps {
  isOpen: boolean
  onClose: () => void
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`)
      if (res.ok) {
        const data: SearchResponse = await res.json()
        setResults(data.docs || [])
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      debounceRef.current = setTimeout(() => {
        setResults([])
        setLoading(false)
      }, 0)
      return
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      performSearch(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, performSearch])

  const products = results.filter(
    (r): r is FTSProductResult => r.type === 'product',
  )
  const posts = results.filter((r): r is FTSPostResult => r.type === 'post')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && results[activeIndex]) {
        onClose()
        router.push(getResultUrl(results[activeIndex]))
      } else if (query.trim()) {
        onClose()
        router.push(`/search?q=${encodeURIComponent(query)}`)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const handleResultClick = (doc: SearchResult) => {
    onClose()
    router.push(getResultUrl(doc))
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{ animation: 'fade-in 0.2s ease-out' }}
      />

      {/* Panel */}
      <div
        className="relative mx-auto w-full max-w-2xl"
        style={{ animation: 'slide-up 0.3s ease-out' }}
      >
        <div className="container-page pt-4 pb-4">
          <div
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sarees, weaves, stories..."
                className="font-display h-7 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-brand-300 h-2 w-2 rounded-full"
                        style={{
                          animation: 'fade-in 0.4s ease-out infinite alternate',
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state with suggestions */}
              {!loading && !query.trim() && (
                <div className="px-5 py-10">
                  <p className="font-display text-xs font-semibold tracking-[0.15em] text-neutral-400 uppercase">
                    Popular Searches
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="font-body hover:border-brand-300 hover:text-brand-700 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {!loading && query.trim() && results.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="font-display text-base font-medium text-neutral-700">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="font-body mt-1.5 text-sm text-neutral-400">
                    Try searching for a fabric, weave, or occasion
                  </p>
                </div>
              )}

              {/* Results list */}
              {!loading && results.length > 0 && (
                <div className="py-2">
                  {products.length > 0 && (
                    <ResultSection
                      label="Sarees"
                      docs={products}
                      activeIndex={activeIndex}
                      flatOffset={0}
                      onHover={setActiveIndex}
                      onClick={handleResultClick}
                      renderThumbnail={(doc) => <ProductThumbnail doc={doc} />}
                      renderMeta={(doc) => (
                        <span className="text-neutral-400">
                          {doc.weave} · {doc.fabric}
                        </span>
                      )}
                      renderPrice={(doc) =>
                        doc.basePrice ? (
                          <span className="text-brand-700 font-display font-semibold">
                            ₹{doc.basePrice.toLocaleString('en-IN')}
                          </span>
                        ) : null
                      }
                      renderTitle={(doc) => doc.name}
                    />
                  )}

                  {posts.length > 0 && (
                    <>
                      <div className="rule-gold mx-5 my-1" />
                      <ResultSection
                        label="Journal"
                        docs={posts}
                        activeIndex={activeIndex}
                        flatOffset={products.length}
                        onHover={setActiveIndex}
                        onClick={handleResultClick}
                        renderMeta={(doc) => (
                          <span className="line-clamp-2 text-neutral-400">
                            {doc.excerpt?.slice(0, 80)}
                            {doc.excerpt && doc.excerpt.length > 80
                              ? '...'
                              : ''}
                          </span>
                        )}
                        renderTitle={(doc) => doc.title}
                      />
                    </>
                  )}

                  {/* View all results */}
                  <div className="border-t border-neutral-100 px-5 py-3">
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="font-display text-brand-700 hover:text-brand-600 flex items-center justify-between text-sm font-medium transition-colors"
                    >
                      <span>View all results for &ldquo;{query}&rdquo;</span>
                      <CornerDownLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-5 py-2.5">
              <div className="flex items-center gap-4">
                <span className="font-body flex items-center gap-1.5 text-xs text-neutral-400">
                  <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="font-body flex items-center gap-1.5 text-xs text-neutral-400">
                  <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium">
                    ↵
                  </kbd>
                  open
                </span>
              </div>
              <span className="font-body text-xs text-neutral-400">
                Search by Shayga
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  if (!isOpen) return null
  return <SearchPanel key={isOpen ? 'open' : 'closed'} onClose={onClose} />
}

interface ResultSectionProps<T extends SearchResult> {
  label: string
  docs: T[]
  activeIndex: number
  flatOffset: number
  onHover: (index: number) => void
  onClick: (doc: T) => void
  renderThumbnail?: (doc: T) => React.ReactNode
  renderMeta?: (doc: T) => React.ReactNode
  renderPrice?: (doc: T) => React.ReactNode
  renderTitle: (doc: T) => string
}

function ResultSection<T extends SearchResult>({
  label,
  docs,
  activeIndex,
  flatOffset,
  onHover,
  onClick,
  renderThumbnail,
  renderMeta,
  renderPrice,
  renderTitle,
}: ResultSectionProps<T>) {
  return (
    <div>
      <div className="px-5 pt-2 pb-1">
        <p className="font-display text-gold-600 text-[10px] font-semibold tracking-[0.18em] uppercase">
          {label}
        </p>
      </div>
      {docs.map((doc, i) => {
        const flatIndex = flatOffset + i
        const isActive = activeIndex === flatIndex
        return (
          <button
            key={doc.id}
            onClick={() => onClick(doc)}
            onMouseEnter={() => onHover(flatIndex)}
            className={cn(
              'flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors',
              isActive ? 'bg-brand-50' : 'hover:bg-neutral-50',
            )}
          >
            {renderThumbnail && renderThumbnail(doc)}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'font-display truncate text-sm font-medium',
                  isActive ? 'text-brand-700' : 'text-neutral-800',
                )}
              >
                {renderTitle(doc)}
              </p>
              {renderMeta && (
                <div className="mt-0.5 text-xs">{renderMeta(doc)}</div>
              )}
            </div>
            {renderPrice && (
              <div className="shrink-0 text-sm">{renderPrice(doc)}</div>
            )}
            {isActive && (
              <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            )}
          </button>
        )
      })}
    </div>
  )
}

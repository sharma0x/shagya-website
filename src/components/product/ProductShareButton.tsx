'use client'

import { useState, useEffect, useCallback } from 'react'
import { getProductUrl } from '@/lib/product-url'
import {
  Share2,
  X,
  Copy,
  Check,
  MessageCircle,
  Send,
  Twitter,
  Facebook,
  Mail,
} from 'lucide-react'

interface ProductShareButtonProps {
  productName: string
  productSlug: string
  productId: string | number
  productPrice?: number
  productImage?: string
}

export function ProductShareButton({
  productName,
  productSlug,
  productId,
  productPrice,
  productImage,
}: ProductShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const origin =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : 'https://shayga.in')
  const shareUrl = `${origin}${getProductUrl(productSlug, productId)}`

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleShareClick = useCallback(() => {
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: productName,
          text: `Discover ${productName} — handcrafted elegance by Shayga`,
          url: shareUrl,
        })
        .catch((err) => {
          // If user cancels or share fails, fallback to opening modal
          if (err.name !== 'AbortError') {
            setIsOpen(true)
          }
        })
    } else {
      setIsOpen(true)
    }
  }, [productName, shareUrl])

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        // Fallback for older browsers / non-HTTPS local env
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }, [shareUrl])

  const shareText = `Hi! I found this beautiful saree on Shayga: ${productName}`
  const encodedText = encodeURIComponent(shareText)
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(`Check out ${productName} on Shayga`)

  const shareChannels = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      icon: MessageCircle,
      bgColor: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      icon: Send,
      bgColor: 'bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20',
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: Twitter,
      bgColor: 'bg-neutral-900/10 text-neutral-900 hover:bg-neutral-900/20',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
      bgColor: 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20',
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(
        `Hi,\n\nI thought you might like this handcrafted saree from Shayga:\n\n${productName}\n${shareUrl}`,
      )}`,
      icon: Mail,
      bgColor: 'bg-amber-600/10 text-amber-700 hover:bg-amber-600/20',
    },
  ]

  return (
    <>
      {/* Floating Share Button */}
      <button
        type="button"
        onClick={handleShareClick}
        aria-label="Share product"
        title="Share product"
        className="group hover:bg-brand-900 hover:border-gold-400/40 fixed right-5 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700/40 bg-neutral-900 text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 lg:right-6 lg:bottom-6"
      >
        <Share2 className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
      </button>

      {/* Share Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="animate-in fade-in fixed inset-0 bg-neutral-950/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            className="animate-in fade-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close share options"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <Share2 className="text-brand-700 h-5 w-5" />
                <h3
                  id="share-dialog-title"
                  className="font-display text-lg font-semibold tracking-tight text-neutral-900"
                >
                  Share this Saree
                </h3>
              </div>
              <p className="font-body mt-1 text-xs text-neutral-500">
                Share handcrafted luxury with family & friends
              </p>
            </div>

            {/* Product Card Preview */}
            <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-neutral-100 bg-neutral-50/80 p-3">
              {productImage ? (
                <img
                  src={productImage}
                  alt={productName}
                  className="h-12 w-12 rounded-lg border border-neutral-200 object-cover"
                />
              ) : (
                <div className="bg-brand-50 border-brand-100 text-brand-800 font-display flex h-12 w-12 items-center justify-center rounded-lg border text-base font-semibold">
                  {productName.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-body truncate text-xs font-semibold text-neutral-900">
                  {productName}
                </p>
                {productPrice !== undefined && (
                  <p className="font-display mt-0.5 text-xs font-medium text-neutral-600">
                    ₹{productPrice.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            {/* Share Channels */}
            <div className="mt-5">
              <p className="font-body text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                Share via app
              </p>
              <div className="mt-2.5 grid grid-cols-5 gap-2">
                {shareChannels.map((channel) => {
                  const IconComponent = channel.icon
                  return (
                    <a
                      key={channel.name}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center transition-all ${channel.bgColor}`}
                      title={`Share on ${channel.name}`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-body text-[10px] leading-tight font-medium">
                        {channel.name}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Copy Link Section */}
            <div className="mt-5 border-t border-neutral-100 pt-4">
              <p className="font-body mb-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                Or copy link
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1.5 pl-3.5">
                <span className="flex-1 truncate font-mono text-xs text-neutral-600 select-all">
                  {shareUrl || 'Loading URL...'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

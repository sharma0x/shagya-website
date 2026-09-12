'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface DownloadReceiptButtonProps {
  orderNumber: string
  email?: string
  variant?: 'solid' | 'outline'
  className?: string
}

export function DownloadReceiptButton({
  orderNumber,
  email,
  variant = 'outline',
  className = '',
}: DownloadReceiptButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ orderNumber })
      if (email) params.set('email', email)

      const res = await fetch(`/api/orders/receipt?${params.toString()}`)

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(
          data?.error || 'Could not download the receipt. Please try again.',
        )
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `Shayga-${orderNumber}-receipt.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const solidClasses =
    'bg-brand-600 hover:bg-brand-700 text-white shadow-xs active:scale-95'
  const outlineClasses =
    'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={`font-display flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
          variant === 'solid' ? solidClasses : outlineClasses
        }`}
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {downloading ? 'Preparing…' : 'Download Receipt'}
      </button>
      {error && (
        <p className="font-body mt-2 text-center text-[11px] text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

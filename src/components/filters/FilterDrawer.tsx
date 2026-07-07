'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function FilterDrawer({ isOpen, onClose, children }: FilterDrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] overflow-hidden transition-all duration-300 lg:hidden',
        isOpen
          ? 'pointer-events-auto visible'
          : 'pointer-events-none invisible',
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-neutral-950/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-neutral-900">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="hover:text-brand-600 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-50"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-2">{children}</div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function FilterSection({
  title,
  defaultOpen = true,
  children,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-neutral-100 py-4 first:pt-0 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display text-xs font-semibold tracking-wider text-neutral-600 uppercase">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-neutral-400 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen
            ? 'mt-3 grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

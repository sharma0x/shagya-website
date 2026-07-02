'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Zap, Check } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

interface ProductCardActionsProps {
  productId: string | number
  productName: string
  product: any // full product object for addToCart
  isOutOfStock: boolean
  variant?: 'grid' | 'compact'
}

const defaultVariant = { size: 'Free', blouseSize: 'Unstitched' }

export function ProductCardActions({
  productId,
  productName,
  product,
  isOutOfStock,
  variant = 'grid',
}: ProductCardActionsProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock || added) return
    addItem(
      {
        id: Number(productId),
        name: productName,
        slug: (product.slug as string) || '',
        basePrice: (product.basePrice as number) || 0,
        compareAtPrice: product.compareAtPrice ?? undefined,
        gallery: product.gallery,
        fabric: (product.fabric as string) || '',
        weave: (product.weave as string) || '',
      },
      1,
      defaultVariant,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(
      {
        id: Number(productId),
        name: productName,
        slug: (product.slug as string) || '',
        basePrice: (product.basePrice as number) || 0,
        compareAtPrice: product.compareAtPrice ?? undefined,
        gallery: product.gallery,
        fabric: (product.fabric as string) || '',
        weave: (product.weave as string) || '',
      },
      1,
      defaultVariant,
    )
    router.push('/checkout')
  }

  if (isOutOfStock) return null

  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100',
        isCompact ? 'mt-1' : 'mt-2',
      )}
      onClick={(e) => e.preventDefault()}
    >
      <button
        onClick={handleAddToCart}
        disabled={added}
        className={cn(
          'font-display inline-flex items-center gap-1 rounded-lg text-[10px] font-semibold transition-all active:scale-95',
          added
            ? 'bg-green-500 text-white'
            : 'bg-brand-600 hover:bg-brand-700 text-white',
          isCompact ? 'h-7 px-2' : 'h-8 px-3',
        )}
      >
        {added ? (
          <>
            <Check className="h-3 w-3" />
            Added
          </>
        ) : (
          <>
            <ShoppingCart className="h-3 w-3" />
            {isCompact ? '' : 'Add'}
          </>
        )}
      </button>
      <button
        onClick={handleBuyNow}
        className={cn(
          'font-display inline-flex items-center gap-1 rounded-lg border border-neutral-200 text-[10px] font-semibold transition-colors hover:border-neutral-300 hover:bg-neutral-50',
          isCompact ? 'h-7 px-2' : 'h-8 px-3',
        )}
      >
        <Zap className="h-3 w-3" />
        {isCompact ? '' : 'Buy Now'}
      </button>
    </div>
  )
}

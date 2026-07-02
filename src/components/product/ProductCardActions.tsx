'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Zap, Check } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

interface ProductCardActionsProps {
  productId: string | number
  productName: string
  product: any
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
  const isCompact = variant === 'compact'

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

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={cn(
          'font-display flex w-full items-center justify-center rounded-md bg-neutral-100 text-[10px] font-semibold text-neutral-400',
          isCompact ? 'h-7' : 'h-8',
        )}
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div
      className={cn('flex w-full gap-1.5', isCompact ? 'flex-col' : 'flex-row')}
      onClick={(e) => e.preventDefault()}
    >
      <button
        onClick={handleAddToCart}
        disabled={added}
        className={cn(
          'font-display flex items-center justify-center rounded-md text-[10px] font-semibold transition-all active:scale-95',
          isCompact ? 'h-7 flex-1' : 'h-8 flex-1',
          added
            ? 'bg-green-500 text-white'
            : 'bg-neutral-900 text-white hover:bg-neutral-800',
        )}
      >
        {added ? (
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            Added
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" />
            {isCompact ? 'Add' : 'Add to Cart'}
          </span>
        )}
      </button>
      <button
        onClick={handleBuyNow}
        className={cn(
          'font-display flex items-center justify-center rounded-md border border-neutral-900 bg-white text-[10px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 active:scale-95',
          isCompact ? 'h-7 flex-1' : 'h-8 flex-1',
        )}
      >
        <Zap className="h-3 w-3" />
      </button>
    </div>
  )
}

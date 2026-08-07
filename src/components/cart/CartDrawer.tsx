'use client'

import { useCart } from '@/lib/store/cart'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart()

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] overflow-hidden transition-all duration-300',
        isOpen
          ? 'pointer-events-auto visible'
          : 'pointer-events-none invisible',
      )}
    >
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            Shopping Cart
          </h2>
          <button
            onClick={onClose}
            className="hover:text-brand-600 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-50"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="bg-brand-50 text-brand-600 flex h-16 w-16 items-center justify-center rounded-full">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="font-display mt-6 text-base font-semibold text-neutral-900">
                Your cart is empty
              </h3>
              <p className="font-body mt-2 max-w-xs text-sm text-neutral-500">
                Sarees woven on wooden looms across India are waiting to be
                draped.
              </p>
              <button
                onClick={onClose}
                className="bg-brand-600 hover:bg-brand-700 font-display mt-8 inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-colors active:scale-95"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, index) => {
                const imageUrl =
                  item.product.gallery?.[0]?.image &&
                  typeof item.product.gallery[0].image === 'object'
                    ? item.product.gallery[0].image.sizes?.thumbnail?.url ||
                      item.product.gallery[0].image.url
                    : '/images/placeholder.jpg'

                return (
                  <div
                    key={`${item.product.id}-${item.variant?.color?.slug || 'default'}`}
                    className="flex items-start gap-4 border-b border-neutral-100 pb-6 last:border-0"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display truncate text-sm font-semibold text-neutral-900">
                        {item.product.name}
                      </h4>
                      <p className="font-body mt-0.5 text-xs text-neutral-500">
                        {item.product.weave} · {item.product.fabric}
                      </p>
                      {item.variant?.size && (
                        <p className="font-body mt-1 text-[11px] text-neutral-400">
                          Size: {item.variant.size}
                        </p>
                      )}
                      {item.variant?.color && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-neutral-300"
                            style={{ backgroundColor: item.variant.color.hex }}
                          />
                          <span className="font-body text-[11px] text-neutral-500">
                            {item.variant.color.name}
                          </span>
                        </div>
                      )}

                      {/* Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-neutral-200">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.variant?.color?.slug,
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-display w-8 text-center text-xs font-semibold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.variant?.color?.slug,
                              )
                            }
                            disabled={
                              item.product.trackQuantity
                                ? item.quantity >= (item.product.quantity ?? 10)
                                : item.quantity >= 10
                            }
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(
                              item.product.id,
                              item.variant?.color?.slug,
                            )
                          }
                          className="p-2 text-neutral-400 transition-colors hover:text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="font-display text-sm font-semibold text-neutral-900">
                        ₹
                        {(item.unitPrice * item.quantity).toLocaleString(
                          'en-IN',
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="space-y-4 border-t border-neutral-100 bg-neutral-50/50 px-6 py-6">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-neutral-500">
                Subtotal
              </span>
              <span className="font-display text-lg font-semibold text-neutral-900">
                ₹{getSubtotal().toLocaleString('en-IN')}
              </span>
            </div>
            <p className="font-body text-xs leading-relaxed text-neutral-400">
              Shipping & taxes calculated at checkout. Easy 7-day returns.
            </p>
            <div className="grid gap-3 pt-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="bg-brand-600 hover:bg-brand-700 font-display flex h-12 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-xs transition-colors active:scale-95"
              >
                Proceed to checkout
              </Link>
              <button
                onClick={onClose}
                className="font-display hover:text-brand-800 flex h-11 items-center justify-center text-sm font-semibold text-neutral-600 transition-colors"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

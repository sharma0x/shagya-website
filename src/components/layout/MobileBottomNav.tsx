'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Grid3X3, Search, Heart, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/store/cart'
import { useUI } from '@/lib/store/ui'
import { useSession } from '@/lib/auth-client'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/category/all', label: 'Shop', icon: Grid3X3 },
  { label: 'Search', icon: Search, action: 'search' as const },
  { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: 'wishlist' as const },
  { label: 'Cart', icon: ShoppingCart, action: 'cart' as const, badge: 'cart' as const },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { items } = useCart()
  const { openSearch, openCart } = useUI()
  const { data: sessionData } = useSession()
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    if (!sessionData?.user) return
    fetch('/api/wishlist')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setWishlistCount(data?.items?.length || 0)
      })
      .catch(() => {})
  }, [sessionData])

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive =
            'href' in item && item.href
              ? item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
              : false

          const content = (
            <>
              <div className="relative">
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-brand-600' : 'text-neutral-500',
                  )}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                {item.badge === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold leading-none text-white">
                    {cartCount}
                  </span>
                )}
                {item.badge === 'wishlist' && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold leading-none text-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-none transition-colors',
                  isActive ? 'text-brand-600' : 'text-neutral-500',
                )}
              >
                {item.label}
              </span>
            </>
          )

          const className =
            'flex min-w-0 flex-1 flex-col items-center gap-1 py-2 transition-colors'

          if ('action' in item && item.action === 'search') {
            return (
              <button
                key="search"
                onClick={() => openSearch()}
                className={className}
                aria-label="Search"
              >
                {content}
              </button>
            )
          }

          if ('action' in item && item.action === 'cart') {
            return (
              <button
                key="cart"
                onClick={() => openCart()}
                className={className}
                aria-label="Cart"
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={className}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

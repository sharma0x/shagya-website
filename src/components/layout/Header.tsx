'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/Logo'
import { useCart } from '@/lib/store/cart'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchCommand } from '@/components/search/SearchCommand'
import { useSession } from '@/lib/auth-client'

const navLinks = [
  { label: 'Silk', href: '/category/silk' },
  { label: 'Cotton', href: '/category/cotton' },
  { label: 'Handloom', href: '/category/handloom' },
  { label: 'Designer', href: '/category/designer' },
  { label: 'Collections', href: '/collections' },
  { label: 'Journal', href: '/blog' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [announcement, setAnnouncement] = useState<{
    enabled: boolean
    text: string
  } | null>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const { items } = useCart()
  const { data: sessionData } = useSession()

  // Scroll listener for blur-on-scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!sessionData?.user) return
    fetch('/api/wishlist')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setWishlistCount(data?.items?.length || 0)
      })
      .catch(() => {})
  }, [sessionData])

  useEffect(() => {
    document.body.dataset.hydrated = 'true'
    fetch('/api/globals/site-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.announcementBar) setAnnouncement(data.announcementBar)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <>
      <header
        className={cn(
          'z-sticky sticky top-0 transition-all duration-300',
          scrolled ? 'bg-white/95 shadow-sm backdrop-blur-xl' : 'glass-panel',
        )}
      >
        {/* Announcement */}
        {announcement?.enabled && (
          <div className="bg-brand-600 relative overflow-hidden px-4 py-2 text-center text-xs text-white">
            {/* Decorative dots */}
            <span
              className="absolute top-1/2 left-4 hidden -translate-y-1/2 sm:block"
              aria-hidden="true"
            >
              <span className="inline-block h-1 w-1 rounded-full bg-white/30" />
              <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-white/30" />
            </span>
            <span
              className="absolute top-1/2 right-4 hidden -translate-y-1/2 sm:block"
              aria-hidden="true"
            >
              <span className="inline-block h-1 w-1 rounded-full bg-white/30" />
              <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-white/30" />
            </span>
            <span className="relative inline-flex items-center gap-2">
              <svg
                className="text-gold-300 h-3 w-3 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-medium tracking-wide">
                {announcement.text}
              </span>
            </span>
          </div>
        )}

        <div className="container-page">
          <div className="flex h-15 items-center justify-between gap-6">
            {/* Logo */}
            <Logo wordmarkClassName="text-neutral-900" />

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body hover:text-brand-700 after:bg-brand-600 relative rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Spacer */}
            <div className="hidden flex-1 lg:block" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="hover:text-brand-700 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link
                href="/account"
                className="hover:text-brand-700 hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 sm:inline-flex"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>

              <Link
                href="/wishlist"
                className={cn(
                  'hover:text-brand-700 relative hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 sm:inline-flex',
                  wishlistCount > 0 && 'text-brand-600',
                )}
                aria-label="Wishlist"
              >
                <Heart
                  className={cn(
                    'h-5 w-5',
                    wishlistCount > 0 && 'fill-brand-600',
                  )}
                />
                {wishlistCount > 0 && (
                  <span className="bg-brand-600 font-body absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-semibold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="hover:text-brand-700 relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="bg-brand-600 font-body absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[120] flex flex-col bg-white transition-all duration-500 lg:hidden',

          mobileMenuOpen
            ? 'pointer-events-auto translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-full opacity-0',
        )}
      >
        <div className="flex h-15 items-center justify-between border-b border-neutral-200 pr-1 pl-4">
          <Logo wordmarkClassName="text-neutral-900" />
          <button
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-4 sm:px-8">
          <div className="flex flex-col">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-body hover:text-brand-700 border-b border-neutral-100 py-3 text-lg font-medium text-neutral-700 transition-colors last:border-0',
                  mobileMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0',
                )}
                style={{ transitionDelay: `${i * 50 + 100}ms` }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div
            className={cn(
              'mt-6 flex flex-col gap-1 transition-all duration-500',
              mobileMenuOpen
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0',
            )}
            style={{ transitionDelay: `${navLinks.length * 50 + 100}ms` }}
          >
            <Link
              href="/account"
              className="font-body hover:text-brand-700 flex items-center gap-3 py-3 text-sm font-medium text-neutral-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              My Account
            </Link>
            <Link
              href="/wishlist"
              className="font-body hover:text-brand-700 flex items-center gap-3 py-3 text-sm font-medium text-neutral-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </Link>
          </div>
        </nav>
      </div>
      <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

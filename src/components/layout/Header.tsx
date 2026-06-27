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
  const [announcement, setAnnouncement] = useState<{
    enabled: boolean
    text: string
  } | null>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const { items } = useCart()
  const { data: sessionData } = useSession()

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
      <header className="z-sticky glass-panel sticky top-0">
        {/* Announcement */}
        {announcement?.enabled && (
          <div className="bg-brand-600 font-body px-4 py-2 text-center text-xs text-white">
            {announcement.text}
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
                className="hover:text-brand-700 rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
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
                className="hover:text-brand-700 relative rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="bg-brand-600 font-body absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-200 lg:hidden',
              mobileMenuOpen
                ? 'max-h-96 border-t border-neutral-200'
                : 'max-h-0',
            )}
          >
            <nav className="flex flex-col gap-0.5 px-2 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body hover:text-brand-700 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-neutral-200" />
              <Link
                href="/account"
                className="font-body rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Account
              </Link>
              <Link
                href="/wishlist"
                className="font-body rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
            </nav>
          </div>
        </div>

        {/* SearchCommand and CartDrawer are rendered outside the <header>
            so their position:fixed overlays escape the backdrop-filter
            containing block created by glass-panel. */}
      </header>
      <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

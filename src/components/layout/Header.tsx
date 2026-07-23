'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/Logo'
import { useCart } from '@/lib/store/cart'
import { useUI } from '@/lib/store/ui'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchCommand } from '@/components/search/SearchCommand'
import { useSession } from '@/lib/auth-client'

const megaMenu = {
  fabrics: [
    { label: 'Silk', value: 'silk' },
    { label: 'Cotton', value: 'cotton' },
    { label: 'Linen', value: 'linen' },
    { label: 'Georgette', value: 'georgette' },
    { label: 'Chiffon', value: 'chiffon' },
    { label: 'Crepe', value: 'crepe' },
    { label: 'Velvet', value: 'velvet' },
    { label: 'Net', value: 'net' },
    { label: 'Blend', value: 'blend' },
  ],
  weaves: [
    { label: 'Banarasi', value: 'banarasi' },
    { label: 'Kanchipuram', value: 'kanchipuram' },
    { label: 'Bandhani', value: 'bandhani' },
    { label: 'Patola', value: 'patola' },
    { label: 'Kalamkari', value: 'kalamkari' },
    { label: 'Ikat', value: 'ikkat' },
    { label: 'Paithani', value: 'paithani' },
    { label: 'Maheshwari', value: 'maheshwari' },
    { label: 'Chanderi', value: 'chanderi' },
    { label: 'Tant', value: 'tant' },
    { label: 'Baluchari', value: 'baluchari' },
  ],
}

const topNav = [
  { label: 'Collections', href: '/collections' },
  { label: 'Journal', href: '/blog' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const [announcement, setAnnouncement] = useState<{
    enabled: boolean
    text: string
  } | null>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const { items } = useCart()
  const { data: sessionData } = useSession()
  const { cartOpen, searchOpen, openCart, openSearch, closeCart, closeSearch } =
    useUI()

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
        openSearch()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openSearch])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false)
      }
    }
    if (megaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [megaMenuOpen])

  useEffect(() => {
    return () => { if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current) }
  }, [])

  const openMegaMenu = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current)
    setMegaMenuOpen(true)
  }

  const closeMegaMenu = () => {
    megaMenuTimeout.current = setTimeout(() => setMegaMenuOpen(false), 150)
  }

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
              {/* Sarees with mega dropdown */}
              <div
                ref={megaMenuRef}
                className="relative"
                onMouseEnter={() => openMegaMenu()}
                onMouseLeave={() => closeMegaMenu()}
              >
                <Link
                  href="/category/all"
                  className="font-body hover:text-brand-700 after:bg-brand-600 relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100"
                >
                  Sarees
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                </Link>

                {megaMenuOpen && (
                  <div
                    className="absolute left-0 top-full z-50"
                    onMouseEnter={() => openMegaMenu()}
                    onMouseLeave={() => closeMegaMenu()}
                  >
                    <div className="overflow-hidden border-x border-b border-neutral-100 bg-white shadow-lg min-w-[600px]">
                    <div className="flex gap-12 px-10 py-6">
                      {/* Fabric column */}
                      <div>
                        <h4 className="font-display mb-3 text-[10px] font-semibold tracking-wider text-brand-600 uppercase">
                          Fabric
                        </h4>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-1.5">
                          {megaMenu.fabrics.map((f) => (
                            <Link
                              key={f.value}
                              href={`/category/${f.value}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="font-body hover:text-brand-700 after:bg-brand-600 relative whitespace-nowrap rounded px-1.5 py-0.5 text-sm text-neutral-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100"
                            >
                              {f.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Weave column */}
                      <div>
                        <h4 className="font-display mb-3 text-[10px] font-semibold tracking-wider text-brand-600 uppercase">
                          Weave
                        </h4>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-1.5">
                          {megaMenu.weaves.map((w) => (
                            <Link
                              key={w.value}
                              href={`/category/${w.value}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="font-body hover:text-brand-700 after:bg-brand-600 relative whitespace-nowrap rounded px-1.5 py-0.5 text-sm text-neutral-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100"
                            >
                              {w.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Shop All */}
                    <div className="border-t border-neutral-100 px-10 py-3">
                      <Link
                        href="/category/all"
                        onClick={() => setMegaMenuOpen(false)}
                        className="font-display after:bg-brand-600 relative text-brand-600 hover:text-brand-700 text-xs font-semibold tracking-wider uppercase transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100"
                      >
                        Shop All Sarees →
                      </Link>
                    </div>
                    </div>
                  </div>
                )}
              </div>

              {topNav.map((link) => (
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
                onClick={() => openSearch()}
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
                onClick={() => openCart()}
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
            <Link
              href="/category/all"
              className={cn(
                'font-body hover:text-brand-700 border-b border-neutral-100 py-3 text-lg font-medium text-neutral-700 transition-colors',
                mobileMenuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0',
              )}
              style={{ transitionDelay: '150ms' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sarees
            </Link>
            {topNav.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-body hover:text-brand-700 border-b border-neutral-100 py-3 text-lg font-medium text-neutral-700 transition-colors last:border-0',
                  mobileMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0',
                )}
                style={{ transitionDelay: `${(i + 1) * 50 + 100}ms` }}
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
            style={{ transitionDelay: `${(topNav.length + 1) * 50 + 100}ms` }}
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
      <SearchCommand isOpen={searchOpen} onClose={() => closeSearch()} />
      <CartDrawer isOpen={cartOpen} onClose={() => closeCart()} />
    </>
  )
}

'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/Logo'
import { useCart } from '@/lib/store/cart'
import { useUI } from '@/lib/store/ui'
import { useWishlistStore } from '@/lib/store/wishlist'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchCommand } from '@/components/search/SearchCommand'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
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
  const [mobileSareesOpen, setMobileSareesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [announcement, setAnnouncement] = useState<{
    enabled: boolean
    announcements: { text: string; link?: string }[]
  } | null>(null)
  const [activeAnnouncement, setActiveAnnouncement] = useState(0)
  const announcementTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { items } = useCart()
  const { data: sessionData } = useSession()
  const { cartOpen, searchOpen, openCart, openSearch, closeCart, closeSearch } =
    useUI()
  const wishlistCount = useWishlistStore((state) => state.productIds.length)
  const isWishlistInitialized = useWishlistStore((state) => state.isInitialized)
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)
  const clearWishlist = useWishlistStore((state) => state.clearWishlist)

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
    if (sessionData?.user) {
      if (!isWishlistInitialized) fetchWishlist()
    } else {
      clearWishlist()
    }
  }, [sessionData, isWishlistInitialized, fetchWishlist, clearWishlist])

  useEffect(() => {
    document.body.dataset.hydrated = 'true'
    fetch('/api/globals/site-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.announcementBar) setAnnouncement(data.announcementBar)
      })
      .catch(() => {})
  }, [])

  // Auto-rotate announcements every 5 seconds
  useEffect(() => {
    const count = announcement?.announcements?.length || 0
    if (count <= 1) return

    announcementTimer.current = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % count)
    }, 5000)

    return () => {
      if (announcementTimer.current) clearInterval(announcementTimer.current)
    }
  }, [announcement?.announcements?.length])

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

  // Sync guest cart on login — push localStorage items to server and hydrate merged result
  const prevUserRef = useRef<any>(null)

  useEffect(() => {
    if (sessionData?.user && !prevUserRef.current) {
      const { items, syncWithServer, loadFromServer } = useCart.getState()
      if (items.length > 0) {
        syncWithServer().then(() => loadFromServer())
      }
    }
    prevUserRef.current = sessionData?.user
  }, [sessionData?.user])

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
        {announcement?.enabled && announcement.announcements?.length > 0 && (
          <div className="bg-brand-600 relative flex items-center justify-center overflow-hidden px-10 py-2 text-center text-xs text-white">
            <div
              className="relative grid items-center"
              style={{ gridTemplateAreas: '"slide"' }}
            >
              {announcement.announcements.map((item, i) => {
                const offset = i - activeAnnouncement
                const isActive = offset === 0
                const textEl = (
                  <span
                    key={`${i}-${item.text}`}
                    className="font-medium tracking-wide whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                    style={{
                      gridArea: 'slide',
                      transform: `translateX(${offset * 30}%)`,
                      opacity: isActive ? 1 : 0,
                    }}
                  >
                    {item.text}
                  </span>
                )
                if (item.link) {
                  return (
                    <a
                      key={i}
                      href={item.link}
                      className="relative z-10"
                      style={{ gridArea: 'slide' }}
                      aria-label={item.text}
                    >
                      {textEl}
                    </a>
                  )
                }
                return textEl
              })}
            </div>
            {/* Arrow navigation for multiple announcements */}
            {announcement.announcements.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveAnnouncement(
                      (prev) =>
                        (prev - 1 + announcement.announcements.length) %
                        announcement.announcements.length,
                    )
                  }
                  className="absolute top-1/2 left-1 -translate-y-1/2 p-1.5 text-white/60 transition-all duration-200 hover:scale-110 hover:text-white"
                  aria-label="Previous announcement"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setActiveAnnouncement(
                      (prev) => (prev + 1) % announcement.announcements.length,
                    )
                  }
                  className="absolute top-1/2 right-1 -translate-y-1/2 p-1.5 text-white/60 transition-all duration-200 hover:scale-110 hover:text-white"
                  aria-label="Next announcement"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}

        <div className="container-page">
          <div className="flex h-15 items-center justify-between gap-6">
            {/* Logo */}
            <Logo wordmarkClassName="text-neutral-900" />

            {/* Desktop Nav */}
            <div className="hidden items-center lg:flex">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="font-body hover:text-brand-700 after:bg-brand-600 relative h-auto rounded-lg bg-transparent px-3 py-2 text-sm font-medium text-neutral-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:transition-transform hover:bg-transparent hover:after:scale-x-100">
                      Sarees
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex divide-x divide-neutral-100">
                        {/* Fabric column */}
                        <div className="min-w-max px-8 py-6">
                          <h4 className="font-display text-gold-500 mb-4 text-[11px] font-semibold tracking-[0.15em] uppercase">
                            By Fabric
                          </h4>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                            {megaMenu.fabrics.map((f) => (
                              <NavigationMenuLink
                                key={f.value}
                                render={<Link href={`/category/${f.value}`} />}
                                className="font-body hover:text-brand-700 hover:bg-brand-50/60 block rounded-md px-2.5 py-1.5 text-sm tracking-wide whitespace-nowrap text-neutral-600 transition-colors"
                              >
                                {f.label}
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>

                        {/* Weave column */}
                        <div className="min-w-max px-8 py-6">
                          <h4 className="font-display text-gold-500 mb-4 text-[11px] font-semibold tracking-[0.15em] uppercase">
                            By Weave
                          </h4>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                            {megaMenu.weaves.map((w) => (
                              <NavigationMenuLink
                                key={w.value}
                                render={<Link href={`/category/${w.value}`} />}
                                className="font-body hover:text-brand-700 hover:bg-brand-50/60 block rounded-md px-2.5 py-1.5 text-sm tracking-wide whitespace-nowrap text-neutral-600 transition-colors"
                              >
                                {w.label}
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>

                        {/* Featured Panel */}
                        <div className="flex w-48 flex-col justify-between bg-neutral-50/80 px-6 py-6">
                          <div>
                            <h4 className="font-display text-gold-500 mb-4 text-[11px] font-semibold tracking-[0.15em] uppercase">
                              Curated
                            </h4>
                            <NavigationMenuLink
                              render={<Link href="/collections" />}
                              className="font-display text-brand-600 hover:text-brand-700 block text-sm leading-relaxed font-medium tracking-wide whitespace-nowrap transition-colors"
                            >
                              New Arrivals
                            </NavigationMenuLink>
                            <NavigationMenuLink
                              render={<Link href="/category/silk" />}
                              className="font-display text-brand-600 hover:text-brand-700 mt-2 block text-sm leading-relaxed font-medium tracking-wide whitespace-nowrap transition-colors"
                            >
                              Pure Silks
                            </NavigationMenuLink>
                            <NavigationMenuLink
                              render={<Link href="/category/banarasi" />}
                              className="font-display text-brand-600 hover:text-brand-700 mt-2 block text-sm leading-relaxed font-medium tracking-wide whitespace-nowrap transition-colors"
                            >
                              Banarasi Heritage
                            </NavigationMenuLink>
                          </div>
                          <NavigationMenuLink
                            render={<Link href="/category/all" />}
                            className="font-display text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
                          >
                            Shop All
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {topNav.map((link) => (
                    <NavigationMenuItem key={link.href}>
                      <NavigationMenuLink
                        render={<Link href={link.href} />}
                        className="font-body hover:text-brand-700 after:bg-brand-600 relative rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

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
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
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
            <button
              onClick={() => setMobileSareesOpen(!mobileSareesOpen)}
              className={cn(
                'font-body hover:text-brand-700 flex items-center justify-between border-b border-neutral-100 py-3 text-lg font-medium text-neutral-700 transition-colors',
                mobileMenuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0',
              )}
              style={{ transitionDelay: '150ms' }}
            >
              Sarees
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-neutral-400 transition-transform',
                  mobileSareesOpen && 'rotate-180',
                )}
              />
            </button>

            {mobileSareesOpen && (
              <div className="border-b border-neutral-100 pt-1 pb-4">
                {/* Fabric */}
                <p className="text-gold-500 font-display mt-2 mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase">
                  By Fabric
                </p>
                <div className="grid grid-cols-2 gap-0.5">
                  {megaMenu.fabrics.map((f) => (
                    <Link
                      key={f.value}
                      href={`/category/${f.value}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-body hover:text-brand-700 block rounded-md px-3 py-1.5 text-sm tracking-wide text-neutral-600 transition-colors"
                    >
                      {f.label}
                    </Link>
                  ))}
                </div>

                {/* Weave */}
                <p className="text-gold-500 font-display mt-3 mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase">
                  By Weave
                </p>
                <div className="grid grid-cols-2 gap-0.5">
                  {megaMenu.weaves.map((w) => (
                    <Link
                      key={w.value}
                      href={`/category/${w.value}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-body hover:text-brand-700 block rounded-md px-3 py-1.5 text-sm tracking-wide text-neutral-600 transition-colors"
                    >
                      {w.label}
                    </Link>
                  ))}
                </div>

                {/* Shop All */}
                <Link
                  href="/category/all"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-brand-600 hover:text-brand-700 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Shop All Sarees
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
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

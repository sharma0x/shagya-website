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
import dynamic from 'next/dynamic'
import { Logo } from '@/components/layout/Logo'
import { useCart } from '@/lib/store/cart'
import { useUI } from '@/lib/store/ui'
import { useWishlistStore } from '@/lib/store/wishlist'

const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false },
)
const SearchCommand = dynamic(
  () =>
    import('@/components/search/SearchCommand').then(
      (mod) => mod.SearchCommand,
    ),
  { ssr: false },
)

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

// The dynamic taxonomies will be passed as a prop instead of this hardcoded array

const topNav = [
  { label: 'Collections', href: '/collections' },
  { label: 'Journal', href: '/blog' },
  { label: 'About Us', href: '/about' },
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
  const [taxonomies, setTaxonomies] = useState<{
    categories?: { name: string; slug: string }[]
    fabricTypes?: { name: string; slug: string }[]
    brands?: { name: string; slug: string }[]
    occasions?: { name: string; slug: string }[]
  } | null>(null)
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

    // Fetch taxonomy nav menus client-side to keep the layout free of DB reads
    Promise.all([
      fetch('/api/categories?limit=100&depth=0').then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch('/api/fabric-types?limit=100&depth=0').then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch('/api/brands?limit=100&depth=0').then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch('/api/occasions?limit=100&depth=0').then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([cats, fabrics, brands, occasions]) => {
        if (cats || fabrics || brands || occasions) {
          setTaxonomies({
            categories: cats?.docs || [],
            fabricTypes: fabrics?.docs || [],
            brands: brands?.docs || [],
            occasions: occasions?.docs || [],
          })
        }
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
        syncWithServer('merge').then(() => loadFromServer())
      } else {
        loadFromServer()
      }
    }
    prevUserRef.current = sessionData?.user
  }, [sessionData?.user])

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  // Use dynamic taxonomies passed from the server component
  const fabrics =
    taxonomies?.fabricTypes?.map((f: any) => ({
      label: f.name || f.title,
      value: f.slug,
    })) || []
  const categories =
    taxonomies?.categories?.map((c: any) => ({
      label: c.name || c.title,
      value: c.slug,
    })) || []
  const brands =
    taxonomies?.brands?.map((b: any) => ({
      label: b.name || b.title,
      value: b.slug,
    })) || []
  const occasions =
    taxonomies?.occasions?.map((o: any) => ({
      label: o.name || o.title,
      value: o.slug,
    })) || []

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
                        {/* Category column */}
                        {categories.length > 0 && (
                          <div className="min-w-max px-5 py-6">
                            <h4 className="font-display text-gold-500 mb-4 text-[11px] font-semibold tracking-[0.15em] uppercase">
                              By Category
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                              {categories.map((c: any) => (
                                <NavigationMenuLink
                                  key={c.value}
                                  render={
                                    <Link href={`/category/${c.value}`} />
                                  }
                                  className="font-body hover:text-brand-700 hover:bg-brand-50/60 block rounded-md px-2.5 py-1.5 text-sm tracking-wide whitespace-nowrap text-neutral-600 transition-colors"
                                >
                                  {c.label}
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fabric column */}
                        {fabrics.length > 0 && (
                          <div className="min-w-max px-5 py-6">
                            <h4 className="font-display text-gold-500 mb-4 text-[11px] font-semibold tracking-[0.15em] uppercase">
                              By Fabric
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                              {fabrics.map((f: any) => (
                                <NavigationMenuLink
                                  key={f.value}
                                  render={
                                    <Link
                                      href={`/category/all?fabric=${f.value}`}
                                    />
                                  }
                                  className="font-body hover:text-brand-700 hover:bg-brand-50/60 block rounded-md px-2.5 py-1.5 text-sm tracking-wide whitespace-nowrap text-neutral-600 transition-colors"
                                >
                                  {f.label}
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Brands column */}
                        {brands.length > 0 && (
                          <div className="min-w-max px-5 py-6">
                            <h4 className="font-display text-gold-500 mb-4 text-[11px] font-semibold tracking-[0.15em] uppercase">
                              By Brand
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                              {brands.map((b: any) => (
                                <NavigationMenuLink
                                  key={b.value}
                                  render={
                                    <Link
                                      href={`/category/all?brand=${b.value}`}
                                    />
                                  }
                                  className="font-body hover:text-brand-700 hover:bg-brand-50/60 block rounded-md px-2.5 py-1.5 text-sm tracking-wide whitespace-nowrap text-neutral-600 transition-colors"
                                >
                                  {b.label}
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Occasions column */}
                        {occasions.length > 0 && (
                          <div className="min-w-max px-5 py-6">
                            <h4 className="font-display text-gold-500 mb-4 text-[11px] font-semibold tracking-[0.15em] uppercase">
                              By Occasion
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                              {occasions.map((o: any) => (
                                <NavigationMenuLink
                                  key={o.value}
                                  render={
                                    <Link
                                      href={`/category/all?occasion=${o.value}`}
                                    />
                                  }
                                  className="font-body hover:text-brand-700 hover:bg-brand-50/60 block rounded-md px-2.5 py-1.5 text-sm tracking-wide whitespace-nowrap text-neutral-600 transition-colors"
                                >
                                  {o.label}
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Featured Panel */}
                        <div className="flex w-44 flex-col justify-between bg-neutral-50/80 py-6 pr-6 pl-5">
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
                {/* Category */}
                {categories.length > 0 && (
                  <>
                    <p className="text-gold-500 font-display mt-2 mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase">
                      By Category
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {categories.map((c: any) => (
                        <Link
                          key={c.value}
                          href={`/category/${c.value}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="font-body hover:text-brand-700 block rounded-md px-3 py-1.5 text-sm tracking-wide text-neutral-600 transition-colors"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {/* Fabric */}
                {fabrics.length > 0 && (
                  <>
                    <p className="text-gold-500 font-display mt-3 mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase">
                      By Fabric
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {fabrics.map((f: any) => (
                        <Link
                          key={f.value}
                          href={`/category/all?fabric=${f.value}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="font-body hover:text-brand-700 block rounded-md px-3 py-1.5 text-sm tracking-wide text-neutral-600 transition-colors"
                        >
                          {f.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {/* Brand */}
                {brands.length > 0 && (
                  <>
                    <p className="text-gold-500 font-display mt-3 mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase">
                      By Brand
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {brands.map((b: any) => (
                        <Link
                          key={b.value}
                          href={`/category/all?brand=${b.value}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="font-body hover:text-brand-700 block rounded-md px-3 py-1.5 text-sm tracking-wide text-neutral-600 transition-colors"
                        >
                          {b.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {/* Occasion */}
                {occasions.length > 0 && (
                  <>
                    <p className="text-gold-500 font-display mt-3 mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase">
                      By Occasion
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {occasions.map((o: any) => (
                        <Link
                          key={o.value}
                          href={`/category/all?occasion=${o.value}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="font-body hover:text-brand-700 block rounded-md px-3 py-1.5 text-sm tracking-wide text-neutral-600 transition-colors"
                        >
                          {o.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}

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

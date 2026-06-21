'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  return (
    <header className="sticky top-0 z-sticky border-b border-neutral-200 bg-surface/95 backdrop-blur-md">
      {/* Announcement */}
      <div className="bg-brand-600 px-4 py-2 text-center font-body text-xs text-white">
        Free shipping on orders above ₹999 &nbsp;·&nbsp; Easy 7-day returns
      </div>

      <div className="container-page">
        <div className="flex h-15 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="font-display text-xl font-semibold tracking-tight text-neutral-900">
              Shagya
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 font-body text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-700"
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
              className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-700"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/account"
              className="hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-700 sm:inline-flex"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            <Link
              href="/wishlist"
              className="hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-700 sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              className="relative rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-700"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-600 font-body text-[10px] font-semibold text-white">
                0
              </span>
            </Link>

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
                className="rounded-lg px-3 py-2.5 font-body text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-neutral-200" />
            <Link
              href="/account"
              className="rounded-lg px-3 py-2.5 font-body text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Account
            </Link>
            <Link
              href="/wishlist"
              className="rounded-lg px-3 py-2.5 font-body text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wishlist
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

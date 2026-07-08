import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

const footerLinks = {
  shop: {
    title: 'Shop',
    links: [
      { label: 'Silk Sarees', href: '/category/silk' },
      { label: 'Cotton Sarees', href: '/category/cotton' },
      { label: 'Handloom', href: '/category/handloom' },
      { label: 'Designer', href: '/category/designer' },
      { label: 'New Arrivals', href: '/collections' },
      { label: 'Bestsellers', href: '/category/silk' },
    ],
  },
  company: {
    title: 'Shayga',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Journal', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  support: {
    title: 'Help',
    links: [
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns & Exchange', href: '/shipping' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
  connect: {
    title: 'Connect',
    links: [
      { label: 'Instagram', href: 'https://instagram.com/shayga' },
      { label: 'Facebook', href: 'https://facebook.com/shayga' },
      { label: 'Pinterest', href: 'https://pinterest.com/shayga' },
      { label: 'WhatsApp', href: 'https://wa.me/919876543210' },
    ],
  },
}

function PaymentIcon({ label }: { label: string }) {
  return (
    <span className="rounded border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-400 tracking-wide">
      {label}
    </span>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="container-page py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-12 lg:gap-10">
          <div className="col-span-2 lg:col-span-4">
            <Logo wordmarkClassName="text-neutral-900" className="h-8 w-8" />
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              Handcrafted Indian sarees, woven with tradition. Premium silk,
              cotton, and designer sarees delivered to your doorstep.
            </p>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="col-span-1 lg:col-span-2">
              <h3 className="font-display mb-4 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-brand-700 inline-block py-1.5 text-sm text-neutral-600 transition-colors sm:py-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-6 border-t border-neutral-200 pt-8 sm:mt-16">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-neutral-400">
              &copy; {new Date().getFullYear()} Shayga. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[10px] text-neutral-400 tracking-wide">
                We accept
              </span>
              <PaymentIcon label="Visa" />
              <PaymentIcon label="Mastercard" />
              <PaymentIcon label="UPI" />
              <PaymentIcon label="Net Banking" />
              <PaymentIcon label="Razorpay" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-neutral-100 pt-5 text-[11px] text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-3 w-3 text-brand-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
              SSL Secure Checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-3 w-3 text-brand-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Handloom Verified
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-3 w-3 text-brand-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Maker Traced
            </span>
            <span>Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

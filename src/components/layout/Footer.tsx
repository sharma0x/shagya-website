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

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="container-page py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <Logo wordmarkClassName="text-neutral-900" className="h-8 w-8" />
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Handcrafted Indian sarees, woven with tradition. Premium silk,
              cotton, and designer sarees delivered to your doorstep.
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h3 className="font-display mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-brand-700 text-sm text-neutral-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 md:flex-row">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Shayga. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">We accept:</span>
            {['💳', '📱', '🏦', '⚡'].map((icon, i) => (
              <span key={i} className="text-base" aria-hidden="true">
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

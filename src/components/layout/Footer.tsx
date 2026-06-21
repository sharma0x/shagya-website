import Link from 'next/link'

const footerLinks = {
  shop: {
    title: 'Shop',
    links: [
      { label: 'Silk Sarees', href: '/category/silk' },
      { label: 'Cotton Sarees', href: '/category/cotton' },
      { label: 'Handloom', href: '/category/handloom' },
      { label: 'Designer', href: '/category/designer' },
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'Bestsellers', href: '/bestsellers' },
    ],
  },
  company: {
    title: 'Shagya',
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
      { label: 'Returns & Exchange', href: '/returns' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
  connect: {
    title: 'Connect',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'Facebook', href: '#' },
      { label: 'Pinterest', href: '#' },
      { label: 'WhatsApp', href: '#' },
    ],
  },
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="font-display text-lg font-semibold tracking-tight text-neutral-900"
            >
              Shagya
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
              Handcrafted Indian sarees, woven with tradition. Premium silk,
              cotton, and designer sarees delivered to your doorstep.
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 font-display text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 transition-colors hover:text-brand-700"
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
            &copy; {new Date().getFullYear()} Shagya. All rights reserved.
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

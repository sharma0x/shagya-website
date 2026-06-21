import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-gradient-to-b from-brand-50 to-surface">
        {/* Subtle texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 50%, oklch(0.65 0.18 65) 0%, transparent 60%)',
          }}
        />
        <div className="container-page relative w-full">
          <div className="mx-auto max-w-3xl py-20 text-center">
            <p className="mb-4 font-display text-sm font-medium tracking-[0.2em] text-brand-600 uppercase">
              Indian Craftsmanship
            </p>
            <h1 className="text-hero mb-6 font-display font-semibold tracking-tight text-neutral-900">
              Every weave tells a story
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-neutral-500">
              Handpicked sarees from India&apos;s finest weavers. Premium silk,
              cotton, and designer pieces delivered to your doorstep.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/category/silk"
                className="inline-flex h-12 items-center rounded-xl bg-brand-600 px-8 text-sm font-medium text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
              >
                Explore Silk Sarees
              </Link>
              <Link
                href="/collections"
                className="inline-flex h-12 items-center rounded-xl border border-neutral-200 bg-surface px-8 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50"
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-neutral-100 bg-surface">
        <div className="container-page grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {[
            { label: 'Free Shipping', detail: 'On orders above ₹999' },
            { label: 'Easy Returns', detail: '7-day return policy' },
            { label: 'Quality Verified', detail: 'Every piece inspected' },
            { label: 'Support', detail: 'WhatsApp & phone' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-display text-sm font-semibold text-neutral-800">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-neutral-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-md text-center">
            <p className="mb-2 font-display text-xs font-medium tracking-[0.15em] text-brand-600 uppercase">
              Browse
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
              Shop by craft
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
            {[
              { name: 'Silk', hue: 65 },
              { name: 'Cotton', hue: 140 },
              { name: 'Handloom', hue: 30 },
              { name: 'Designer', hue: 280 },
              { name: 'Party Wear', hue: 350 },
              { name: 'Bridal', hue: 10 },
            ].map(({ name, hue }) => (
              <Link
                key={name}
                href={`/category/${name.toLowerCase().replace(' ', '-')}`}
                className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-surface p-6 text-center transition-all hover:border-brand-200 hover:shadow-md"
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `oklch(0.93 ${0.04} ${hue})`,
                  }}
                >
                  <span className="text-xl">🧵</span>
                </div>
                <span className="font-display text-sm font-medium text-neutral-800">
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Story CTA */}
      <section className="relative overflow-hidden bg-brand-600 py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 70% 30%, oklch(1 0 0) 0%, transparent 50%)',
          }}
        />
        <div className="container-page relative text-center">
          <p className="mb-3 font-display text-xs font-medium tracking-[0.2em] text-brand-200 uppercase">
            New arrivals weekly
          </p>
          <h2 className="mb-5 font-display text-3xl font-semibold text-white md:text-4xl">
            Find your perfect drape
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-brand-100 leading-relaxed">
            Every week we add fresh pieces from artisans across India. From
            Banarasi brocades to Kanchipuram silks.
          </p>
          <Link
            href="/new-arrivals"
            className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-medium text-brand-700 transition-all hover:bg-brand-50 active:scale-[0.98]"
          >
            See What&apos;s New
          </Link>
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import Script from 'next/script'
import { Public_Sans, Sora, Noto_Sans_Devanagari } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { MetaPixel } from '@/components/analytics/MetaPixel'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { openGraph } from '@/lib/seo'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-devanagari',
})

export const metadata: Metadata = {
  title: {
    template: '%s — Shayga',
    default: 'Shayga — Handcrafted Indian Sarees',
  },
  description:
    'Shop handcrafted Indian sarees at Shayga. Premium silk, cotton, and designer sarees with free shipping in India.',
  keywords: [
    'sarees',
    'Indian sarees',
    'silk sarees',
    'handloom sarees',
    'designer sarees',
    'buy sarees online',
    'Shayga',
  ],
  // Site-wide OpenGraph/Twitter fallback. Individual routes (product, category,
  // collection) override these via generateMetadata; this guarantees no page
  // ever renders an imageless share card.
  ...openGraph({
    title: 'Shayga — Handcrafted Indian Sarees',
    description:
      'Shop handcrafted Indian sarees at Shayga. Premium silk, cotton, and designer sarees with free shipping in India.',
    image: '/images/hero/hero-main.png',
  }),
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const metaPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID

  return (
    <html
      lang="en"
      className={`${sora.variable} ${publicSans.variable} ${notoSansDevanagari.variable}`}
      suppressHydrationWarning
    >
      <head>
        {metaPixelId && (
          <Script
            id="meta-pixel-script"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${metaPixelId}');fbq('track', 'PageView');`,
            }}
          />
        )}
        {metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
      </head>
      <body className="font-body flex min-h-screen flex-col pb-16 antialiased lg:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
        <div
          id="recaptcha-container"
          className="pointer-events-none fixed right-4 bottom-4 z-[9999]"
        />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
      {metaPixelId && <MetaPixel />}
    </html>
  )
}

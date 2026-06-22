import type { Metadata } from 'next'
import { Public_Sans, Sora, Noto_Sans_Devanagari } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-devanagari',
})

export const metadata: Metadata = {
  title: {
    template: '%s — Shagya',
    default: 'Shagya — Handcrafted Indian Sarees',
  },
  description:
    'Shop handcrafted Indian sarees at Shagya. Premium silk, cotton, and designer sarees with free shipping in India.',
  keywords: [
    'sarees',
    'Indian sarees',
    'silk sarees',
    'handloom sarees',
    'designer sarees',
    'buy sarees online',
    'Shagya',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${publicSans.variable} ${notoSansDevanagari.variable}`}
    >
      <body className="font-body flex min-h-screen flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

/* ==========================================================================
   Payload Admin Layout — root layout for /admin and /api routes
   Payload manages its own layout inside this.
   ========================================================================== */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shagya Admin',
  description: 'Shagya — Saree E-Commerce Admin Panel',
}

export default function PayloadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

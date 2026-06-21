/* ==========================================================================
   Payload Admin — Not Found (404) handler for admin routes
   ========================================================================== */

import type { Metadata } from 'next'
import { NotFoundPage } from '@payloadcms/next/views'

export const metadata: Metadata = {
  title: 'Page Not Found — Shagya Admin',
}

export default NotFoundPage

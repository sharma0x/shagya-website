'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { PageLoader } from '@/components/ui/PageLoader'

export function NavigationLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const pendingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const prevRef = useRef(pathname)

  useEffect(() => {
    if (prevRef.current !== pathname) {
      prevRef.current = pathname
      pendingRef.current = false
      clearTimeout(timerRef.current)
      setVisible(false)
    }
  }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const target = e.target as HTMLElement
      // Only treat clicks whose closest interactive element IS the anchor as
      // navigation. Buttons/inputs nested inside a card <Link> (add-to-cart,
      // wishlist, etc.) call preventDefault and must NOT arm the loader —
      // otherwise the overlay sticks forever (pathname never changes).
      const interactive = target.closest(
        'a[href], button, input, select, textarea, [role="button"]',
      )
      if (!interactive || interactive.tagName !== 'A') return

      const link = interactive as HTMLAnchorElement
      const href = link.getAttribute('href')
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      )
        return

      pendingRef.current = true
      timerRef.current = setTimeout(() => {
        if (pendingRef.current) setVisible(true)
      }, 120)
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      clearTimeout(timerRef.current)
    }
  }, [])

  if (!visible) return null

  return <PageLoader />
}

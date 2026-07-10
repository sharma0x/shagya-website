'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
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

  return (
    <div className="bg-brand-600/30 fixed top-0 right-0 left-0 z-[9999] h-0.5">
      <div className="animate-loader-bar bg-brand-500 h-full w-full" />
    </div>
  )
}

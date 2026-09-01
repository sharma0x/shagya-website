'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Client-side countdown for OTP resend. Owns the interval lifecycle so the
 * timer is always cleared on unmount and restarting never leaks a prior tick.
 */
export function useOtpCooldown(defaultSeconds = 30) {
  const [cooldown, setCooldown] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startCooldown = useCallback(
    (seconds: number = defaultSeconds) => {
      stop()
      setCooldown(seconds)
      intervalRef.current = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    },
    [stop, defaultSeconds],
  )

  useEffect(() => {
    if (cooldown <= 0) stop()
  }, [cooldown, stop])

  useEffect(() => stop, [stop])

  return { cooldown, startCooldown }
}

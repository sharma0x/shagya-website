'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { isDocumentEvent, ready } from '@payloadcms/live-preview'
import { getServerURL } from '@/lib/env'

export function RefreshRouteOnSave() {
  const router = useRouter()
  const hasSentReadyMessage = useRef(false)

  const serverURL = getServerURL()

  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (isDocumentEvent(event, serverURL)) {
        router.refresh()
      }
    },
    [router, serverURL],
  )

  useEffect(() => {
    window.addEventListener('message', onMessage)
    if (!hasSentReadyMessage.current) {
      hasSentReadyMessage.current = true
      ready({ serverURL })
    }
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [onMessage, serverURL])

  return null
}

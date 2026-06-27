import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { RefreshRouteOnSave } from './RefreshRouteOnSave'

const { router } = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}))

const SERVER_URL = 'http://localhost:3000'

describe('RefreshRouteOnSave', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SERVER_URL = SERVER_URL
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SERVER_URL
  })

  it('renders nothing', () => {
    const { container } = render(<RefreshRouteOnSave />)
    expect(container.firstChild).toBeNull()
  })

  it('calls router.refresh() on a postMessage from the serverURL', () => {
    const r = useRouter() as unknown as { refresh: ReturnType<typeof vi.fn> }
    render(<RefreshRouteOnSave />)

    const event = new MessageEvent('message', {
      origin: SERVER_URL,
      data: { type: 'payload-document-event', data: { id: '123' } },
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(r.refresh).toHaveBeenCalledTimes(1)
  })

  it('ignores postMessages from other origins', () => {
    const r = useRouter() as unknown as { refresh: ReturnType<typeof vi.fn> }
    render(<RefreshRouteOnSave />)

    const event = new MessageEvent('message', {
      origin: 'http://evil.example',
      data: { type: 'payload-live-preview' },
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(r.refresh).not.toHaveBeenCalled()
  })

  it('ignores postMessages with a non-document event type from the serverURL', () => {
    const r = useRouter() as unknown as { refresh: ReturnType<typeof vi.fn> }
    render(<RefreshRouteOnSave />)

    const event = new MessageEvent('message', {
      origin: SERVER_URL,
      data: { type: 'payload-live-preview', ready: true },
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(r.refresh).not.toHaveBeenCalled()
  })
})

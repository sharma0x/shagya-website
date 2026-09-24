import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Ensure required environment variables for test suites
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  'test-better-auth-secret-minimum-32-chars-long-for-testing!'

afterEach(() => {
  cleanup()
})

// Next.js Image shim for component tests
vi.mock('next/image', () => ({
  default: (props: { src: string; alt?: string; [k: string]: unknown }) =>
    React.createElement('img', props),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [k: string]: unknown
  }) => React.createElement('a', { href, ...props }, children),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

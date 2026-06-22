import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

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

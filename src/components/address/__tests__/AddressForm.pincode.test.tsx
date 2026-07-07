import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressForm } from '../AddressForm'

function makeFetchMock(
  resolver: (pincode: string) => { ok: boolean; status: number; body: unknown },
) {
  return vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? '{}'))
    const { ok, status, body: responseBody } = resolver(body.pincode)
    return {
      ok,
      status,
      json: async () => responseBody,
    }
  })
}

function stubFetch(mock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', mock)
}

const VERIFY_PAYLOAD = {
  data: { city: 'New Delhi', state: 'Delhi', country: 'India' },
}

function getPincodeInput() {
  return screen.getByPlaceholderText('6-digit PIN') as HTMLInputElement
}

function getCityInput() {
  return screen.getByPlaceholderText('City') as HTMLInputElement
}

function getStateInput(): HTMLInputElement | HTMLSelectElement {
  // The form has exactly two <select> elements: state (first) and country (second).
  const selects = document.querySelectorAll('select')
  return selects[0] as HTMLSelectElement
}

function getCountryInput() {
  const selects = document.querySelectorAll('select')
  return selects[1] as HTMLSelectElement
}

describe('AddressForm — pincode autofill', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = makeFetchMock(() => ({
      ok: true,
      status: 200,
      body: VERIFY_PAYLOAD,
    }))
    stubFetch(fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not call verify API when pincode is shorter than 6 digits', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AddressForm
        onSubmit={onSubmit}
        submitLabel="Save"
        onCancel={() => undefined}
      />,
    )

    await user.type(getPincodeInput(), '11000')
    await user.tab()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('calls /api/pincode/verify on blur for a valid 6-digit pincode', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AddressForm
        onSubmit={onSubmit}
        submitLabel="Save"
        onCancel={() => undefined}
      />,
    )

    await user.type(getPincodeInput(), '110001')
    await user.tab()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/pincode/verify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ pincode: '110001' }),
      }),
    )
  })

  it('auto-fills city, state, country and shows verified message on success', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AddressForm
        onSubmit={onSubmit}
        submitLabel="Save"
        onCancel={() => undefined}
      />,
    )

    await user.type(getPincodeInput(), '110001')
    await user.tab()

    await waitFor(() => {
      expect(getCityInput().value).toBe('New Delhi')
    })
    expect((getStateInput() as HTMLSelectElement).value).toBe('Delhi')
    expect(getCountryInput().value).toBe('India')
    expect(
      await screen.findByText(/verified/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument()
  })

  it('does not re-fetch when the same already-verified pincode is blurred again', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AddressForm
        onSubmit={onSubmit}
        submitLabel="Save"
        onCancel={() => undefined}
      />,
    )

    const pincode = getPincodeInput()
    await user.type(pincode, '110001')
    await user.tab()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await screen.findByText(/verified/i)

    // Focus + blur again on the same already-verified value
    pincode.focus()
    await user.tab()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('clears verification when the pincode is changed after a successful verify', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AddressForm
        onSubmit={onSubmit}
        submitLabel="Save"
        onCancel={() => undefined}
      />,
    )

    const pincode = getPincodeInput()
    await user.type(pincode, '110001')
    await user.tab()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await screen.findByText(/verified/i)

    // Change the value → verification should clear
    await user.clear(pincode)
    await user.type(pincode, '110002')
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument()
  })

  it('does NOT auto-verify a prefilled pincode in edit mode on mount', async () => {
    const onSubmit = vi.fn()
    render(
      <AddressForm
        initialData={{ pincode: '110001' }}
        onSubmit={onSubmit}
        submitLabel="Save"
        onCancel={() => undefined}
      />,
    )

    // No blur, no interaction — fetch should never have been called
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders an inline error when the server returns 500', async () => {
    fetchMock = makeFetchMock(() => ({
      ok: false,
      status: 500,
      body: { error: 'Internal error' },
    }))
    stubFetch(fetchMock)

    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AddressForm
        onSubmit={onSubmit}
        submitLabel="Save"
        onCancel={() => undefined}
      />,
    )

    await user.type(getPincodeInput(), '110001')
    await user.tab()

    expect(
      await screen.findByText(/internal error/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument()
  })

  it('only applies the latest response when two blurs race (regression: A-resolves-after-B)', async () => {
    // Two deferred resolvers, one per call, in the order the calls are made
    const resolvers: Array<
      (value: { ok: boolean; status: number; body: unknown }) => void
    > = []
    fetchMock = vi.fn(
      (_url: string, _init?: RequestInit) =>
        new Promise((resolve) => {
          resolvers.push((value) => {
            resolve({
              ok: true,
              status: 200,
              json: async () => value.body,
            })
          })
        }),
    )
    stubFetch(fetchMock)

    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AddressForm
        onSubmit={onSubmit}
        submitLabel="Save"
        onCancel={() => undefined}
      />,
    )

    const pincode = getPincodeInput()

    // First blur: type 110001, blur
    await user.type(pincode, '110001')
    await user.tab()

    // Second blur: type 110002, blur (A's request is still in-flight)
    await user.type(pincode, '110002')
    await user.tab()

    // The component should have issued 2 fetches
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    // Resolve the LATEST one first (B = 110002 → Mumbai/Maharashtra)
    await act(async () => {
      resolvers[1]!({
        ok: true,
        status: 200,
        body: {
          data: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        },
      })
    })
    // Then resolve the STALE one (A = 110001 → New Delhi/Delhi)
    await act(async () => {
      resolvers[0]!({
        ok: true,
        status: 200,
        body: VERIFY_PAYLOAD,
      })
    })

    // The form should show B's data, NOT A's
    await waitFor(() => {
      expect(getCityInput().value).toBe('Mumbai')
    })
    expect((getStateInput() as HTMLSelectElement).value).toBe('Maharashtra')

    // The verified indicator should still be present (for the latest pincode)
    expect(await screen.findByText(/verified/i)).toBeInTheDocument()
  })
})

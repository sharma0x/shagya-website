import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import React from 'react'
import { OrderFulfilmentPanel } from './OrderFulfilmentPanel'

const mocks = vi.hoisted(() => {
  const values: Record<string, unknown> = {}
  const dispatchFields = vi.fn()
  const setModified = vi.fn()
  const toast = { success: vi.fn(), error: vi.fn() }
  return { values, dispatchFields, setModified, toast }
})

const PATHS = [
  'status',
  'paymentId',
  'total',
  'delhivery.waybill',
  'delhivery.labelUrl',
  'delhivery.pickupRequestId',
  'shippingAddress.fullName',
  'shippingAddress.phone',
  'shippingAddress.line1',
  'shippingAddress.pincode',
]

vi.mock('@payloadcms/ui', () => ({
  useDocumentInfo: () => ({ id: '1' }),
  useFormFields: () =>
    PATHS.map((path) => ({ path, value: mocks.values[path] })),
  useForm: () => ({
    dispatchFields: mocks.dispatchFields,
    setModified: mocks.setModified,
  }),
  toast: mocks.toast,
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

function setOrderState(overrides: Record<string, unknown> = {}) {
  Object.keys(mocks.values).forEach((key) => delete mocks.values[key])
  Object.assign(mocks.values, {
    status: 'confirmed',
    paymentId: 'pay_123',
    total: 1800,
    'delhivery.waybill': undefined,
    'delhivery.labelUrl': undefined,
    'delhivery.pickupRequestId': undefined,
    'shippingAddress.fullName': 'Aisha Khan',
    'shippingAddress.phone': '9876543210',
    'shippingAddress.line1': '12 Marine Drive',
    'shippingAddress.pincode': '400001',
    ...overrides,
  })
}

describe('OrderFulfilmentPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setOrderState()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ waybill: 'WB123', labelUrl: 'https://label/pdf' }),
    })
    vi.stubGlobal('open', vi.fn())
  })

  it('renders an enabled Ship button for a confirmed prepaid order', () => {
    render(<OrderFulfilmentPanel />)
    const button = screen.getByRole('button', { name: /ship with delhivery/i })
    expect(button).toBeDefined()
    expect((button as HTMLButtonElement).disabled).toBe(false)
  })

  it('disables ship and explains when the order is not confirmed', () => {
    setOrderState({ status: 'pending' })
    render(<OrderFulfilmentPanel />)
    expect(screen.getByText(/must be Confirmed before shipping/i)).toBeDefined()
    expect(
      (
        screen.getByRole('button', {
          name: /ship with delhivery/i,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
  })

  it('blocks COD orders with a prepaid-only reason', () => {
    setOrderState({ paymentId: 'COD' })
    render(<OrderFulfilmentPanel />)
    expect(screen.getByText(/Prepaid only/i)).toBeDefined()
  })

  it('ships the order, syncs form fields and toasts on success', async () => {
    render(<OrderFulfilmentPanel />)
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /ship with delhivery/i }),
      )
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/orders/1/delhivery/ship', {
      method: 'POST',
    })
    expect(mocks.dispatchFields).toHaveBeenCalledWith({
      type: 'UPDATE',
      path: 'status',
      value: 'shipped',
    })
    expect(mocks.dispatchFields).toHaveBeenCalledWith({
      type: 'UPDATE',
      path: 'delhivery.waybill',
      value: 'WB123',
    })
    expect(mocks.setModified).toHaveBeenCalledWith(false)
    expect(mocks.toast.success).toHaveBeenCalled()
  })

  it('shows the endpoint error when ship fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () =>
        JSON.stringify({
          error: 'Only prepaid orders can be shipped with Delhivery',
        }),
    })
    render(<OrderFulfilmentPanel />)
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /ship with delhivery/i }),
      )
    })
    expect(
      screen.getByText('Only prepaid orders can be shipped with Delhivery'),
    ).toBeDefined()
    expect(mocks.toast.error).toHaveBeenCalled()
  })

  it('offers Label, Pickup and Track once a waybill exists', async () => {
    setOrderState({ 'delhivery.waybill': 'WB123' })
    render(<OrderFulfilmentPanel />)
    expect(screen.getByText(/Waybill WB123/)).toBeDefined()
    expect(
      screen.getByRole('button', { name: /download label/i }),
    ).toBeDefined()
    expect(
      screen.getByRole('button', { name: /schedule pickup/i }),
    ).toBeDefined()
    expect(screen.getByRole('button', { name: /^track$/i })).toBeDefined()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /download label/i }))
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/orders/1/delhivery/label')
    expect(window.open).toHaveBeenCalledWith('https://label/pdf', '_blank')

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /schedule pickup/i }))
    })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/orders/1/delhivery/pickup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      },
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^track$/i }))
    })
    expect(window.open).toHaveBeenCalledWith(
      'https://www.delhivery.com/track/package/WB123',
      '_blank',
    )
  })
})

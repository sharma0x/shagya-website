import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import React from 'react'
import { OrderFulfilmentCell } from './OrderFulfilmentCell'

const mocks = vi.hoisted(() => {
  const refineListData = vi.fn().mockResolvedValue(undefined)
  const toast = { success: vi.fn(), error: vi.fn() }
  return { refineListData, toast }
})

vi.mock('@payloadcms/ui', () => ({
  useListQuery: () => ({ query: {}, refineListData: mocks.refineListData }),
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

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 23,
    orderNumber: 'ORD-00023',
    status: 'confirmed',
    paymentId: 'pay_123',
    total: 1800,
    shippingAddress: {
      fullName: 'Aisha Khan',
      phone: '9876543210',
      line1: '12 Marine Drive',
      pincode: '400001',
    },
    delhivery: {},
    ...overrides,
  } as Record<string, unknown>
}

describe('OrderFulfilmentCell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ waybill: 'WB123' }),
    })
  })

  it('renders a Ship button for an eligible row', () => {
    render(<OrderFulfilmentCell rowData={order()} />)
    expect(screen.getByRole('button', { name: 'Ship' })).toBeDefined()
  })

  it('renders the button for a confirmed COD row', () => {
    render(<OrderFulfilmentCell rowData={order({ paymentId: 'COD' })} />)
    expect(screen.getByRole('button', { name: 'Ship' })).toBeDefined()
  })

  it('shows the waybill once shipped', () => {
    render(
      <OrderFulfilmentCell
        rowData={order({ delhivery: { waybill: 'WB123' } })}
      />,
    )
    expect(screen.getByText('WB123')).toBeDefined()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('ships the order and refreshes the list on success', async () => {
    render(<OrderFulfilmentCell rowData={order()} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ship' }))
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/orders/23/delhivery/ship', {
      method: 'POST',
    })
    expect(mocks.refineListData).toHaveBeenCalledWith({})
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
    render(<OrderFulfilmentCell rowData={order()} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ship' }))
    })
    expect(mocks.toast.error).toHaveBeenCalledWith(
      'Only prepaid orders can be shipped with Delhivery',
    )
    expect(mocks.refineListData).not.toHaveBeenCalled()
  })
})

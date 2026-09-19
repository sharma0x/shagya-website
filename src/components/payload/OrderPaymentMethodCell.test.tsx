import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderPaymentMethodCell } from './OrderPaymentMethodCell'

describe('OrderPaymentMethodCell', () => {
  it('labels COD orders as COD', () => {
    render(<OrderPaymentMethodCell rowData={{ paymentId: 'COD' }} />)
    expect(screen.getByText('COD')).toBeInTheDocument()
  })

  it('labels non-COD payment IDs as prepaid', () => {
    render(<OrderPaymentMethodCell rowData={{ paymentId: 'pay_123' }} />)
    expect(screen.getByText('Prepaid')).toBeInTheDocument()
  })
})

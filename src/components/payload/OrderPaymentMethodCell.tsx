'use client'

import React from 'react'

type OrderPaymentMethodCellProps = {
  rowData?: Record<string, unknown> | null
}

export const OrderPaymentMethodCell: React.FC<OrderPaymentMethodCellProps> = ({
  rowData,
}) => {
  const paymentId =
    typeof rowData?.paymentId === 'string' ? rowData.paymentId.trim() : ''
  const isCod = paymentId.toUpperCase() === 'COD'

  return <span>{isCod ? 'COD' : paymentId ? 'Prepaid' : '—'}</span>
}

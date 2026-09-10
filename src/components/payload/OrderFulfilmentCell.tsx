'use client'

import React, { useState } from 'react'
import { Button, toast, useListQuery } from '@payloadcms/ui'
import { shipEligibilityForOrder } from '@/lib/delhivery/eligibility'

type OrderFulfilmentCellProps = {
  rowData?: Record<string, unknown> | null
}

export const OrderFulfilmentCell: React.FC<OrderFulfilmentCellProps> = ({
  rowData,
}) => {
  const { query, refineListData } = useListQuery()
  const [isShipping, setIsShipping] = useState(false)

  const waybill = (rowData?.delhivery as Record<string, unknown> | undefined)
    ?.waybill
  if (waybill) {
    return (
      <span
        title="Shipped via Delhivery"
        style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-400)' }}
      >
        {String(waybill)}
      </span>
    )
  }

  const eligibility = shipEligibilityForOrder(rowData)
  if (!eligibility.canShip) return null

  const handleShip = async () => {
    setIsShipping(true)
    try {
      const res = await fetch(`/api/orders/${rowData?.id}/delhivery/ship`, {
        method: 'POST',
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.waybill) {
        toast.success(
          `Shipped ${rowData?.orderNumber ?? ''} — waybill ${json.waybill}`,
        )
        await refineListData(query)
      } else {
        toast.error(json.error || 'Ship request failed.')
      }
    } catch {
      toast.error('Network error — could not reach the ship endpoint.')
    } finally {
      setIsShipping(false)
    }
  }

  return (
    <Button
      onClick={handleShip}
      disabled={isShipping}
      size="small"
      buttonStyle="secondary"
    >
      {isShipping ? 'Shipping…' : 'Ship'}
    </Button>
  )
}

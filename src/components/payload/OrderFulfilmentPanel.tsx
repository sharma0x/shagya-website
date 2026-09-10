'use client'

import React, { useState } from 'react'
import {
  Button,
  toast,
  useDocumentInfo,
  useForm,
  useFormFields,
} from '@payloadcms/ui'
import {
  DELHIVERY_TRACK_URL,
  getShipEligibility,
} from '@/lib/delhivery/eligibility'

const WATCH_PATHS = [
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
] as const

type Fieldish = { value?: unknown } | undefined

function text(value: unknown): string {
  return value == null ? '' : String(value)
}

export const OrderFulfilmentPanel: React.FC = () => {
  const { id } = useDocumentInfo()
  const { dispatchFields, setModified } = useForm()
  const [isShipping, setIsShipping] = useState(false)
  const [isFetchingLabel, setIsFetchingLabel] = useState(false)
  const [isSchedulingPickup, setIsSchedulingPickup] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fields = useFormFields(([allFields]) =>
    WATCH_PATHS.map((path) => allFields[path]),
  )
  const [
    status,
    paymentId,
    total,
    waybill,
    labelUrl,
    pickupRequestId,
    fullName,
    phone,
    line1,
    pincode,
  ] = fields

  if (!id) return null

  const hasWaybill = Boolean(text((waybill as Fieldish)?.value))

  const eligibility = getShipEligibility({
    status: text((status as Fieldish)?.value),
    paymentId: text((paymentId as Fieldish)?.value),
    total: Number((total as Fieldish)?.value ?? 0),
    fullName: text((fullName as Fieldish)?.value),
    phone: text((phone as Fieldish)?.value),
    line1: text((line1 as Fieldish)?.value),
    pincode: text((pincode as Fieldish)?.value),
  })

  const markShippedInForm = (newWaybill: string) => {
    dispatchFields({ type: 'UPDATE', path: 'status', value: 'shipped' })
    dispatchFields({ type: 'UPDATE', path: 'trackingId', value: newWaybill })
    dispatchFields({
      type: 'UPDATE',
      path: 'trackingUrl',
      value: `${DELHIVERY_TRACK_URL}${newWaybill}`,
    })
    dispatchFields({
      type: 'UPDATE',
      path: 'delhivery.waybill',
      value: newWaybill,
    })
    dispatchFields({
      type: 'UPDATE',
      path: 'delhivery.status',
      value: 'Manifested',
    })
    dispatchFields({
      type: 'UPDATE',
      path: 'delhivery.shippedViaDelhivery',
      value: true,
    })
    setModified(false)
  }

  const handleShip = async () => {
    setIsShipping(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${id}/delhivery/ship`, {
        method: 'POST',
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.waybill) {
        markShippedInForm(json.waybill)
        toast.success(`Shipped via Delhivery — waybill ${json.waybill}`)
      } else {
        const reason = json.error || 'Ship request failed.'
        setError(reason)
        toast.error(reason)
      }
    } catch (err) {
      const reason = 'Network error — could not reach the ship endpoint.'
      setError(reason)
      toast.error(reason)
    } finally {
      setIsShipping(false)
    }
  }

  const handleLabel = async () => {
    setIsFetchingLabel(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${id}/delhivery/label`)
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.labelUrl) {
        window.open(json.labelUrl, '_blank')
        dispatchFields({
          type: 'UPDATE',
          path: 'delhivery.labelUrl',
          value: json.labelUrl,
        })
        setModified(false)
        toast.success('Label generated — PDF opened in a new tab.')
      } else {
        const reason = json.error || 'Label request failed.'
        setError(reason)
        toast.error(reason)
      }
    } catch {
      const reason = 'Network error — could not reach the label endpoint.'
      setError(reason)
      toast.error(reason)
    } finally {
      setIsFetchingLabel(false)
    }
  }

  const handlePickup = async () => {
    setIsSchedulingPickup(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${id}/delhivery/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        if (json.pickupRequestId) {
          dispatchFields({
            type: 'UPDATE',
            path: 'delhivery.pickupRequestId',
            value: json.pickupRequestId,
          })
          setModified(false)
        }
        toast.success('Pickup scheduled with Delhivery.')
      } else {
        const reason = json.error || 'Pickup request failed.'
        setError(reason)
        toast.error(reason)
      }
    } catch {
      const reason = 'Network error — could not reach the pickup endpoint.'
      setError(reason)
      toast.error(reason)
    } finally {
      setIsSchedulingPickup(false)
    }
  }

  const handleTrack = () => {
    window.open(
      `${DELHIVERY_TRACK_URL}${text((waybill as Fieldish)?.value)}`,
      '_blank',
    )
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <p
        style={{
          fontSize: '0.8rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--theme-elevation-400)',
          marginBottom: '0.75rem',
        }}
      >
        Fulfilment
      </p>

      {!hasWaybill ? (
        <>
          {!eligibility.canShip && (
            <p
              style={{
                marginBottom: '0.75rem',
                color: 'var(--theme-warning-500, var(--theme-elevation-600))',
                fontSize: '0.85rem',
              }}
            >
              {eligibility.reason}
            </p>
          )}
          <Button
            onClick={handleShip}
            disabled={isShipping || !eligibility.canShip}
            size="small"
          >
            {isShipping ? 'Manifesting…' : 'Ship with Delhivery'}
          </Button>
        </>
      ) : (
        <>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--theme-success-500, #1a7f37)',
              fontSize: '0.85rem',
            }}
          >
            Waybill {text((waybill as Fieldish)?.value)}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button
              onClick={handleLabel}
              disabled={isFetchingLabel}
              size="small"
              buttonStyle="secondary"
            >
              {isFetchingLabel ? 'Generating…' : 'Download Label'}
            </Button>
            <Button
              onClick={handlePickup}
              disabled={isSchedulingPickup}
              size="small"
              buttonStyle="secondary"
            >
              {isSchedulingPickup ? 'Scheduling…' : 'Schedule Pickup'}
            </Button>
            <Button onClick={handleTrack} size="small" buttonStyle="secondary">
              Track
            </Button>
          </div>
          {text((pickupRequestId as Fieldish)?.value) && (
            <p
              style={{
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--theme-elevation-400)',
              }}
            >
              Pickup request: {text((pickupRequestId as Fieldish)?.value)}
            </p>
          )}
          {text((labelUrl as Fieldish)?.value) && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              <a
                href={text((labelUrl as Fieldish)?.value)}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--theme-elevation-800)' }}
              >
                View generated label
              </a>
            </p>
          )}
        </>
      )}

      {error && (
        <p
          style={{
            marginTop: '0.75rem',
            color: 'var(--theme-error-500, #c62828)',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

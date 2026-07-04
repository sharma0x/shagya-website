'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { AddressForm, type AddressFormData } from '@/components/address/AddressForm'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Check,
  Plus,
  Loader2,
} from 'lucide-react'

interface Address {
  id: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
}

export default function AddressesPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Load addresses
  useEffect(() => {
    if (isPending) return
    if (!sessionData?.user) {
      router.push('/account/login?redirect=/account/addresses')
      return
    }

    async function loadAddresses() {
      try {
        const res = await fetch('/api/addresses')
        if (res.ok) {
          const data = await res.json()
          setAddresses(data.addresses || [])
        }
      } catch (err) {
        console.error('Failed to load addresses', err)
      } finally {
        setLoading(false)
      }
    }

    loadAddresses()
  }, [sessionData, isPending, router])

  const openAddForm = () => {
    setEditingAddress(null)
    setShowForm(true)
    setError('')
  }

  const openEditForm = (addr: Address) => {
    setEditingAddress(addr)
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (data: AddressFormData) => {
    setActionLoading(true)
    setError('')

    const url = editingAddress
      ? `/api/addresses/${editingAddress.id}`
      : '/api/addresses'
    const method = editingAddress ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country,
          isDefault: data.isDefault,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save address')
      }

      // Reload address list
      const listRes = await fetch('/api/addresses')
      if (listRes.ok) {
        const data = await listRes.json()
        setAddresses(data.addresses || [])
      }

      setShowForm(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save address')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    setActionLoading(true)

    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete address')
      }

      setAddresses(addresses.filter((a) => a.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete address')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSetDefault = async (addr: Address) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addr,
          isDefault: true,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update default address')
      }

      // Reload address list
      const listRes = await fetch('/api/addresses')
      if (listRes.ok) {
        const data = await listRes.json()
        setAddresses(data.addresses || [])
      }
    } catch (err: any) {
      alert(err.message || 'Failed to set default')
    } finally {
      setActionLoading(false)
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-600 h-8 w-8 animate-spin" />
        <p className="font-body text-sm text-neutral-500">
          Loading your address manager...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation / Header */}
        <div className="mb-8 flex items-center justify-between border-b border-neutral-200 pb-6">
          <div>
            <Link
              href="/account"
              className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="font-display mt-2 text-2xl font-bold text-neutral-900">
              Saved Addresses
            </h1>
          </div>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="font-display bg-brand-600 hover:bg-brand-700 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          )}
        </div>

        {/* Address Form (Add / Edit) */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
            <h3 className="font-display mb-6 text-sm font-semibold tracking-wider text-neutral-900 uppercase">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <AddressForm
              initialData={editingAddress ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={actionLoading}
              submitLabel={editingAddress ? 'Save Changes' : 'Add Address'}
              onCancel={() => setShowForm(false)}
              error={error}
            />
          </div>
        )}

        {/* Addresses list */}
        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-xs">
            <MapPin className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
            <p className="font-body text-sm text-neutral-500">
              You haven&apos;t added any addresses yet.
            </p>
            <button
              onClick={openAddForm}
              className="font-display text-brand-700 hover:text-brand-800 mt-4 text-xs font-semibold underline"
            >
              Add your first shipping address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative rounded-2xl border bg-white p-5 shadow-xs transition-all ${
                  addr.isDefault ? 'border-brand-600' : 'border-neutral-200'
                }`}
              >
                {addr.isDefault && (
                  <span className="bg-brand-50 text-brand-700 border-brand-100 font-display absolute top-4 right-4 flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                    <Check className="h-3 w-3" />
                    Default
                  </span>
                )}

                <h3 className="font-display text-sm font-semibold text-neutral-900">
                  {addr.fullName}
                </h3>
                <p className="font-body mt-1 text-xs text-neutral-500">
                  {addr.phone}
                </p>
                <p className="font-body mt-3 text-xs leading-relaxed text-neutral-600">
                  {addr.line1}
                  {addr.line2 && <span className="block">{addr.line2}</span>}
                  <span className="block">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </span>
                </p>

                <div className="font-display mt-4 flex gap-4 border-t border-neutral-100 pt-4 text-xs">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr)}
                      className="text-brand-700 hover:text-brand-800 font-semibold"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => openEditForm(addr)}
                    className="inline-flex items-center gap-1 font-semibold text-neutral-500 hover:text-neutral-700"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="ml-auto inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

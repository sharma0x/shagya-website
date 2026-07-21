'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  ArrowRight,
  Loader2,
  Calendar,
  CreditCard,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { PhoneInput } from '@/components/ui/phone-input'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
}

interface Address {
  id: string
  fullName: string
  line1: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export default function AccountDashboardPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()

  const [orders, setOrders] = useState<Order[]>([])
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isPending) return
    if (!sessionData?.user) {
      router.push('/account/login')
      return
    }

    async function loadDashboardData() {
      try {
        const [ordersRes, addrRes, profileRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/addresses'),
          fetch('/api/customers/me'),
        ])

        if (ordersRes.ok) {
          const oData = await ordersRes.json()
          setOrders(oData.orders?.slice(0, 3) || []) // show last 3 orders
        }

        if (addrRes.ok) {
          const aData = await addrRes.json()
          const defAddr = aData.addresses?.find((a: Address) => a.isDefault)
          setDefaultAddress(defAddr || aData.addresses?.[0] || null)
        }

        if (profileRes.ok) {
          const pData = await profileRes.json()
          setProfileName(pData.name || '')
          setProfilePhone(pData.phone || '')
          setProfileEmail(pData.email || sessionData?.user?.email || '')
        } else {
          setProfileEmail(sessionData?.user?.email || '')
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoadingData(false)
      }
    }

    loadDashboardData()
  }, [sessionData, isPending, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/account/login')
  }

  const handleStartEdit = () => {
    setEditName(profileName)
    setEditPhone(profilePhone)
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/customers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      setProfileName(editName)
      setProfilePhone(editPhone)
      setEditing(false)
    } catch (err) {
      console.error('Failed to update profile', err)
    } finally {
      setSaving(false)
    }
  }

  if (isPending || loadingData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-600 h-8 w-8 animate-spin" />
        <p className="font-body text-sm text-neutral-500">
          Loading your profile dashboard...
        </p>
      </div>
    )
  }

  const user = sessionData?.user

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Dashboard Title & Welcome */}
        <div className="mb-8 flex flex-col gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-display text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              Customer Area
            </span>
            <h1 className="font-display mt-1 text-3xl font-bold text-neutral-900">
              Namaste, {profileName || user?.name || 'Guest'}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="font-display inline-flex items-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 sm:self-center"
          >
            <LogOut className="h-3.5 w-3.5 text-neutral-400" />
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="mb-8 rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <User className="text-brand-600 h-5 w-5" />
              Profile
            </h2>
            {!editing ? (
              <button
                onClick={handleStartEdit}
                className="font-display inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-brand-600 hover:bg-brand-700 font-display inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="font-display inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <span className="font-display text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">Name</span>
                <p className="font-body mt-0.5 text-sm text-neutral-900">{profileName || '\u2014'}</p>
              </div>
              <div>
                <span className="font-display text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">Email</span>
                <p className="font-body mt-0.5 text-sm text-neutral-500">{profileEmail || '\u2014'}</p>
              </div>
              <div>
                <span className="font-display text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">Phone</span>
                <p className="font-body mt-0.5 text-sm text-neutral-900">{profilePhone || '\u2014'}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="font-display block text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="font-body focus:border-brand-500 mt-1 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="font-display block text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">Email</label>
                <p className="font-body mt-2 text-sm text-neutral-400">{profileEmail}</p>
              </div>
              <div>
                <label className="font-display block text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">Phone</label>
                <div className="mt-1">
                  <PhoneInput
                    value={editPhone}
                    onChange={setEditPhone}
                    placeholder="98765 43210"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Hub Navigation Cards */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            href="/account/orders"
            className="hover:border-brand-300 group rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs transition-all"
          >
            <div className="bg-brand-50 text-brand-700 mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="font-display flex items-center justify-between text-sm font-semibold text-neutral-900">
              Order History
              <ArrowRight className="group-hover:text-brand-600 h-4 w-4 text-neutral-300 transition-colors" />
            </h3>
            <p className="font-body mt-2 text-xs text-neutral-500">
              Review and track your saree dispatches, invoices, and details.
            </p>
          </Link>

          <Link
            href="/account/addresses"
            className="hover:border-brand-300 group rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs transition-all"
          >
            <div className="bg-brand-50 text-brand-700 mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-display flex items-center justify-between text-sm font-semibold text-neutral-900">
              Addresses
              <ArrowRight className="group-hover:text-brand-600 h-4 w-4 text-neutral-300 transition-colors" />
            </h3>
            <p className="font-body mt-2 text-xs text-neutral-500">
              Manage your delivery addresses and set defaults for quick
              checkout.
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="hover:border-brand-300 group rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs transition-all"
          >
            <div className="bg-brand-50 text-brand-700 mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="font-display flex items-center justify-between text-sm font-semibold text-neutral-900">
              Wishlist
              <ArrowRight className="group-hover:text-brand-600 h-4 w-4 text-neutral-300 transition-colors" />
            </h3>
            <p className="font-body mt-2 text-xs text-neutral-500">
              Save your favorite handlooms, weaves, and patterns for later.
            </p>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Recent Orders Section */}
          <div className="space-y-4 lg:col-span-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-neutral-900">
                <ShoppingBag className="text-brand-600 h-5 w-5" />
                Recent Orders
              </h2>
              {orders.length > 0 && (
                <Link
                  href="/account/orders"
                  className="font-display text-brand-700 hover:text-brand-800 text-xs font-semibold underline"
                >
                  View All
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-xs">
                <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                <p className="font-body text-sm text-neutral-500">
                  You haven&apos;t placed any orders yet.
                </p>
                <Link
                  href="/"
                  className="font-display text-brand-700 hover:text-brand-800 mt-4 inline-flex items-center gap-1.5 text-xs font-semibold underline"
                >
                  Start Exploring masterpieces
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-semibold text-neutral-900">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`font-display rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            order.status === 'confirmed' ||
                            order.status === 'delivered'
                              ? 'border border-green-100 bg-green-50 text-green-700'
                              : order.status === 'cancelled'
                                ? 'border border-red-100 bg-red-50 text-red-700'
                                : 'border border-yellow-100 bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="font-body flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          {new Date(order.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            },
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/account/orders`}
                      className="font-display text-brand-700 hover:text-brand-800 inline-flex items-center gap-1 self-start rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold transition-all hover:bg-neutral-50 sm:self-center"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar / Default Address */}
          <div className="space-y-4 lg:col-span-4">
            <h2 className="font-display mb-2 flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <MapPin className="text-brand-600 h-5 w-5" />
              Primary Address
            </h2>

            <div className="relative rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs">
              {defaultAddress ? (
                <div>
                  <p className="font-display text-sm font-semibold text-neutral-900">
                    {defaultAddress.fullName}
                  </p>
                  <p className="font-body mt-2 text-xs leading-relaxed text-neutral-600">
                    {defaultAddress.line1}
                    <br />
                    {defaultAddress.city}, {defaultAddress.state} -{' '}
                    {defaultAddress.pincode}
                  </p>
                  <Link
                    href="/account/addresses"
                    className="font-display text-brand-700 hover:text-brand-800 mt-4 inline-flex items-center gap-1.5 text-xs font-semibold underline"
                  >
                    Edit Addresses
                  </Link>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <MapPin className="mx-auto mb-2 h-6 w-6 text-neutral-300" />
                  <p className="font-body text-xs text-neutral-500">
                    No addresses saved yet.
                  </p>
                  <Link
                    href="/account/addresses"
                    className="font-display text-brand-700 hover:text-brand-800 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold underline"
                  >
                    Add Address
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

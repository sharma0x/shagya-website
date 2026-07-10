'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { useCart } from '@/lib/store/cart'
import { loadRazorpayScript } from '@/lib/razorpay'
import { AddressForm, type AddressFormData } from '@/components/address/AddressForm'
import { GuestCheckout } from '@/components/checkout/GuestCheckout'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Truck,
  Ticket,
  ShoppingBag,
  ShieldCheck,
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

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    gallery?: Array<{
      image?:
        | {
            url?: string
            sizes?: {
              thumbnail?: { url?: string }
              card?: { url?: string }
            }
          }
        | string
    }>
    basePrice: number
  }
  variant?: {
    id?: string
    title?: string
    size?: string
    blouseCustomization?: string
  } | null
  quantity: number
  unitPrice: number
}

interface Cart {
  items: CartItem[]
  subtotal: number
  coupon?: any
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()
  const zCart = useCart()

  // Guest cart derived from reactive Zustand hook — never stale
  const guestCart: Cart = {
    items: zCart.items.map((i) => ({
      id: String(i.product.id),
      product: {
        id: String(i.product.id),
        name: i.product.name,
        slug: i.product.slug,
        basePrice: i.unitPrice,
        gallery: i.product.gallery,
      },
      variant: i.variant,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    subtotal: zCart.getSubtotal(),
    coupon: zCart.coupon || undefined,
  }

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [cart, setCart] = useState<Cart | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  // Guest checkout
  const [guestData, setGuestData] = useState<{
    name: string; email: string
  } | null>(null)

  const isLoggedIn = !!sessionData?.user

  // Effective cart: DB cart for logged-in, reactive hook cart for guests
  const effectiveCart = isLoggedIn ? cart : guestCart

  // New address form state
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>(
    'razorpay',
  )

  // Load cart and addresses — run only once on mount
  const didLoad = useRef(false)

  useEffect(() => {
    if (didLoad.current) return
    if (isPending) return

    didLoad.current = true

    if (!isLoggedIn) {
      setLoading(false)
      setShowNewAddressForm(true)
      return
    }

    async function loadData() {
      try {
        const [cartRes, addrRes] = await Promise.all([
          fetch('/api/cart'),
          fetch('/api/addresses'),
        ])

        if (cartRes.ok) {
          let cartData = await cartRes.json()

          // If DB cart is empty but local cart has items (e.g. they added items while logged out or sync failed earlier)
          const localItems = zCart.items
          if (
            (!cartData.items || cartData.items.length === 0) &&
            localItems.length > 0
          ) {
            const syncRes = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: localItems,
                couponId: zCart.coupon?.id || null,
              }),
            })
            if (syncRes.ok) {
              cartData = await syncRes.json()
            }
          }

          setCart(cartData)
          if (!cartData.items || cartData.items.length === 0) {
            router.push('/')
            return
          }
        }

        if (addrRes.ok) {
          const addrData = await addrRes.json()
          setAddresses(addrData.addresses || [])

          // Select default address or first address
          const defaultAddr = addrData.addresses?.find(
            (a: Address) => a.isDefault,
          )
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id)
          } else if (addrData.addresses?.length > 0) {
            setSelectedAddressId(addrData.addresses[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load checkout data', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sessionData, isPending]) // didLoad ref prevents re-runs after first mount

  const handleAddNewAddress = async (data: AddressFormData) => {
    setActionLoading(true)
    setError('')

    if (!isLoggedIn) {
      // Guest — store address locally
      const tempAddress = {
        id: 'guest-addr',
        fullName: data.fullName,
        phone: '',
        line1: data.line1,
        line2: data.line2 || '',
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        isDefault: false,
      }
      setAddresses([tempAddress])
      setSelectedAddressId('guest-addr')
      setShowNewAddressForm(false)
      setActionLoading(false)
      return
    }

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: '',
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

      const { address } = await res.json()
      setAddresses([address, ...addresses])
      setSelectedAddressId(address.id)
      setShowNewAddressForm(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save address')
    } finally {
      setActionLoading(false)
    }
  }

  // Cost calculations
  const subtotal = effectiveCart?.subtotal || 0
  const shipping = subtotal >= 5000 ? 0 : 150
  let discount = 0
  if (cart?.coupon) {
    if (effectiveCart?.coupon.type === 'percentage') {
      discount = Math.round((subtotal * (effectiveCart.coupon.value || 0)) / 100)
      if (effectiveCart.coupon.maxDiscount && discount > effectiveCart.coupon.maxDiscount) {
        discount = effectiveCart.coupon.maxDiscount
      }
    } else if (effectiveCart?.coupon.type === 'fixed_amount') {
      discount = effectiveCart.coupon.value || 0
    }
  }
  const total = Math.max(0, subtotal + shipping - discount)

  const handlePlaceOrder = async () => {
    setActionLoading(true)
    setError('')

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
    if (!selectedAddress) {
      setError('Please select or add a shipping address')
      setActionLoading(false)
      return
    }

    try {
      if (paymentMethod === 'cod') {
        // Place COD order directly
        const res = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isCod: true,
            shippingAddress: selectedAddress,
            phone: selectedAddress?.phone,
            notes: orderNotes,
            guestEmail: guestData?.email || '',
            guestPhone: '',
            cartItems: !isLoggedIn
              ? effectiveCart?.items.map((i) => ({
                  product: i.product.id,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice,
                }))
              : undefined,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to place COD order')
        }

        const data = await res.json()
        zCart.clearCart()
        router.push(`/checkout/success?orderNumber=${data.orderNumber}`)
      } else {
        // Razorpay checkout
        const isScriptLoaded = await loadRazorpayScript()
        if (!isScriptLoaded) {
          throw new Error('Razorpay SDK failed to load. Please try again.')
        }

        // 1. Create Razorpay order on server
        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingAddress: selectedAddress,
            phone: selectedAddress?.phone,
            isCod: false,
            guestEmail: guestData?.email || '',
            guestPhone: '',
            cartItems: !isLoggedIn
              ? effectiveCart?.items.map((i) => ({
                  product: i.product.id,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice,
                }))
              : undefined,
          }),
        })

        if (!orderRes.ok) {
          const data = await orderRes.json()
          throw new Error(
            data.error || 'Failed to initiate Razorpay transaction',
          )
        }

        const orderData = await orderRes.json()
        const { razorpayOrder } = orderData

        // 2. Launch Razorpay payment UI
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxx',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Shayga',
          description: `Saree Purchase`,
          order_id: razorpayOrder.id,
          prefill: {
            name: selectedAddress.fullName,
            email: sessionData?.user?.email || guestData?.email || '',
            contact: selectedAddress.phone,
          },
          theme: {
            color: '#42112e', // Saffron/Wine brand accent colors
          },
          handler: async (response: any) => {
            try {
              setActionLoading(true)
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  shippingAddress: selectedAddress,
                  phone: selectedAddress.phone,
                  notes: orderNotes,
                  guestEmail: guestData?.email || '',
                  guestPhone: '',
                  cartItems: !isLoggedIn
                    ? effectiveCart?.items.map((i) => ({
                        product: i.product.id,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                      }))
                    : undefined,
                  isMock: razorpayOrder.isMock || false,
                }),
              })

              if (!verifyRes.ok) {
                const errData = await verifyRes.json()
                throw new Error(errData.error || 'Payment verification failed')
              }

              const data = await verifyRes.json()
              zCart.clearCart()
              router.push(`/checkout/success?orderNumber=${data.orderNumber}`)
            } catch (err: any) {
              setError(err.message || 'Payment verification failed')
              setActionLoading(false)
            }
          },
          modal: {
            ondismiss: () => {
              setActionLoading(false)
            },
          },
        }

        if (razorpayOrder.isMock) {
          // If developer testing with mock key, bypass Razorpay modal and simulate verify directly
          console.log('[Developer Mode] Simulating Razorpay payment...')
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: razorpayOrder.id,
                  razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
                  razorpay_signature: 'mock_signature',
                  shippingAddress: selectedAddress,
                  phone: selectedAddress.phone,
                  notes: orderNotes,
                  guestEmail: guestData?.email || '',
                  guestPhone: '',
                  cartItems: !isLoggedIn
                    ? effectiveCart?.items.map((i) => ({
                        product: i.product.id,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                      }))
                    : undefined,
                  isMock: true,
            }),
          })

          if (!verifyRes.ok) {
            const errData = await verifyRes.json()
            throw new Error(errData.error || 'Payment verification failed')
          }

          const data = await verifyRes.json()
          zCart.clearCart()
          router.push(`/checkout/success?orderNumber=${data.orderNumber}`)
          return
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (err: any) {
      setError(err.message || 'Order processing failed')
      setActionLoading(false)
    }
  }

  // Show loading spinner until session resolves AND cart data is loaded
  // Prevents empty sidebar flash with Rs 150 static shipping
  const cartReady = !isLoggedIn || (effectiveCart?.items?.length ?? 0) > 0
  if (isPending || (loading && !didLoad.current) || !cartReady) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-600 h-8 w-8 animate-spin" />
        <p className="font-body text-sm text-neutral-500">
          Preparing checkout window...
        </p>
      </div>
    )
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold tracking-tight text-neutral-900">
              Shayga
            </span>
            <span className="font-display border-l border-neutral-200 pl-2 text-xs font-medium tracking-widest text-neutral-400 uppercase">
              Checkout
            </span>
          </div>
        </div>

        {/* Steps display */}
        <div className="mx-auto mb-10 flex max-w-md items-center justify-center gap-4 sm:gap-8">
          <button
            onClick={() => setStep(1)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
              step >= 1
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-neutral-200 text-neutral-400'
            }`}
          >
            {step > 1 ? <Check className="h-4 w-4" /> : '1'}
          </button>
          <div
            className={`h-px flex-1 ${step >= 2 ? 'bg-brand-600' : 'bg-neutral-200'}`}
          />
          <button
            onClick={() => {
              if (selectedAddressId) setStep(2)
            }}
            disabled={!selectedAddressId}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
              step >= 2
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-neutral-200 text-neutral-400'
            }`}
          >
            {step > 2 ? <Check className="h-4 w-4" /> : '2'}
          </button>
          <div
            className={`h-px flex-1 ${step >= 3 ? 'bg-brand-600' : 'bg-neutral-200'}`}
          />
          <button
            onClick={() => {
              if (selectedAddressId) setStep(3)
            }}
            disabled={!selectedAddressId}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
              step === 3
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-neutral-200 text-neutral-400'
            }`}
          >
            3
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Form Fields */}
          <div className="space-y-6 lg:col-span-8">
            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Address Selection */}
            {step === 1 && (
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display flex items-center gap-2 text-lg font-semibold text-neutral-900">
                    <MapPin className="text-brand-600 h-5 w-5" />
                    Delivery Address
                  </h3>
                  {!showNewAddressForm && (
                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-brand-700 hover:text-brand-800 font-display text-xs font-semibold underline"
                    >
                      Add New Address
                    </button>
                  )}
                </div>

                {showNewAddressForm ? (
                  <AddressForm
                    onSubmit={handleAddNewAddress}
                    isSubmitting={actionLoading}
                    submitLabel="Save & Select"
                    onCancel={() => setShowNewAddressForm(false)}
                    error={error}
                  />
                ) : (
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-neutral-200 py-8 text-center">
                        <MapPin className="mx-auto mb-2 h-6 w-6 text-neutral-400" />
                        <p className="font-body text-sm text-neutral-500">
                          No addresses saved. Please add a shipping address.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-brand-600 bg-brand-50/20'
                                : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            {addr.isDefault && (
                              <span className="absolute top-3 right-3 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-neutral-600 uppercase">
                                Default
                              </span>
                            )}
                            <p className="font-display text-sm font-semibold text-neutral-900">
                              {addr.fullName}
                            </p>
                            <p className="font-body mt-1 text-xs text-neutral-500">
                              {addr.phone}
                            </p>
                            <p className="font-body mt-2 line-clamp-2 text-xs text-neutral-600">
                              {addr.line1},{' '}
                              {addr.line2 ? `${addr.line2}, ` : ''}
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            {selectedAddressId === addr.id && (
                              <span className="bg-brand-600 absolute right-3 bottom-3 flex h-5 w-5 items-center justify-center rounded-full text-white">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedAddressId && (
                      <>
                        {/* Guest checkout — email OTP verification */}
                        {!isLoggedIn && !guestData && (
                          <div className="mt-6 border-t border-neutral-100 pt-6">
                            <GuestCheckout onVerified={setGuestData} />
                          </div>
                        )}

                        {/* Guest verified */}
                        {guestData && (
                          <div className="mt-6 border-t border-neutral-100 pt-6">
                            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                              <p className="font-display text-xs font-semibold text-green-700">
                                Verified — {guestData.name} · {guestData.email}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Order notes */}
                        <div className="mt-6 border-t border-neutral-100 pt-6">
                          <h4 className="font-display mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                            Delivery Instructions (Optional)
                          </h4>
                          <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            rows={2}
                            placeholder="Landmark, gate code, or special instructions"
                            className="font-body focus:border-brand-500 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none resize-none"
                          />
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() => setStep(2)}
                            disabled={!isLoggedIn && !guestData}
                            className="font-display bg-brand-600 hover:bg-brand-700 disabled:bg-neutral-200 h-11 rounded-xl px-6 text-xs font-semibold text-white transition-all disabled:text-neutral-400"
                          >
                            Proceed to Shipping
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Shipping Method / Verification */}
            {step === 2 && (
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
                <h3 className="font-display mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900">
                  <Truck className="text-brand-600 h-5 w-5" />
                  Delivery & Shipping
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
                    <div className="flex gap-3">
                      <Truck className="text-brand-600 mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-display text-sm font-semibold text-neutral-900">
                          Standard Handloom Dispatch
                        </p>
                        <p className="font-body mt-1 text-xs text-neutral-500">
                          Carefully verified, ironed, and packed in luxury
                          storage box.
                        </p>
                        <p className="font-body text-brand-700 mt-2 text-xs font-medium">
                          Est. Delivery: 4–6 business days to{' '}
                          {selectedAddress?.city || 'your city'} (
                          {selectedAddress?.pincode})
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-sm font-semibold text-neutral-900">
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-neutral-100 pt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="font-display h-11 rounded-xl border border-neutral-200 px-5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="font-display bg-brand-600 hover:bg-brand-700 h-11 rounded-xl px-6 text-xs font-semibold text-white transition-all"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Payment & Summary */}
            {step === 3 && (
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
                <h3 className="font-display mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900">
                  <CreditCard className="text-brand-600 h-5 w-5" />
                  Select Payment Method
                </h3>

                <div className="mb-8 space-y-4">
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-brand-600 bg-brand-50/20'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300">
                        {paymentMethod === 'razorpay' && (
                          <div className="bg-brand-600 h-2.5 w-2.5 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-neutral-900">
                          UPI / Cards / Net Banking
                        </p>
                        <p className="font-body text-xs text-neutral-500">
                          Secure transaction processed via Razorpay
                        </p>
                      </div>
                    </div>
                    <CreditCard className="h-5 w-5 text-neutral-400" />
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-brand-600 bg-brand-50/20'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300">
                        {paymentMethod === 'cod' && (
                          <div className="bg-brand-600 h-2.5 w-2.5 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-neutral-900">
                          Cash on Delivery (COD)
                        </p>
                        <p className="font-body text-xs text-neutral-500">
                          Pay in cash or UPI when your saree arrives
                        </p>
                      </div>
                    </div>
                    <Truck className="h-5 w-5 text-neutral-400" />
                  </div>
                </div>

                <div className="flex justify-between border-t border-neutral-100 pt-6">
                  <button
                    disabled={actionLoading}
                    onClick={() => setStep(2)}
                    className="font-display h-11 rounded-xl border border-neutral-200 px-5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                  >
                    Back
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={handlePlaceOrder}
                    className="font-display bg-brand-600 hover:bg-brand-700 inline-flex h-11 items-center gap-1.5 rounded-xl px-6 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                  >
                    {actionLoading && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {paymentMethod === 'cod'
                      ? 'Complete Order'
                      : `Pay ₹${total.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Right Side Panel: Summary */}
          <div className="space-y-6 lg:col-span-4">
            <div className="sticky top-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
              <h3 className="font-display mb-4 flex items-center gap-2 border-b border-neutral-100 pb-4 text-sm font-semibold tracking-wider text-neutral-900 uppercase">
                <ShoppingBag className="h-4.5 w-4.5 text-neutral-500" />
                Order Summary
              </h3>

              {/* Items List */}
              <div className="mb-6 max-h-[320px] space-y-4 overflow-y-auto pr-2">
                {effectiveCart?.items.map((item) => {
                  const firstImage = item.product.gallery?.[0]?.image
                  const imageUrl =
                    typeof firstImage === 'object' && firstImage !== null
                      ? firstImage.url || firstImage.sizes?.thumbnail?.url
                      : typeof firstImage === 'string'
                        ? firstImage
                        : undefined

                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-20 w-16 shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-lg border border-neutral-100 bg-neutral-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="font-display flex h-full w-full items-center justify-center p-1 text-center text-[10px] font-semibold text-neutral-400 uppercase">
                              No Image
                            </div>
                          )}
                        </div>
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-neutral-900 text-[10px] font-bold text-white shadow-xs">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
                        <h4 className="font-display truncate text-sm font-semibold text-neutral-900">
                          {item.product.name}
                        </h4>

                        {item.variant && (
                          <p className="font-body mt-0.5 text-xs text-neutral-500">
                            {item.variant.title ||
                              item.variant.size ||
                              'Custom Option'}
                          </p>
                        )}

                        <div className="mt-1.5 flex items-center justify-between">
                          <p className="font-body text-xs font-semibold text-neutral-900">
                            ₹{item.unitPrice.toLocaleString('en-IN')}
                          </p>
                          <p className="font-body text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Shipping Address Summary (if selected) */}
              {selectedAddress && (
                <div className="border-t border-neutral-100 py-4 text-xs">
                  <h4 className="font-display mb-1 font-semibold text-neutral-900">
                    Shipping To:
                  </h4>
                  <p className="font-body truncate text-neutral-500">
                    {selectedAddress.fullName}
                  </p>
                  <p className="font-body truncate text-neutral-500">
                    {selectedAddress.line1}, {selectedAddress.city}
                  </p>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="font-body space-y-2 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Verification</span>
                  <span className="font-semibold text-neutral-900">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="text-success flex justify-between">
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3 w-3" />
                      Coupon Discount
                    </span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="font-display flex justify-between border-t border-neutral-100 pt-3 text-sm font-semibold text-neutral-900">
                  <span>Order Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <p className="mt-1 text-right text-[10px] font-medium text-red-500">
                  * Excluding delivery charges
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

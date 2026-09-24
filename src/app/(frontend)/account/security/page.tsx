'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  Smartphone,
  Mail,
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { AddPhoneIdentity } from '@/components/account/add-phone-identity'
import { AddEmailIdentity } from '@/components/account/add-email-identity'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SecurityStatus {
  email: string | null
  isEmailVerified: boolean
  phone: string | null
  isPhoneVerified: boolean
  canRemovePhone: boolean
  canRemoveEmail: boolean
}

export default function SecurityPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()

  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [showAddPhone, setShowAddPhone] = useState(false)
  const [showAddEmail, setShowAddEmail] = useState(false)
  const [removingPhone, setRemovingPhone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadSecurityStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/email-identity')

      if (response.ok) {
        const data: SecurityStatus = await response.json()
        setSecurityStatus(data)
      } else {
        // Fallback to session data if the API fails
        const rawEmail = sessionData?.user?.email || ''
        const isFallbackEmail =
          rawEmail.includes('@phone.shayga.in') ||
          rawEmail.includes('@firebase.local')
        setSecurityStatus({
          email: isFallbackEmail ? null : rawEmail,
          isEmailVerified: (sessionData?.user as any)?.emailVerified === true,
          phone: (sessionData?.user as any)?.phoneNumber || null,
          isPhoneVerified: Boolean((sessionData?.user as any)?.phoneNumber),
          canRemovePhone: false,
          canRemoveEmail: false,
        })
      }
    } catch (err) {
      console.error('Failed to load security status:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionData])

  useEffect(() => {
    if (isPending) return
    if (!sessionData?.user) {
      router.push('/account/login')
      return
    }

    void Promise.resolve().then(() => loadSecurityStatus())
  }, [sessionData, isPending, router, loadSecurityStatus])

  const handleRemovePhone = async () => {
    if (
      !confirm(
        'Are you sure you want to remove your phone login? You can re-link it at any time.',
      )
    ) {
      return
    }

    try {
      setRemovingPhone(true)
      setError(null)

      const response = await fetch('/api/phone-identity', {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove phone login')
      }

      setSuccessMessage('Phone login removed successfully.')
      setTimeout(() => setSuccessMessage(null), 4000)
      setLoading(true)
      await loadSecurityStatus()
    } catch (err: any) {
      setError(err.message || 'Failed to remove phone login')
    } finally {
      setRemovingPhone(false)
    }
  }

  const handlePhoneAdded = async (result?: {
    merged?: boolean
    phoneNumber?: string
  }) => {
    setShowAddPhone(false)
    if (result?.merged) {
      setSuccessMessage(
        'Account merged successfully! Updating your security preferences...',
      )
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      setSuccessMessage('Phone number linked and verified successfully!')
      setTimeout(() => setSuccessMessage(null), 4000)
      setLoading(true)
      await loadSecurityStatus()
    }
  }

  const handleEmailAdded = async (result?: {
    email: string
    linked: boolean
  }) => {
    setShowAddEmail(false)
    if (result?.linked) {
      setSuccessMessage(
        'Existing account merged successfully! Reloading session...',
      )
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      setSuccessMessage('Email verified and linked successfully!')
      setTimeout(() => setSuccessMessage(null), 4000)
      setLoading(true)
      await loadSecurityStatus()
    }
  }

  if (isPending || (loading && !securityStatus)) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader2 className="text-brand-600 h-7 w-7 animate-spin" />
      </div>
    )
  }

  const hasVerifiedEmail = Boolean(
    securityStatus?.email && securityStatus?.isEmailVerified,
  )
  const hasVerifiedPhone = Boolean(
    securityStatus?.phone && securityStatus?.isPhoneVerified,
  )
  const isFullySecured = hasVerifiedEmail && hasVerifiedPhone

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:py-12">
      {/* Back Link */}
      <div>
        <Link
          href="/account"
          className="group font-body hover:text-brand-600 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Account
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="bg-brand-50 text-brand-700 ring-brand-200/60 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            Security & Login
          </h1>
          <p className="font-body mt-1 text-sm text-neutral-600">
            Manage your verified email and phone credentials for fast, secure
            sign-in.
          </p>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Account Security Health Banner */}
      {isFullySecured ? (
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4">
          <ShieldCheck className="text-success mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-display text-xs font-semibold tracking-wider text-neutral-900 uppercase">
              Account Security Status: Excellent
            </h4>
            <p className="font-body mt-0.5 text-xs leading-relaxed text-neutral-600">
              Both your email and phone number are verified. You can use either
              method to sign in, recover your account, and track orders.
            </p>
          </div>
        </div>
      ) : !hasVerifiedEmail ? (
        <div className="border-gold-300/40 bg-gold-200/20 flex items-start gap-3 rounded-xl border p-4">
          <ShieldAlert className="text-gold-600 mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-display text-xs font-semibold tracking-wider text-neutral-900 uppercase">
              Action Recommended: Link Your Email
            </h4>
            <p className="font-body mt-0.5 text-xs leading-relaxed text-neutral-700">
              You are signed in via phone OTP. Adding and verifying an email
              address protects your account from loss if your phone number
              changes and ensures you receive order invoices.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4">
          <Sparkles className="text-brand-600 mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-display text-xs font-semibold tracking-wider text-neutral-900 uppercase">
              Recommended: Enable Fast OTP Login
            </h4>
            <p className="font-body mt-0.5 text-xs leading-relaxed text-neutral-600">
              Link a verified phone number to enjoy 1-click SMS OTP login and
              unlock Cash on Delivery (COD) express checkout.
            </p>
          </div>
        </div>
      )}

      {/* Login Methods Section */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs">
        <div className="border-b border-neutral-100 px-6 py-4">
          <h2 className="font-display text-base font-semibold text-neutral-900">
            Sign-in Methods
          </h2>
          <p className="font-body text-xs text-neutral-500">
            Active credentials connected to this account.
          </p>
        </div>

        <div className="space-y-6 divide-y divide-neutral-100 p-6">
          {/* Email Method Item */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-body text-sm font-semibold text-neutral-900">
                      Email Address
                    </p>
                    {securityStatus?.email &&
                      (securityStatus.isEmailVerified ? (
                        <span className="bg-success-light text-success inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="bg-warning-light text-warning inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Unverified
                        </span>
                      ))}
                  </div>
                  {securityStatus?.email ? (
                    <p className="font-body mt-0.5 text-xs text-neutral-600">
                      {securityStatus.email}
                    </p>
                  ) : (
                    <p className="font-body mt-0.5 text-xs text-neutral-400">
                      No email address linked yet
                    </p>
                  )}
                </div>
              </div>

              {!showAddEmail && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {securityStatus?.email ? (
                    !securityStatus.isEmailVerified ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setShowAddEmail(true)
                          setShowAddPhone(false)
                        }}
                      >
                        Verify Now
                      </Button>
                    ) : null
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddEmail(true)
                        setShowAddPhone(false)
                      }}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Link Email
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Inline Email Form */}
            {showAddEmail && (
              <div className="mt-3 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-5">
                <AddEmailIdentity
                  initialEmail={securityStatus?.email}
                  isUnverified={Boolean(
                    securityStatus?.email && !securityStatus.isEmailVerified,
                  )}
                  onSuccess={handleEmailAdded}
                  onCancel={() => setShowAddEmail(false)}
                />
              </div>
            )}
          </div>

          {/* Phone Method Item */}
          <div className="space-y-4 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-body text-sm font-semibold text-neutral-900">
                      Phone Number
                    </p>
                    {securityStatus?.phone &&
                      (securityStatus.isPhoneVerified ? (
                        <span className="bg-success-light text-success inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="bg-warning-light text-warning inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Unverified
                        </span>
                      ))}
                  </div>
                  {securityStatus?.phone ? (
                    <p className="font-body mt-0.5 text-xs text-neutral-600">
                      {securityStatus.phone}
                    </p>
                  ) : (
                    <p className="font-body mt-0.5 text-xs text-neutral-400">
                      No mobile number linked yet
                    </p>
                  )}
                </div>
              </div>

              {!showAddPhone && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {securityStatus?.phone && securityStatus.isPhoneVerified ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhone}
                      disabled={removingPhone || !securityStatus.canRemovePhone}
                      title={
                        securityStatus.canRemovePhone
                          ? 'Remove phone login'
                          : 'You must have a verified email to remove phone login'
                      }
                      className="hover:text-error text-neutral-500"
                    >
                      {removingPhone ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="mr-1 h-4 w-4" />
                          <span className="text-xs">Remove</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddPhone(true)
                        setShowAddEmail(false)
                      }}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Link Phone
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Inline Phone Form */}
            {showAddPhone && (
              <div className="mt-3 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-5">
                <AddPhoneIdentity
                  onSuccess={handlePhoneAdded}
                  onCancel={() => setShowAddPhone(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Guidance Card */}
      <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5">
        <h3 className="font-display mb-3 text-xs font-semibold tracking-wider text-neutral-900 uppercase">
          Account & Linking Guarantee
        </h3>
        <ul className="font-body space-y-2.5 text-xs text-neutral-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-brand-600 mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>Unified Account:</strong> If you previously placed orders
              with your phone number or email separately, verifying both merges
              your order history and addresses seamlessly.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-brand-600 mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>Passwordless Sign-In:</strong> Once your phone number is
              verified, you can sign in anytime using SMS OTP without entering
              passwords.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-brand-600 mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>Loss Protection:</strong> To ensure you never lose access
              to your account, at least one verified login method must always
              remain active.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

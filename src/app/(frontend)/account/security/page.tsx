'use client'

import { useEffect, useState } from 'react'
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
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { AddPhoneIdentity } from '@/components/account/add-phone-identity'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PhoneIdentity {
  phoneNumber: string
  verifiedAt: string
}

export default function SecurityPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()

  const [phoneIdentity, setPhoneIdentity] = useState<PhoneIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddPhone, setShowAddPhone] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadPhoneIdentity = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/phone-identity')

      if (response.ok) {
        const data = await response.json()
        setPhoneIdentity(data.phoneIdentity)
      }
    } catch (err) {
      console.error('Failed to load phone identity:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isPending) return
    if (!sessionData?.user) {
      router.push('/account/login')
      return
    }

    loadPhoneIdentity()
  }, [sessionData, isPending, router])

  const handleRemovePhone = async () => {
    if (
      !confirm(
        'Are you sure you want to remove phone login? You can add it back later.',
      )
    ) {
      return
    }

    try {
      setRemoving(true)
      setError(null)

      const response = await fetch('/api/phone-identity', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove phone login')
      }

      setPhoneIdentity(null)
      setSuccessMessage('Phone login removed successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to remove phone login')
    } finally {
      setRemoving(false)
    }
  }

  const handlePhoneAdded = async () => {
    setShowAddPhone(false)
    setSuccessMessage('Phone login added successfully!')
    setTimeout(() => setSuccessMessage(null), 3000)
    await loadPhoneIdentity()
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/account"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Account
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Security & Login</h1>
            <p className="text-sm text-gray-600">
              Manage your login methods and account security
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Login Methods */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold">Login Methods</h2>

        <div className="space-y-4">
          {/* Email Login */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">
                  {sessionData?.user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Active</span>
            </div>
          </div>

          {/* Phone Login */}
          {!showAddPhone && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Phone Number</p>
                  {phoneIdentity ? (
                    <p className="text-sm text-gray-600">
                      {phoneIdentity.phoneNumber}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Not linked</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {phoneIdentity ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhone}
                      disabled={removing}
                    >
                      {removing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => setShowAddPhone(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Phone Login
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Add Phone Identity Form */}
          {showAddPhone && (
            <div className="rounded-lg border p-6">
              <AddPhoneIdentity
                onSuccess={handlePhoneAdded}
                onCancel={() => setShowAddPhone(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Security Tips */}
      <div className="rounded-lg border bg-blue-50 p-6">
        <h3 className="mb-3 font-semibold text-blue-900">Security Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              Adding a phone number allows you to log in with OTP (One-Time
              Password)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              Phone verification is required for Cash on Delivery (COD) orders
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              You can use any verified login method to access your account
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

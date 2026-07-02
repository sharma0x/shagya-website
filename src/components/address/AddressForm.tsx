'use client'

import { useState, useCallback } from 'react'
import { AlertCircle, Check, ChevronDown, Loader2, MapPin } from 'lucide-react'
import { ALL_COUNTRIES, DEFAULT_COUNTRY, OTHER_COUNTRY_VALUE } from '@/lib/countries'
import { INDIAN_STATES } from '@/lib/indian-states'
import type { CitySearchResult } from '@/lib/india-post'
import { PhoneInput } from '@/components/ui/phone-input'

export interface AddressFormData {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
}

interface AddressFormProps {
  initialData?: Partial<AddressFormData>
  onSubmit: (data: AddressFormData) => Promise<void>
  isSubmitting?: boolean
  showDefaultCheckbox?: boolean
  submitLabel: string
  onCancel: () => void
  error?: string
}

const inputClass =
  'font-body focus:border-brand-500 h-10 w-full appearance-none rounded-xl border border-neutral-200 bg-white pl-3 pr-8 text-sm outline-none'
const textInputClass =
  'font-body focus:border-brand-500 h-10 w-full rounded-xl border border-neutral-200 pl-3 text-sm outline-none'

export function AddressForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  showDefaultCheckbox = true,
  submitLabel,
  onCancel,
  error,
}: AddressFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [line1, setLine1] = useState(initialData?.line1 ?? '')
  const [line2, setLine2] = useState(initialData?.line2 ?? '')
  const [city, setCity] = useState(initialData?.city ?? '')
  const [state, setState] = useState(initialData?.state ?? '')
  const [pincode, setPincode] = useState(initialData?.pincode ?? '')
  const [country, setCountry] = useState(initialData?.country || DEFAULT_COUNTRY)
  const [customCountry, setCustomCountry] = useState('')
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false)

  const [verifyingPincode, setVerifyingPincode] = useState(false)
  const [pincodeVerified, setPincodeVerified] = useState(false)
  const [pincodeError, setPincodeError] = useState('')
  const [verifiedPincode, setVerifiedPincode] = useState(initialData?.pincode ?? '')

  const [searchingCity, setSearchingCity] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState<CitySearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const isOtherCountry = country === OTHER_COUNTRY_VALUE

  const handleCountryChange = (value: string) => {
    if (value !== 'India') {
      setState('')
    }
    setCountry(value)
  }

  const handlePincodeBlur = useCallback(async () => {
    const trimmed = pincode.trim()
    if (trimmed.length !== 6) return
    if (trimmed === verifiedPincode && pincodeVerified) return
    if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
      setPincodeError('Invalid pincode format')
      return
    }

    setVerifyingPincode(true)
    setPincodeError('')
    setPincodeVerified(false)

    try {
      const res = await fetch('/api/pincode/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: trimmed }),
      })

      const body = await res.json()

      if (!res.ok || body.error) {
        setPincodeError(body.error || 'Pincode not found')
        return
      }

      const data = body.data
      setPincodeVerified(true)
      setVerifiedPincode(trimmed)

      setCity(data.city)
      setState(data.state)
      setCountry('India')

      setPincodeError('')
    } catch {
      setPincodeError('Could not verify pincode. Try again.')
    } finally {
      setVerifyingPincode(false)
    }
  }, [pincode, verifiedPincode, pincodeVerified])

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPincode(value)
    if (value !== verifiedPincode) {
      setPincodeVerified(false)
      setPincodeError('')
    }
  }

  const handleCityBlur = useCallback(async () => {
    setShowSuggestions(false)
    const trimmed = city.trim()
    if (trimmed.length < 3) return
    if (country !== 'India') return

    setSearchingCity(true)
    setCitySuggestions([])

    try {
      const res = await fetch(
        `/api/pincode/city-search?city=${encodeURIComponent(trimmed)}`
      )
      const body = await res.json()

      if (!res.ok || body.error || !body.data?.length) {
        return
      }

      const results: CitySearchResult[] = body.data

      if (results.length === 1 && results[0].pincodes.length === 1) {
        const result = results[0]
        setPincode(result.pincodes[0])
        setState(result.state)
        setCountry('India')
      } else {
        setCitySuggestions(results)
        setShowSuggestions(true)
      }
    } catch {
    } finally {
      setSearchingCity(false)
    }
  }, [city, country])

  const selectPincodeFromCity = (result: CitySearchResult, pincodeValue: string) => {
    setPincode(pincodeValue)
    setState(result.state)
    setCountry('India')
    setShowSuggestions(false)
    setCitySuggestions([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      country: isOtherCountry ? customCountry : country,
      isDefault,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={textInputClass}
            placeholder={initialData?.fullName ? undefined : 'Receiver name'}
          />
        </div>
        <div>
          <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Phone Number
          </label>
          <PhoneInput
            required
            value={phone}
            onChange={setPhone}
            placeholder={initialData?.phone ? undefined : '10-digit mobile'}
          />
        </div>
      </div>

      <div>
        <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Address Line 1
        </label>
        <input
          type="text"
          required
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          className={textInputClass}
          placeholder={initialData?.line1 ? undefined : 'House/Flat No., Street, Area'}
        />
      </div>

      <div>
        <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          className={textInputClass}
          placeholder="Landmark, Suite, etc."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative">
          <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            City
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onBlur={handleCityBlur}
              onFocus={() => {
                if (citySuggestions.length > 0) setShowSuggestions(true)
              }}
              className={`${textInputClass} pr-8`}
              placeholder={initialData?.city ? undefined : 'City'}
            />
            {searchingCity && (
              <Loader2 className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-neutral-400" />
            )}
          </div>
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg">
              <div className="max-h-48 overflow-y-auto py-1">
                {citySuggestions.map((result) =>
                  result.pincodes.map((pc) => (
                    <button
                      key={`${result.city}-${pc}`}
                      type="button"
                      onClick={() => selectPincodeFromCity(result, pc)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-brand-50"
                    >
                      <MapPin className="h-3 w-3 shrink-0 text-neutral-400" />
                      <span className="font-display font-semibold text-neutral-900">
                        {pc}
                      </span>
                      <span className="font-body text-neutral-500">
                        {result.city}, {result.state}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            State
          </label>
          {country === 'India' ? (
            <div className="relative">
              <select
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`${inputClass} select-none`}
              >
                <option value="" disabled>
                  Select state
                </option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            </div>
          ) : (
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={textInputClass}
              placeholder="State / Province"
            />
          )}
        </div>
        <div>
          <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Pincode
          </label>
          <div className="relative">
            <input
              type="text"
              required
              inputMode="numeric"
              pattern="^[1-9][0-9]{5}$"
              value={pincode}
              onChange={handlePincodeChange}
              onBlur={handlePincodeBlur}
              className={`${textInputClass} ${pincodeVerified ? 'border-brand-600 bg-brand-50/10 pr-8' : ''}`}
              placeholder="6-digit PIN"
            />
            {verifyingPincode && (
              <Loader2 className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-neutral-400" />
            )}
            {pincodeVerified && !verifyingPincode && (
              <Check className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-emerald-500" />
            )}
          </div>
          {pincodeError && (
            <p className="mt-1 text-xs text-red-600">{pincodeError}</p>
          )}
          {pincodeVerified && !pincodeError && (
            <p className="mt-1 text-xs text-emerald-600">
              Verified &mdash; city &amp; state auto-filled. You can edit if needed.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Country
        </label>
        <div className="relative">
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className={`${inputClass} select-none`}
          >
            {ALL_COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        </div>
        {isOtherCountry && (
          <input
            type="text"
            required
            value={customCountry}
            onChange={(e) => setCustomCountry(e.target.value)}
            className={`${textInputClass} mt-2`}
            placeholder="Enter country name"
          />
        )}
      </div>

      {showDefaultCheckbox && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="accent-brand-600 rounded border-neutral-300"
          />
          <label htmlFor="isDefault" className="font-body text-xs text-neutral-600">
            Set as default shipping address
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="font-display h-10 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-display bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-1.5 rounded-xl px-5 text-xs font-semibold text-white transition-all"
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

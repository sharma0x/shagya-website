'use client'

import { useState } from 'react'
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react'
import {
  ALL_COUNTRIES,
  DEFAULT_COUNTRY,
  OTHER_COUNTRY_VALUE,
} from '@/lib/countries'
import { INDIAN_STATES } from '@/lib/indian-states'
import { Button } from '@/components/ui/button'

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

const ALL_COUNTRY_VALUES = new Set(ALL_COUNTRIES.map((c) => c.value))

function resolveCountryState(country?: string): {
  country: string
  customCountry: string
} {
  if (!country) return { country: DEFAULT_COUNTRY, customCountry: '' }
  if (ALL_COUNTRY_VALUES.has(country)) {
    return { country, customCountry: '' }
  }
  return { country: OTHER_COUNTRY_VALUE, customCountry: country }
}

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
  const [country, setCountry] = useState(
    () => resolveCountryState(initialData?.country).country,
  )
  const [customCountry, setCustomCountry] = useState(
    () => resolveCountryState(initialData?.country).customCountry,
  )
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false)

  const isOtherCountry = country === OTHER_COUNTRY_VALUE
  const isIndia = country === DEFAULT_COUNTRY

  const handleCountryChange = (value: string) => {
    if (value !== DEFAULT_COUNTRY) {
      setState('')
    }
    setCountry(value)
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
          <label
            htmlFor="address-fullName"
            className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
          >
            Full Name
          </label>
          <input
            id="address-fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={textInputClass}
            placeholder={initialData?.fullName ? undefined : 'Receiver name'}
          />
        </div>
        <div>
          <label
            htmlFor="address-phone"
            className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
          >
            Phone Number
          </label>
          <input
            id="address-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={textInputClass}
            placeholder={initialData?.phone ? undefined : '10-digit mobile'}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address-line1"
          className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
        >
          Address Line 1
        </label>
        <input
          id="address-line1"
          type="text"
          required
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          className={textInputClass}
          placeholder={
            initialData?.line1 ? undefined : 'House/Flat No., Street, Area'
          }
        />
      </div>

      <div>
        <label
          htmlFor="address-line2"
          className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
        >
          Address Line 2 (Optional)
        </label>
        <input
          id="address-line2"
          type="text"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          className={textInputClass}
          placeholder="Landmark, Suite, etc."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="address-city"
            className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
          >
            City
          </label>
          <input
            id="address-city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={textInputClass}
            placeholder={initialData?.city ? undefined : 'City'}
          />
        </div>
        <div>
          <label
            htmlFor="address-state"
            className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
          >
            State
          </label>
          {isIndia ? (
            <div className="relative">
              <select
                id="address-state"
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
              id="address-state"
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
          <label
            htmlFor="address-pincode"
            className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
          >
            Pincode
          </label>
          <input
            id="address-pincode"
            type="text"
            required
            pattern={isIndia ? '^[1-9][0-9]{5}$' : undefined}
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className={textInputClass}
            placeholder="6-digit PIN"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address-country"
          className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
        >
          Country
        </label>
        <div className="relative">
          <select
            id="address-country"
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
            id="address-customCountry"
            type="text"
            required
            aria-label="Custom country name"
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
            id="address-isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="accent-brand-600 rounded border-neutral-300"
          />
          <label
            htmlFor="address-isDefault"
            className="font-body text-xs text-neutral-600"
          >
            Set as default shipping address
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl text-xs font-semibold"
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

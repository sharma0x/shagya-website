'use client'

import { useState } from 'react'
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react'
import { ALL_COUNTRIES, DEFAULT_COUNTRY, OTHER_COUNTRY_VALUE } from '@/lib/countries'
import { INDIAN_STATES } from '@/lib/indian-states'

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

  const isOtherCountry = country === OTHER_COUNTRY_VALUE

  const handleCountryChange = (value: string) => {
    if (value !== 'India') {
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
          <input
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
        <div>
          <label className="font-display mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            City
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={textInputClass}
            placeholder={initialData?.city ? undefined : 'City'}
          />
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
          <input
            type="text"
            required
            pattern="^[1-9][0-9]{5}$"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className={textInputClass}
            placeholder="6-digit PIN"
          />
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

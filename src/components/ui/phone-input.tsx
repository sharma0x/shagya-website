'use client'

import { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const COUNTRY_CODES: { code: string; label: string }[] = [
  { code: '+91', label: 'IN +91' },
  { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+61', label: 'AU +61' },
  { code: '+971', label: 'AE +971' },
  { code: '+65', label: 'SG +65' },
  { code: '+60', label: 'MY +60' },
  { code: '+977', label: 'NP +977' },
  { code: '+880', label: 'BD +880' },
  { code: '+94', label: 'LK +94' },
  { code: '+49', label: 'DE +49' },
  { code: '+33', label: 'FR +33' },
  { code: '+81', label: 'JP +81' },
  { code: '+86', label: 'CN +86' },
  { code: '+966', label: 'SA +966' },
]

export interface PhoneInputValue {
  countryCode: string
  number: string
}

export function parsePhoneString(value: string): PhoneInputValue {
  const match = value.match(/^(\+\d{1,4})\s?(.*)$/)
  if (match) {
    return { countryCode: match[1], number: match[2] }
  }
  return { countryCode: '+91', number: value }
}

export function formatPhoneValue(value: PhoneInputValue): string {
  const num = value.number.trim()
  return num ? `${value.countryCode} ${num}` : ''
}

const countrySelectClass = cn(
  'font-body h-full appearance-none rounded-l-xl border border-neutral-200 bg-neutral-50 px-2.5 pr-6',
  'text-xs text-neutral-700 outline-none transition-colors',
  'focus:border-brand-500 focus:bg-white',
)

const numberInputClass = cn(
  'font-body h-full flex-1 rounded-r-xl border border-l-0 border-neutral-200 bg-white px-3',
  'text-sm text-neutral-900 outline-none transition-colors',
  'focus:border-brand-500',
  'placeholder:text-neutral-400',
)

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  className?: string
  id?: string
  name?: string
  inputClassName?: string
  disabled?: boolean
}

export function PhoneInput({
  value,
  onChange,
  required = false,
  placeholder = '10-digit mobile',
  className,
  id,
  name,
  inputClassName,
  disabled = false,
}: PhoneInputProps) {
  const [parsed, setParsed] = useState<PhoneInputValue>(parsePhoneString(value))

  const handleCountryCodeChange = useCallback(
    (code: string) => {
      const next = { countryCode: code, number: parsed.number }
      setParsed(next)
      onChange(formatPhoneValue(next))
    },
    [parsed.number, onChange],
  )

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const next = { countryCode: parsed.countryCode, number: raw }
      setParsed(next)
      onChange(formatPhoneValue(next))
    },
    [parsed.countryCode, onChange],
  )

  return (
    <div className={cn('flex h-10 w-full', className)}>
      <div className="relative shrink-0">
        <select
          value={parsed.countryCode}
          onChange={(e) => handleCountryCodeChange(e.target.value)}
          className={cn(countrySelectClass, inputClassName)}
          disabled={disabled}
          aria-label="Country code"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-neutral-400" />
      </div>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        required={required}
        value={parsed.number}
        onChange={handleNumberChange}
        className={cn(numberInputClass, inputClassName)}
        placeholder={placeholder}
        autoComplete="tel"
        disabled={disabled}
      />
    </div>
  )
}

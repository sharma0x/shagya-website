export interface CountryOption {
  label: string
  value: string
}

export const COUNTRIES: CountryOption[] = [
  { label: 'India', value: 'India' },
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Malaysia', value: 'Malaysia' },
  { label: 'Nepal', value: 'Nepal' },
  { label: 'Bangladesh', value: 'Bangladesh' },
  { label: 'Sri Lanka', value: 'Sri Lanka' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Japan', value: 'Japan' },
  { label: 'China', value: 'China' },
]

export const OTHER_COUNTRY_VALUE = '__other__'

export const ALL_COUNTRIES: CountryOption[] = [
  ...COUNTRIES,
  { label: 'Other', value: OTHER_COUNTRY_VALUE },
]

export const DEFAULT_COUNTRY = 'India'

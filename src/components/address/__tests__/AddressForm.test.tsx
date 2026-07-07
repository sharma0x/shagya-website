import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressForm, type AddressFormData } from '../AddressForm'
import { OTHER_COUNTRY_VALUE } from '@/lib/countries'

const noop = async () => {}

const baseProps = {
  onSubmit: vi.fn<(data: AddressFormData) => Promise<void>>(noop),
  onCancel: vi.fn(),
  submitLabel: 'Save Address',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AddressForm', () => {
  describe('default render', () => {
    it('defaults country to India and shows the state dropdown', () => {
      render(<AddressForm {...baseProps} />)

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      expect(countrySelect).toHaveValue('India')

      const stateSelect = screen.getByRole('combobox', { name: /state/i })
      expect(stateSelect).toBeInTheDocument()
      expect(stateSelect.tagName).toBe('SELECT')
    })

    it('does not show the custom-country input until "Other" is selected', () => {
      render(<AddressForm {...baseProps} />)
      expect(
        screen.queryByPlaceholderText(/enter country name/i),
      ).not.toBeInTheDocument()
    })
  })

  describe('country switching', () => {
    it('clears state and renders a text input when switching to a non-India country', async () => {
      const user = userEvent.setup()
      render(
        <AddressForm {...baseProps} initialData={{ state: 'Maharashtra' }} />,
      )

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      await user.selectOptions(countrySelect, 'United States')

      const stateInput = screen.getByPlaceholderText(/state \/ province/i)
      expect(stateInput).toBeInTheDocument()
      expect(stateInput).toHaveValue('')
      expect(stateInput.tagName).toBe('INPUT')
    })

    it('shows the custom-country text input when "Other" is selected', async () => {
      const user = userEvent.setup()
      render(<AddressForm {...baseProps} />)

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      await user.selectOptions(countrySelect, OTHER_COUNTRY_VALUE)

      const customCountryInput =
        screen.getByPlaceholderText(/enter country name/i)
      expect(customCountryInput).toBeInTheDocument()
    })

    it('updates customCountry when the user types in the custom-country input', async () => {
      const user = userEvent.setup()
      render(<AddressForm {...baseProps} />)

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      await user.selectOptions(countrySelect, OTHER_COUNTRY_VALUE)

      const customCountryInput =
        screen.getByPlaceholderText(/enter country name/i)
      await user.type(customCountryInput, 'Iceland')

      expect(customCountryInput).toHaveValue('Iceland')
    })
  })

  describe('edit prefill', () => {
    it('prefills country to a known non-India value from initialData', () => {
      render(
        <AddressForm
          {...baseProps}
          initialData={{ country: 'United States', state: 'California' }}
        />,
      )

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      expect(countrySelect).toHaveValue('United States')

      const stateInput = screen.getByPlaceholderText(/state \/ province/i)
      expect(stateInput).toBeInTheDocument()
      expect(stateInput).toHaveValue('California')
    })

    it('prefills the state dropdown to an Indian state from initialData', () => {
      render(
        <AddressForm
          {...baseProps}
          initialData={{ country: 'India', state: 'Maharashtra' }}
        />,
      )

      const stateSelect = screen.getByRole('combobox', { name: /state/i })
      expect(stateSelect).toHaveValue('Maharashtra')
    })

    it('falls back to "Other" and seeds customCountry when initialData.country is not in ALL_COUNTRIES', () => {
      render(
        <AddressForm
          {...baseProps}
          initialData={{ country: 'Iceland', state: 'Reykjavik' }}
        />,
      )

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      expect(countrySelect).toHaveValue(OTHER_COUNTRY_VALUE)

      const customCountryInput =
        screen.getByPlaceholderText(/enter country name/i)
      expect(customCountryInput).toBeInTheDocument()
      expect(customCountryInput).toHaveValue('Iceland')
    })
  })

  describe('pincode validation', () => {
    it('applies the Indian pincode pattern when country is India', () => {
      render(<AddressForm {...baseProps} />)
      const pincodeInput = screen.getByPlaceholderText(/6-digit pin/i)
      expect(pincodeInput).toHaveAttribute('pattern', '^[1-9][0-9]{5}$')
    })

    it('omits the pincode pattern for non-India countries', async () => {
      const user = userEvent.setup()
      render(<AddressForm {...baseProps} />)

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      await user.selectOptions(countrySelect, 'United States')

      const pincodeInput = screen.getByPlaceholderText(/6-digit pin/i)
      expect(pincodeInput).not.toHaveAttribute('pattern')
    })
  })

  describe('accessibility', () => {
    it('labels the custom-country input', async () => {
      const user = userEvent.setup()
      render(<AddressForm {...baseProps} />)

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      await user.selectOptions(countrySelect, OTHER_COUNTRY_VALUE)

      const customCountryInput =
        screen.getByPlaceholderText(/enter country name/i)
      expect(
        customCountryInput.getAttribute('aria-label') ??
          customCountryInput.getAttribute('id'),
      ).toBeTruthy()
    })
  })

  describe('submission', () => {
    it('calls onSubmit with the correct payload (customCountry merged into country when "Other" is selected)', async () => {
      const onSubmit = vi.fn<(data: AddressFormData) => Promise<void>>(noop)
      const user = userEvent.setup()

      render(
        <AddressForm
          {...baseProps}
          onSubmit={onSubmit}
          initialData={{
            fullName: 'Jane Doe',
            phone: '9876543210',
            line1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
          }}
        />,
      )

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      await user.selectOptions(countrySelect, OTHER_COUNTRY_VALUE)

      const stateInput = screen.getByPlaceholderText(/state \/ province/i)
      await user.type(stateInput, 'Capital Region')

      const customCountryInput =
        screen.getByPlaceholderText(/enter country name/i)
      await user.type(customCountryInput, 'Iceland')

      const submitButton = screen.getByRole('button', { name: /save address/i })
      await user.click(submitButton)

      expect(onSubmit).toHaveBeenCalledTimes(1)
      const submitted = onSubmit.mock.calls[0]?.[0] as AddressFormData
      expect(submitted).toMatchObject({
        fullName: 'Jane Doe',
        phone: '9876543210',
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Capital Region',
        pincode: '400001',
        country: 'Iceland',
      })
    })

    it('submits the selected known country as-is when not "Other"', async () => {
      const onSubmit = vi.fn<(data: AddressFormData) => Promise<void>>(noop)
      const user = userEvent.setup()

      render(
        <AddressForm
          {...baseProps}
          onSubmit={onSubmit}
          initialData={{
            fullName: 'Jane Doe',
            phone: '9876543210',
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
          }}
        />,
      )

      const countrySelect = screen.getByRole('combobox', { name: /country/i })
      await user.selectOptions(countrySelect, 'United States')

      const stateInput = screen.getByPlaceholderText(/state \/ province/i)
      await user.type(stateInput, 'California')

      const submitButton = screen.getByRole('button', { name: /save address/i })
      await user.click(submitButton)

      expect(onSubmit).toHaveBeenCalledTimes(1)
      const submitted = onSubmit.mock.calls[0]?.[0] as AddressFormData
      expect(submitted.country).toBe('United States')
      expect(submitted.state).toBe('California')
    })

    it('calls onCancel when the cancel button is clicked', async () => {
      const onCancel = vi.fn()
      const user = userEvent.setup()
      render(<AddressForm {...baseProps} onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('error display', () => {
    it('renders the error banner when error prop is set', () => {
      render(<AddressForm {...baseProps} error="Something went wrong" />)
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('showDefaultCheckbox', () => {
    it('renders the default checkbox by default', () => {
      render(<AddressForm {...baseProps} />)
      expect(
        screen.getByLabelText(/set as default shipping address/i),
      ).toBeInTheDocument()
    })

    it('hides the default checkbox when showDefaultCheckbox is false', () => {
      render(<AddressForm {...baseProps} showDefaultCheckbox={false} />)
      expect(
        screen.queryByLabelText(/set as default shipping address/i),
      ).not.toBeInTheDocument()
    })
  })
})

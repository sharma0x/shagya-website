'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface FormField {
  label: string
  name: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox'
  required?: boolean | null
  options?: string | null // newline separated
  id?: string | null
}

export interface FormDoc {
  id: string | number
  title: string
  submitButtonText?: string | null
  successMessage?: string | null
  fields?: FormField[] | null
}

export function ContactForm({ form }: { form: FormDoc | null }) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [honeypot, setHoneypot] = useState('')
  const [notRobot, setNotRobot] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form?.id || 'default-contact',
          data: formData,
          honeypot,
          notRobot,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit form')
      }

      setSuccess(true)
      setMessage(result.message || 'Thank you for your message!')
      setFormData({})
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4 py-8 text-center">
        <CheckCircle2 className="text-success mx-auto h-12 w-12 animate-bounce" />
        <h4 className="font-display text-lg font-semibold text-neutral-900">
          Message Received
        </h4>
        <p className="font-body mx-auto max-w-sm text-xs leading-relaxed text-neutral-500">
          {message}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="font-display text-brand-700 hover:text-brand-800 mt-4 text-xs font-semibold underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  // Fallback default form fields if none configured in DB
  const fields: FormField[] = form?.fields || [
    { label: 'Full Name', name: 'name', type: 'text', required: true },
    { label: 'Email Address', name: 'email', type: 'email', required: true },
    { label: 'Message', name: 'message', type: 'textarea', required: true },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Honeypot field (hidden for spam prevention) */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {fields.map((field, index) => {
        const fieldId = `field_${field.name}_${index}`
        const isRequired = !!field.required

        return (
          <div key={index} className="space-y-1.5">
            <label
              htmlFor={fieldId}
              className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
            >
              {field.label}{' '}
              {isRequired && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'textarea' && (
              <textarea
                id={fieldId}
                required={isRequired}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                rows={4}
                className="font-body focus:border-brand-500 w-full rounded-xl border border-neutral-200 bg-white p-3.5 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400"
                placeholder={`Type your ${field.label.toLowerCase()}...`}
              />
            )}

            {field.type === 'select' && (
              <select
                id={fieldId}
                required={isRequired}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 transition-colors outline-none"
              >
                <option value="">Select Option</option>
                {field.options?.split('\n').map((opt, oIdx) => (
                  <option key={oIdx} value={opt.trim()}>
                    {opt.trim()}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && (
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  id={fieldId}
                  type="checkbox"
                  required={isRequired}
                  checked={!!formData[field.name]}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.checked)
                  }
                  className="accent-brand-600 h-4.5 w-4.5 rounded border-neutral-300"
                />
                <label
                  htmlFor={fieldId}
                  className="font-body text-xs text-neutral-600"
                >
                  {field.label}
                </label>
              </div>
            )}

            {field.type !== 'textarea' &&
              field.type !== 'select' &&
              field.type !== 'checkbox' && (
                <input
                  id={fieldId}
                  type={field.type}
                  required={isRequired}
                  value={formData[field.name] || ''}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.value)
                  }
                  className="font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 transition-colors outline-none"
                  placeholder={field.label}
                />
              )}
          </div>
        )
      })}

      {/* "I am not a robot" bot protection */}
      <div className="flex items-center gap-2.5 pt-1">
        <input
          id="not-a-robot"
          type="checkbox"
          required
          checked={notRobot}
          onChange={(e) => setNotRobot(e.target.checked)}
          className="accent-brand-600 h-4.5 w-4.5 rounded border-neutral-300"
        />
        <label
          htmlFor="not-a-robot"
          className="font-body text-xs text-neutral-600"
        >
          I am not a robot
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 font-display flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {form?.submitButtonText || 'Send Message'}
        </button>
      </div>
    </form>
  )
}

'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export const EmailPreview: React.FC = () => {
  const htmlField = useFormFields(([fields]) => fields.html)
  const bodyField = useFormFields(([fields]) => fields.body)

  const content = (htmlField?.value || bodyField?.value || '') as string

  if (!content) {
    return (
      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#fafafa',
          border: '1px dashed #ccc',
          textAlign: 'center',
          color: '#888',
          borderRadius: '4px',
        }}
      >
        No email content to preview.
      </div>
    )
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h4
        style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}
      >
        Live Email Preview
      </h4>
      <div
        style={{
          border: '1px solid #eaeaeb',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#fff',
          height: '600px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <iframe
          srcDoc={content}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Email Preview"
        />
      </div>
    </div>
  )
}

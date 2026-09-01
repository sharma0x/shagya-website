'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { toast } from '@payloadcms/ui'

export const SyncSmartCollectionButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [isSyncing, setIsSyncing] = useState(false)

  if (!id) return null

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch(`/api/collections/${id}/sync`, {
        method: 'POST',
      })
      const json = await res.json()

      if (res.ok) {
        toast.success(`Successfully synced ${json.syncedCount} product(s).`)
      } else {
        toast.error(json.error || 'Failed to sync products.')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while syncing.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <p
        style={{ marginBottom: '0.5rem', color: 'var(--theme-elevation-400)' }}
      >
        Manually trigger a sync to link or unlink products based on the rules
        below.
      </p>
      <Button onClick={handleSync} disabled={isSyncing} size="small">
        {isSyncing ? 'Syncing...' : 'Sync Products Now'}
      </Button>
    </div>
  )
}

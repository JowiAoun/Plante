'use client'

/**
 * Dashboard Page
 * Main dashboard with farm grid and quick stats
 */

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FarmCard } from '@/components/FarmCard'
import { ActionButton } from '@/components/ActionButton'
import { AddFarmModal } from '@/components/AddFarmModal'
import type { Farm } from '@/types'
import './Dashboard.css'

/**
 * Dashboard - Main application page
 */
export const Dashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Fetch farms from API
  const fetchFarms = useCallback(async () => {
    try {
      const response = await fetch('/api/farms')
      if (!response.ok) throw new Error('Failed to fetch farms')
      const data = await response.json()
      setFarms(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching farms:', err)
      setError('Failed to load farms')
    } finally {
      setLoading(false)
    }
  }, [])

  // Sync all farms with Pi sensors
  const handleSyncAll = useCallback(async () => {
    if (syncing || farms.length === 0) return
    setSyncing(true)
    setError(null)

    try {
      // Sync the first farm (typically the only real one)
      const farmToSync = farms[0]
      
      const response = await fetch(`/api/farms/${farmToSync.id}/sync`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Sync failed')
      }

      // Refresh farms list after sync
      await fetchFarms()
    } catch (err) {
      console.error('Sync error:', err)
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }, [farms, syncing, fetchFarms])

  // Fetch farms on mount
  useEffect(() => {
    fetchFarms()
  }, [fetchFarms])

  return (
    <div className="dashboard">
      {/* Page Header */}
      <header className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
      </header>

      {/* Farm Grid */}
      <section className="dashboard__farms">
        <div className="dashboard__section-header">
          <h2>Your Farms</h2>
          <div className="dashboard__actions">
            <ActionButton 
              label={syncing ? "Syncing..." : "Sync Sensors"} 
              variant="secondary" 
              icon={syncing ? "⟳" : "🔄"} 
              size="small"
              onClick={handleSyncAll}
              disabled={syncing || loading || farms.length === 0}
            />
            <ActionButton 
              label="Add Farm" 
              variant="primary" 
              icon="➕" 
              size="small"
              onClick={() => setShowAddModal(true)}
            />
          </div>
        </div>
        
        {error && (
          <div className="dashboard__error">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="dashboard__loading">Loading farms...</div>
        ) : farms.length === 0 ? (
          <div className="dashboard__empty">
            No farms yet. Click "Add Farm" to get started!
          </div>
        ) : (
          <div className="dashboard__farm-grid">
            {farms.map((farm) => (
              <Link 
                key={farm.id} 
                href={`/farms/${farm.id}`}
                className="dashboard__farm-link"
              >
                <FarmCard
                  farm={farm}
                  selected={false}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Add Farm Modal */}
      <AddFarmModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchFarms}
      />
    </div>
  )
}

export default Dashboard

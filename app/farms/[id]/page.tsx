'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SensorBadge } from '@/components/SensorBadge'
import { ActionButton } from '@/components/ActionButton'
import { Toast, ToastContainer } from '@/components/Toast'
import { AppShell } from '@/components/AppShell'
import { FarmPhoto } from '@/components/FarmPhoto'
import { mockNotifications } from '@/mocks/data'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useRouter } from 'next/navigation'
import type { Farm } from '@/types'
import './farm-detail.css'

interface FarmPageProps {
  params: Promise<{ id: string }>
}

export default function FarmPage({ params }: FarmPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { user: currentUser } = useCurrentUser()
  
  const [farm, setFarm] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  // Fetch farm from API
  const fetchFarm = useCallback(async () => {
    try {
      const response = await fetch(`/api/farms/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setFarm(null)
        } else {
          throw new Error('Failed to fetch farm')
        }
        return
      }
      const data = await response.json()
      setFarm(data)
    } catch (error) {
      console.error('Error fetching farm:', error)
      setFarm(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  // Sync with Pi sensors
  const handleSync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    
    try {
      const response = await fetch(`/api/farms/${id}/sync`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Sync failed')
      }
      
      setToast({ message: 'Sensors synced!', variant: 'success' })
      await fetchFarm()
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Sync failed', 
        variant: 'error' 
      })
    } finally {
      setSyncing(false)
    }
  }, [id, syncing, fetchFarm])

  useEffect(() => {
    fetchFarm()
  }, [fetchFarm])

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') router.push('/')
    else router.push(`/?page=${page}`)
  }

  const handleAction = (action: string) => {
    setToast({ message: `${action} initiated!`, variant: 'success' })
  }

  // Loading state
  if (loading) {
    return (
      <AppShell
        user={currentUser}
        notifications={mockNotifications}
        currentPage="dashboard"
        onNavigate={handleNavigate as unknown as (page: string) => void}
      >
        <div className="farm-detail farm-detail--loading">
          <p>Loading farm...</p>
        </div>
      </AppShell>
    )
  }

  // Not found
  if (!farm) {
    return (
      <AppShell
        user={currentUser}
        notifications={mockNotifications}
        currentPage="dashboard"
        onNavigate={handleNavigate as unknown as (page: string) => void}
      >
        <div className="farm-detail farm-detail--not-found">
          <h1>Farm Not Found</h1>
          <p>The farm you're looking for doesn't exist.</p>
          <Link href="/" className="nes-btn is-primary">
            ← Back to Dashboard
          </Link>
        </div>
      </AppShell>
    )
  }

  const statusColor = {
    healthy: 'var(--color-healthy)',
    warning: 'var(--color-warning)',
    critical: 'var(--color-critical)',
  }[farm.status]

  return (
    <AppShell
      user={currentUser}
      notifications={mockNotifications}
      currentPage="dashboard"
      onNavigate={handleNavigate as unknown as (page: string) => void}
    >
      <div className="farm-detail">
        {/* Header with back button */}
        <header className="farm-detail__header">
          <Link href="/" className="farm-detail__back">
            ← Back
          </Link>
          <div className="farm-detail__title-row">
            <h1 className="farm-detail__title">{farm.name}</h1>
            <span 
              className="farm-detail__status"
              style={{ color: statusColor, borderColor: statusColor }}
            >
              {farm.status.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Two-column layout: Camera | Info */}
        <div className="farm-detail__content">
          {/* Left: Camera */}
          <section className="farm-detail__camera">
            <FarmPhoto farmId={farm.id} autoCapture={true} showFrame={true} />
          </section>

          {/* Right: Info column */}
          <div className="farm-detail__info">
            {/* Sensors */}
            <section className="farm-detail__sensors">
              <div className="farm-detail__sensors-header">
                <h2>Sensor Readings</h2>
                <ActionButton
                  label={syncing ? "Syncing..." : "Sync"}
                  variant="secondary"
                  icon={syncing ? "⟳" : "🔄"}
                  size="small"
                  onClick={handleSync}
                  disabled={syncing}
                />
              </div>
              <div className="farm-detail__sensor-grid">
                <SensorBadge
                  type="temp"
                  value={farm.sensors.temp.value}
                  unit={farm.sensors.temp.unit}
                  trend={farm.sensors.temp.trend}
                  showLabel
                />
                <SensorBadge
                  type="humidity"
                  value={farm.sensors.humidity.value}
                  unit={farm.sensors.humidity.unit}
                  trend={farm.sensors.humidity.trend}
                  showLabel
                />
                <SensorBadge
                  type="soil"
                  value={farm.sensors.soil.value}
                  unit={farm.sensors.soil.unit}
                  trend={farm.sensors.soil.trend}
                  showLabel
                />
                {farm.sensors.light && (
                  <SensorBadge
                    type="light"
                    value={farm.sensors.light.value}
                    unit={farm.sensors.light.unit}
                    trend={farm.sensors.light.trend}
                    showLabel
                  />
                )}
              </div>
            </section>

            {/* Actions */}
            <section className="farm-detail__actions">
              <h2>Actions</h2>
              <div className="farm-detail__action-grid">
                <ActionButton
                  label="Water Now"
                  variant="primary"
                  icon="💧"
                  size="large"
                  fullWidth
                  onClick={() => handleAction('Watering')}
                />
                <ActionButton
                  label="Open Hatch"
                  variant="secondary"
                  icon="🚪"
                  size="large"
                  fullWidth
                  onClick={() => handleAction('Hatch opening')}
                />
              </div>
            </section>

            {/* Stats */}
            <section className="farm-detail__stats nes-container is-dark">
              <h2>Farm Stats</h2>
              <div className="farm-detail__stats-grid">
                <div className="farm-detail__stat">
                  <span className="farm-detail__stat-value">7</span>
                  <span className="farm-detail__stat-label">Days Active</span>
                </div>
                <div className="farm-detail__stat">
                  <span className="farm-detail__stat-value">12</span>
                  <span className="farm-detail__stat-label">Waterings</span>
                </div>
                <div className="farm-detail__stat">
                  <span className="farm-detail__stat-value">98%</span>
                  <span className="farm-detail__stat-label">Uptime</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Toast notifications */}
        <ToastContainer>
          {toast && (
            <Toast
              message={toast.message}
              variant={toast.variant}
              visible={true}
              onClose={() => setToast(null)}
            />
          )}
        </ToastContainer>
      </div>
    </AppShell>
  )
}

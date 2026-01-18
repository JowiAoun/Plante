'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SensorBadge } from '@/components/SensorBadge'
import { ActionButton } from '@/components/ActionButton'
import { Toast, ToastContainer } from '@/components/Toast'
import { AppShell } from '@/components/AppShell'
import { FarmPhoto } from '@/components/FarmPhoto'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useNotifications } from '@/hooks/useNotifications'
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
  const { notifications, markAsRead } = useNotifications()

  const [farm, setFarm] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  const [lidIsOpen, setLidIsOpen] = useState(false)
  const [lidLoading, setLidLoading] = useState(false)

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

  // Auto-sync with Pi sensors using configurable interval from settings
  useEffect(() => {
    // Read interval from localStorage (default 5s)
    const getPollingInterval = () => {
      const saved = localStorage.getItem('plante-polling-interval')
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (parsed >= 1 && parsed <= 60) return parsed * 1000
      }
      return 5000
    }

    let intervalId: NodeJS.Timeout

    const startPolling = () => {
      const intervalMs = getPollingInterval()
      intervalId = setInterval(async () => {
        try {
          await fetch(`/api/farms/${id}/sync`, { method: 'POST' })
          await fetchFarm()
        } catch (error) {
          console.error('Auto-sync error:', error)
        }
      }, intervalMs)
    }

    startPolling()

    // Listen for settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plante-polling-interval') {
        clearInterval(intervalId)
        startPolling()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [id, fetchFarm])

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') router.push('/')
    else router.push(`/?page=${page}`)
  }

  const handleWaterAction = async () => {
    try {
      const response = await fetch(`/api/farms/${id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'water' }),
      })

      const data = await response.json()

      if (data.success) {
        setToast({ message: '📱 Water notification sent!', variant: 'success' })
      } else {
        setToast({ message: data.reason || 'Watering - SMS not configured', variant: 'success' })
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      setToast({ message: 'Watering initiated!', variant: 'success' })
    }
  }

  const handleHatchAction = async () => {
    if (lidLoading) return
    setLidLoading(true)

    try {
      const action = lidIsOpen ? 'close' : 'open'
      const response = await fetch(`/api/farms/${id}/lid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (data.success) {
        setLidIsOpen(data.isOpen)
        setToast({
          message: `🚪 Hatch ${data.isOpen ? 'opened' : 'closed'}!`,
          variant: 'success'
        })
      } else {
        setToast({
          message: data.error || 'Failed to control hatch',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Failed to control hatch:', error)
      setToast({ message: 'Hatch control failed', variant: 'error' })
    } finally {
      setLidLoading(false)
    }
  }

  // Fetch initial lid status
  useEffect(() => {
    const fetchLidStatus = async () => {
      try {
        const response = await fetch(`/api/farms/${id}/lid`)
        if (response.ok) {
          const data = await response.json()
          setLidIsOpen(data.isOpen || false)
        }
      } catch (error) {
        console.error('Failed to fetch lid status:', error)
      }
    }

    if (id) {
      fetchLidStatus()
    }
  }, [id])

  // Loading state
  if (loading) {
    return (
      <AppShell
        user={currentUser}
        notifications={notifications}
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
        notifications={notifications}
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
      notifications={notifications}
      currentPage="dashboard"
      onNavigate={handleNavigate as unknown as (page: string) => void}
    >
      <div className="farm-detail">
        {/* Back link above the grid */}
        <Link href="/" className="farm-detail__back">
          ← Back
        </Link>

        {/* Two-column layout: Title+Camera | Sensors+Info */}
        <div className="farm-detail__content">
          {/* Left: Title + Camera */}
          <section className="farm-detail__camera">
            <div className="farm-detail__title-row">
              <h1 className="farm-detail__title">{farm.name}</h1>
              <span
                className="farm-detail__status"
                style={{ color: statusColor, borderColor: statusColor }}
              >
                {farm.status.toUpperCase()}
              </span>
            </div>
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
                  onClick={handleWaterAction}
                />
                <ActionButton
                  label={lidLoading ? 'Working...' : (lidIsOpen ? 'Close Hatch' : 'Open Hatch')}
                  variant="secondary"
                  icon={lidIsOpen ? '🔒' : '🚪'}
                  size="large"
                  fullWidth
                  onClick={handleHatchAction}
                  disabled={lidLoading}
                />
              </div>
            </section>

            {/* Stats */}
            <section className="farm-detail__stats nes-container is-dark">
              <h2>Farm Stats</h2>
              <div className="farm-detail__stats-grid">
                <div className="farm-detail__stat">
                  <span className="farm-detail__stat-value">
                    {farm.createdAt
                      ? Math.max(1, Math.floor((Date.now() - new Date(farm.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
                      : 1}
                  </span>
                  <span className="farm-detail__stat-label">Days Active</span>
                </div>
                <div className="farm-detail__stat">
                  <span className="farm-detail__stat-value">{farm.wateringCount || 0}</span>
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

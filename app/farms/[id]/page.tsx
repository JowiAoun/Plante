'use client'

import { use } from 'react'
import Link from 'next/link'
import { mockFarms } from '@/mocks/data'
import { SensorBadge } from '@/components/SensorBadge'
import { ActionButton } from '@/components/ActionButton'
import { Toast, ToastContainer } from '@/components/Toast'
import { useState } from 'react'
import './farm-detail.css'

interface FarmPageProps {
  params: Promise<{ id: string }>
}

export default function FarmPage({ params }: FarmPageProps) {
  const { id } = use(params)
  const farm = mockFarms.find(f => f.id === id)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  if (!farm) {
    return (
      <div className="farm-detail farm-detail--not-found">
        <h1>Farm Not Found</h1>
        <p>The farm you're looking for doesn't exist.</p>
        <Link href="/" className="nes-btn is-primary">
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  const handleAction = (action: string) => {
    setToast({ message: `${action} initiated!`, variant: 'success' })
  }

  const statusColor = {
    healthy: 'var(--color-healthy)',
    warning: 'var(--color-warning)',
    critical: 'var(--color-critical)',
  }[farm.status]

  return (
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

      {/* Farm visual */}
      <section className="farm-detail__visual nes-container is-dark">
        <div className="farm-detail__plant-display">
          <span className="farm-detail__plant-emoji">🌱</span>
          <p className="farm-detail__plant-name">Plant Species</p>
        </div>
      </section>

      {/* Sensors */}
      <section className="farm-detail__sensors">
        <h2>Sensor Readings</h2>
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

      {/* History/Stats */}
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
  )
}

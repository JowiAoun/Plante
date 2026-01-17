'use client'

/**
 * Dashboard Page
 * Main dashboard with farm grid and quick stats
 */

import React from 'react'
import Link from 'next/link'
import { FarmCard } from '@/components/FarmCard'
import { ActionButton } from '@/components/ActionButton'
import { mockFarms, mockUsers } from '@/mocks/data'
import './Dashboard.css'

interface QuickStat {
  label: string
  value: string | number
  icon: string
  status?: 'healthy' | 'warning' | 'critical'
}

/**
 * Dashboard - Main application page
 */
export const Dashboard: React.FC = () => {
  // Calculate quick stats
  const totalFarms = mockFarms.length
  const healthyFarms = mockFarms.filter(f => f.status === 'healthy').length
  const criticalFarms = mockFarms.filter(f => f.status === 'critical').length

  const quickStats: QuickStat[] = [
    { label: 'Total Farms', value: totalFarms, icon: '🌱' },
    { label: 'Healthy', value: healthyFarms, icon: '💚', status: 'healthy' },
    { label: 'Critical', value: criticalFarms, icon: '❤️‍🔥', status: criticalFarms > 0 ? 'critical' : 'healthy' },
    { label: 'Top Farmer', value: mockUsers[3].displayName, icon: '👑' },
  ]

  return (
    <div className="dashboard">
      {/* Page Header */}
      <header className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__subtitle">Monitor your plants in real-time</p>
      </header>

      {/* Quick Stats */}
      <section className="dashboard__stats">
        {quickStats.map((stat, i) => (
          <div key={i} className={`dashboard__stat ${stat.status ? `dashboard__stat--${stat.status}` : ''}`}>
            <span className="dashboard__stat-icon">{stat.icon}</span>
            <div className="dashboard__stat-content">
              <span className="dashboard__stat-value">{stat.value}</span>
              <span className="dashboard__stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Farm Grid */}
      <section className="dashboard__farms">
        <div className="dashboard__section-header">
          <h2>Your Farms</h2>
          <ActionButton label="Add Farm" variant="primary" icon="➕" size="small" />
        </div>
        <div className="dashboard__farm-grid">
          {mockFarms.map((farm) => (
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
      </section>
    </div>
  )
}

export default Dashboard

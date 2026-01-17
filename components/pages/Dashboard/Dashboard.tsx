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

/**
 * Dashboard - Main application page
 */
export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      {/* Page Header */}
      <header className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
      </header>

      {/* Farm Grid */}

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

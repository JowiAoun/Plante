/**
 * Dashboard Page
 * Main dashboard with farm grid, quick stats, and notifications
 */

import React, { useState } from 'react';
import { FarmCard } from '../../components/FarmCard';
import { SensorBadge } from '../../components/SensorBadge';
import { ActionButton } from '../../components/ActionButton';
import { Toast, ToastContainer } from '../../components/Toast';
import { PixelModal } from '../../components/PixelModal';
import { mockFarms, mockUsers } from '../../mocks/data';
import type { Farm } from '../../types';
import './Dashboard.css';

interface QuickStat {
  label: string;
  value: string | number;
  icon: string;
  status?: 'healthy' | 'warning' | 'critical';
}

/**
 * Dashboard - Main application page
 */
export const Dashboard: React.FC = () => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  // Calculate quick stats
  const totalFarms = mockFarms.length;
  const healthyFarms = mockFarms.filter(f => f.status === 'healthy').length;
  const criticalFarms = mockFarms.filter(f => f.status === 'critical').length;

  const quickStats: QuickStat[] = [
    { label: 'Total Farms', value: totalFarms, icon: '🌱' },
    { label: 'Healthy', value: healthyFarms, icon: '💚', status: 'healthy' },
    { label: 'Critical', value: criticalFarms, icon: '❤️‍🔥', status: criticalFarms > 0 ? 'critical' : 'healthy' },
    { label: 'Top Farmer', value: mockUsers[3].displayName, icon: '👑' },
  ];

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
    setDetailModalOpen(true);
  };

  const handleAction = (action: string) => {
    setToast({ message: `${action} initiated!`, variant: 'success' });
    // In real app, this would trigger API call
  };

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
            <FarmCard
              key={farm.id}
              farm={farm}
              selected={selectedFarm?.id === farm.id}
              onSelect={handleFarmSelect}
            />
          ))}
        </div>
      </section>

      {/* Farm Detail Modal */}
      <PixelModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedFarm?.name || 'Farm Details'}
        size="medium"
      >
        {selectedFarm && (
          <div className="dashboard__detail">
            <div className="dashboard__detail-status">
              <span className={`status-${selectedFarm.status}`}>
                Status: {selectedFarm.status.toUpperCase()}
              </span>
            </div>

            <div className="dashboard__detail-sensors">
              <SensorBadge
                type="temp"
                value={selectedFarm.sensors.temp.value}
                unit={selectedFarm.sensors.temp.unit}
                trend={selectedFarm.sensors.temp.trend}
                showLabel
              />
              <SensorBadge
                type="humidity"
                value={selectedFarm.sensors.humidity.value}
                unit={selectedFarm.sensors.humidity.unit}
                trend={selectedFarm.sensors.humidity.trend}
                showLabel
              />
              <SensorBadge
                type="soil"
                value={selectedFarm.sensors.soil.value}
                unit={selectedFarm.sensors.soil.unit}
                trend={selectedFarm.sensors.soil.trend}
                showLabel
              />
            </div>

            <div className="dashboard__detail-actions">
              <ActionButton
                label="Water Now"
                variant="primary"
                icon="💧"
                onClick={() => handleAction('Watering')}
              />
              <ActionButton
                label="Open Hatch"
                variant="secondary"
                icon="🚪"
                onClick={() => handleAction('Hatch opening')}
              />
            </div>
          </div>
        )}
      </PixelModal>

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
  );
};

export default Dashboard;

/**
 * Plante - Main Application
 * Pixel-art UI for plant monitoring
 */

import { useState } from 'react';
import { FarmCard } from './components/FarmCard';
import { mockFarms } from './mocks/data';
import type { Farm } from './types';
import './App.css';

function App() {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header nes-container is-dark">
        <h1 className="app__title">🌱 Plante</h1>
        <p className="app__subtitle">Pixel-art Plant Monitoring</p>
      </header>

      {/* Main Content */}
      <main className="app__main">
        <section className="app__section">
          <h2>Your Farms</h2>
          <div className="app__farm-grid">
            {mockFarms.map((farm) => (
              <FarmCard
                key={farm.id}
                farm={farm}
                selected={selectedFarm?.id === farm.id}
                onSelect={setSelectedFarm}
              />
            ))}
          </div>
        </section>

        {/* Selected Farm Detail */}
        {selectedFarm && (
          <section className="app__section nes-container is-dark">
            <h2>Selected: {selectedFarm.name}</h2>
            <div className="app__detail">
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-${selectedFarm.status}`}>
                  {selectedFarm.status.toUpperCase()}
                </span>
              </p>
              <p>
                <strong>Temperature:</strong> {selectedFarm.sensors.temp.value}
                {selectedFarm.sensors.temp.unit}
              </p>
              <p>
                <strong>Humidity:</strong> {selectedFarm.sensors.humidity.value}
                {selectedFarm.sensors.humidity.unit}
              </p>
              <p>
                <strong>Soil:</strong> {selectedFarm.sensors.soil.value}
                {selectedFarm.sensors.soil.unit}
              </p>
              <div className="app__actions">
                <button className="nes-btn is-primary">Water Now</button>
                <button className="nes-btn is-warning">Open Hatch</button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <p>Phase 0 - Scaffold Demo | MSW Active</p>
      </footer>
    </div>
  );
}

export default App;

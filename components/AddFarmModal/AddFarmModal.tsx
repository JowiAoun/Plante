'use client'

/**
 * AddFarmModal Component
 * Modal for adding a new farm connected to the Raspberry Pi
 */

import React, { useState } from 'react'
import { ActionButton } from '@/components/ActionButton'
import './AddFarmModal.css'

export interface AddFarmModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Success handler - called with the new farm */
  onSuccess: () => void
}

/**
 * AddFarmModal - Modal for creating a new farm
 */
export const AddFarmModal: React.FC<AddFarmModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Farm name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          species: species.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create farm')
      }

      // Reset form
      setName('')
      setSpecies('')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create farm')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName('')
      setSpecies('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="add-farm-modal__overlay" onClick={handleClose}>
      <div 
        className="add-farm-modal nes-container is-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="add-farm-modal__header">
          <h2>Add New Farm</h2>
          <button 
            className="add-farm-modal__close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="add-farm-modal__form">
          {error && (
            <div className="add-farm-modal__error">
              ⚠️ {error}
            </div>
          )}

          <div className="add-farm-modal__field">
            <label htmlFor="farm-name">Farm Name *</label>
            <input
              id="farm-name"
              type="text"
              className="nes-input is-dark"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kalanchoe Farm"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="add-farm-modal__field">
            <label htmlFor="farm-species">Plant Species (optional)</label>
            <input
              id="farm-species"
              type="text"
              className="nes-input is-dark"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g., Kalanchoe"
              disabled={loading}
            />
          </div>

          <div className="add-farm-modal__info">
            <p>🌱 This farm will be connected to your Raspberry Pi sensors.</p>
          </div>

          <div className="add-farm-modal__actions">
            <ActionButton
              label="Cancel"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            />
            <ActionButton
              label={loading ? "Creating..." : "Create Farm"}
              variant="primary"
              type="submit"
              loading={loading}
              icon="🌿"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFarmModal

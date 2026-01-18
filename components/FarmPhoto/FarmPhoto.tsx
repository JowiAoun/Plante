'use client'

/**
 * FarmPhoto Component
 * Displays live photos from the Raspberry Pi camera with pixel-art styling
 */

import React, { useState, useEffect, useCallback } from 'react'
import './FarmPhoto.css'

export interface FarmPhotoProps {
  /** Farm ID to capture photo for */
  farmId: string
  /** Auto-capture on mount */
  autoCapture?: boolean
  /** Show camera frame */
  showFrame?: boolean
}

type PhotoState = 'idle' | 'capturing' | 'flashing' | 'ready' | 'error'

/**
 * FarmPhoto - Pixel camera component with capture animation
 */
export const FarmPhoto: React.FC<FarmPhotoProps> = ({
  farmId,
  autoCapture = true,
  showFrame = true,
}) => {
  const [state, setState] = useState<PhotoState>('idle')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [timestamp, setTimestamp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const piApiUrl = process.env.NEXT_PUBLIC_PI_API_URL || ''

  // Capture photo from Pi
  const capturePhoto = useCallback(async () => {
    setState('capturing')
    setError(null)

    try {
      // First, trigger a new capture
      const captureResponse = await fetch(`/api/farms/${farmId}/photo`, {
        method: 'POST',
      })

      if (!captureResponse.ok) {
        const data = await captureResponse.json()
        throw new Error(data.error || 'Failed to capture photo')
      }

      // Build the photo URL from Pi API directly
      const photoFileUrl = piApiUrl 
        ? `${piApiUrl}/camera/latest/file?t=${Date.now()}`
        : null

      if (!photoFileUrl) {
        throw new Error('Pi API URL not configured')
      }

      // Preload the image
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = photoFileUrl
      })

      // Flash effect
      setState('flashing')
      setPhotoUrl(photoFileUrl)
      setTimestamp(new Date().toISOString())

      // After flash animation, show ready state
      setTimeout(() => {
        setState('ready')
      }, 300)

    } catch (err) {
      console.error('Photo capture error:', err)
      setError(err instanceof Error ? err.message : 'Capture failed')
      setState('error')
    }
  }, [farmId, piApiUrl])

  // Auto-capture on mount
  useEffect(() => {
    if (autoCapture) {
      capturePhoto()
    }
  }, [autoCapture, capturePhoto])

  // Format relative time
  const formatTime = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  const frameClass = showFrame ? 'farm-photo--framed' : ''
  const stateClass = `farm-photo--${state}`

  return (
    <div className={`farm-photo ${frameClass} ${stateClass}`}>
      {/* Camera Frame Header */}
      {showFrame && (
        <div className="farm-photo__header">
          <span className="farm-photo__title">📷 LIVE PHOTO</span>
          <span className="farm-photo__rec">
            {state === 'capturing' && '● REC'}
          </span>
        </div>
      )}

      {/* Photo Viewport */}
      <div className="farm-photo__viewport">
        {/* Flash overlay */}
        {state === 'flashing' && <div className="farm-photo__flash" />}

        {/* Loading/Idle state - pixel camera sprite */}
        {(state === 'idle' || state === 'capturing') && (
          <div className="farm-photo__placeholder">
            <img 
              src="/images/pixel-camera.png" 
              alt="Camera loading" 
              className="farm-photo__sprite" 
            />
            <span className="farm-photo__focusing">
              {state === 'capturing' ? 'Focusing...' : 'Ready'}
            </span>
          </div>
        )}

        {/* Photo display */}
        {(state === 'ready' || state === 'flashing') && photoUrl && (
          <img
            src={photoUrl}
            alt="Farm plant photo"
            className="farm-photo__image"
          />
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="farm-photo__error">
            <span>📷</span>
            <p>{error || 'Camera offline'}</p>
          </div>
        )}
      </div>

      {/* Camera Frame Footer */}
      {showFrame && (
        <div className="farm-photo__footer">
          <div className="farm-photo__status">
            <span className="farm-photo__health">
              Visual Health: ✅ Healthy
            </span>
            {timestamp && (
              <span className="farm-photo__timestamp">
                Captured: {formatTime(timestamp)}
              </span>
            )}
          </div>
          <button
            className="farm-photo__capture-btn"
            onClick={capturePhoto}
            disabled={state === 'capturing' || state === 'flashing'}
            aria-label="Capture photo"
          >
            📸
          </button>
        </div>
      )}
    </div>
  )
}

export default FarmPhoto

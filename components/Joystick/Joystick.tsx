'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import './Joystick.css';

export interface JoystickOutput {
  x: number;  // -1 to 1
  y: number;  // -1 to 1
  magnitude: number;  // 0 to 1
  angle: number;  // radians
}

export interface JoystickProps {
  onMove: (output: JoystickOutput) => void;
  onStop: () => void;
  size?: number;
}

export const Joystick: React.FC<JoystickProps> = ({
  onMove,
  onStop,
  size = 100,
}) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const knobSize = size * 0.4;
  const maxDistance = (size - knobSize) / 2;

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return;
    
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    
    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Clamp to max distance
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      deltaX *= scale;
      deltaY *= scale;
    }
    
    setPosition({ x: deltaX, y: deltaY });
    
    // Normalize output to -1 to 1
    const normalizedX = deltaX / maxDistance;
    const normalizedY = deltaY / maxDistance;
    const magnitude = Math.min(distance / maxDistance, 1);
    const angle = Math.atan2(deltaY, deltaX);
    
    onMove({
      x: normalizedX,
      y: normalizedY,
      magnitude,
      angle,
    });
  }, [maxDistance, onMove]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    handleMove(clientX, clientY);
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onStop();
  }, [onStop]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [isDragging, handleMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Mouse events (for testing on desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      handleEnd();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div
      ref={baseRef}
      className="joystick"
      style={{ width: size, height: size }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`joystick__knob ${isDragging ? 'joystick__knob--active' : ''}`}
        style={{
          width: knobSize,
          height: knobSize,
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </div>
  );
};

export default Joystick;

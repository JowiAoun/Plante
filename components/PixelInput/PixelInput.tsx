'use client';

/**
 * PixelInput Component
 * NES-styled input field with label, icon, and error support
 */

import React from 'react';
import './PixelInput.css';

export interface PixelInputProps {
  /** Input label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Input type */
  type?: 'text' | 'email' | 'password';
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Icon (emoji or text) */
  icon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Input ID for accessibility */
  id?: string;
  /** Maximum length */
  maxLength?: number;
}

/**
 * PixelInput - Pixel-art styled input field
 */
export const PixelInput: React.FC<PixelInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  hint,
  icon,
  disabled = false,
  id,
  maxLength,
}) => {
  const inputId = id || `pixel-input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
  const hasError = Boolean(error);

  return (
    <div className="pixel-input">
      {label && (
        <label htmlFor={inputId} className="pixel-input__label">
          {label}
        </label>
      )}
      <div className="pixel-input__wrapper">
        {icon && <span className="pixel-input__icon" aria-hidden="true">{icon}</span>}
        <input
          id={inputId}
          type={type}
          className={`pixel-input__field ${icon ? 'pixel-input__field--with-icon' : ''} ${hasError ? 'pixel-input__field--error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="pixel-input__error" role="alert">
          {error}
        </span>
      )}
      {hint && !error && (
        <span id={`${inputId}-hint`} className="pixel-input__hint">
          {hint}
        </span>
      )}
    </div>
  );
};

export default PixelInput;

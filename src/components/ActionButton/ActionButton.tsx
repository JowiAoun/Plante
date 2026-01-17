/**
 * ActionButton Component
 * NES-styled primary/secondary buttons for actions
 */

import React from 'react';
import './ActionButton.css';

export type ActionButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export interface ActionButtonProps {
  /** Button label text */
  label: string;
  /** Visual variant */
  variant?: ActionButtonVariant;
  /** Click handler */
  onClick?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon (emoji or component) to show before label */
  icon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * ActionButton - NES-styled button with variants and loading state
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  variant = 'primary',
  onClick,
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  size = 'medium',
}) => {
  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick();
    }
  };

  const variantClass = `is-${variant}`;
  const sizeClass = `action-button--${size}`;
  const widthClass = fullWidth ? 'action-button--full' : '';
  const stateClass = loading ? 'action-button--loading' : '';

  return (
    <button
      type="button"
      className={`nes-btn action-button ${variantClass} ${sizeClass} ${widthClass} ${stateClass}`}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled}
    >
      {loading ? (
        <span className="action-button__loader" aria-hidden="true">
          ⏳
        </span>
      ) : icon ? (
        <span className="action-button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="action-button__label">{label}</span>
    </button>
  );
};

export default ActionButton;

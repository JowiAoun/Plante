'use client';

import React from 'react';
import './EmoteMenu.css';

export type EmoteType = 'wave' | 'jump' | 'spin' | 'nod' | 'shake' | 'celebrate';

export interface Emote {
  id: EmoteType;
  icon: string;
  label: string;
  key: string;
}

export const EMOTES: Emote[] = [
  { id: 'wave', icon: '👋', label: 'Wave', key: '1' },
  { id: 'jump', icon: '🦘', label: 'Jump', key: '2' },
  { id: 'spin', icon: '🔄', label: 'Spin', key: '3' },
  { id: 'nod', icon: '👍', label: 'Nod', key: '4' },
  { id: 'shake', icon: '❌', label: 'Shake', key: '5' },
  { id: 'celebrate', icon: '🎉', label: 'Celebrate', key: '6' },
];

export interface EmoteMenuProps {
  isOpen: boolean;
  onSelect: (emote: EmoteType) => void;
  onClose: () => void;
}

export const EmoteMenu: React.FC<EmoteMenuProps> = ({
  isOpen,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleEmoteClick = (emote: EmoteType) => {
    onSelect(emote);
    onClose();
  };

  return (
    <div className="emote-menu" onClick={(e) => e.stopPropagation()}>
      <div className="emote-menu__backdrop" onClick={onClose} />
      <div className="emote-menu__container">
        <div className="emote-menu__title">Emotes (G to close)</div>
        <div className="emote-menu__grid">
          {EMOTES.map((emote) => (
            <button
              key={emote.id}
              className="emote-menu__btn"
              onClick={() => handleEmoteClick(emote.id)}
              title={emote.label}
            >
              <span className="emote-menu__icon">{emote.icon}</span>
              <span className="emote-menu__key">{emote.key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmoteMenu;

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LevelUpModal } from './LevelUpModal';
import { ActionButton } from '@/components/ActionButton';
import '@/app/globals.css';

const meta: Meta<typeof LevelUpModal> = {
  title: 'Components/LevelUpModal',
  component: LevelUpModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <ActionButton label="Level Up!" onClick={() => setIsOpen(true)} />
        <LevelUpModal
          isOpen={isOpen}
          level={12}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

export const WithRewards: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <ActionButton label="Level Up with Rewards!" onClick={() => setIsOpen(true)} />
        <LevelUpModal
          isOpen={isOpen}
          level={15}
          rewards={[
            { icon: '🏆', name: 'Gold Trophy' },
            { icon: '🌱', name: 'Rare Seed Pack' },
            { icon: '💧', name: '+50 Water Capacity' },
          ]}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

export const HighLevel: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <ActionButton label="Max Level!" onClick={() => setIsOpen(true)} />
        <LevelUpModal
          isOpen={isOpen}
          level={99}
          rewards={[
            { icon: '👑', name: 'Master Farmer Title' },
          ]}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

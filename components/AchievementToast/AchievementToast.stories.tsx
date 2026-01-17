import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AchievementToast } from './AchievementToast';
import { ActionButton } from '@/components/ActionButton';
import { achievements } from '@/data/achievements';
import '@/app/globals.css';

const meta: Meta<typeof AchievementToast> = {
  title: 'Animations/AchievementToast',
  component: AchievementToast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    achievement: achievements[0],
    visible: true,
  },
};

export const Rare: Story = {
  args: {
    achievement: achievements[1],
    visible: true,
  },
};

export const Epic: Story = {
  args: {
    achievement: achievements[2],
    visible: true,
  },
};

export const Legendary: Story = {
  args: {
    achievement: achievements[4],
    visible: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    const [currentAch, setCurrentAch] = useState(achievements[0]);

    const showAchievement = (index: number) => {
      setCurrentAch(achievements[index]);
      setVisible(true);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ActionButton 
          label="Unlock Common" 
          variant="secondary" 
          onClick={() => showAchievement(0)} 
        />
        <ActionButton 
          label="Unlock Rare" 
          variant="primary" 
          onClick={() => showAchievement(1)} 
        />
        <ActionButton 
          label="Unlock Legendary" 
          variant="success" 
          onClick={() => showAchievement(4)} 
        />
        <AchievementToast
          achievement={currentAch}
          visible={visible}
          onClose={() => setVisible(false)}
        />
      </div>
    );
  },
};

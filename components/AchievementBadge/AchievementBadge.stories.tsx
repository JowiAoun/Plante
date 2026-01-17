import type { Meta, StoryObj } from '@storybook/react';
import { AchievementBadge } from './AchievementBadge';
import { achievements } from '@/data/achievements';
import '@/app/globals.css';

const meta: Meta<typeof AchievementBadge> = {
  title: 'Components/AchievementBadge',
  component: AchievementBadge,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Unlocked: Story = {
  args: {
    achievement: achievements[0],
    unlocked: true,
  },
};

export const Locked: Story = {
  args: {
    achievement: achievements[0],
    unlocked: false,
  },
};

export const RareUnlocked: Story = {
  args: {
    achievement: achievements[1],
    unlocked: true,
  },
};

export const EpicUnlocked: Story = {
  args: {
    achievement: achievements[2],
    unlocked: true,
  },
};

export const LegendaryUnlocked: Story = {
  args: {
    achievement: achievements[4],
    unlocked: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <AchievementBadge achievement={achievements[0]} unlocked size="small" />
      <AchievementBadge achievement={achievements[0]} unlocked size="medium" />
      <AchievementBadge achievement={achievements[0]} unlocked size="large" />
    </div>
  ),
};

export const AllAchievements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {achievements.map((ach, i) => (
        <AchievementBadge 
          key={ach.id} 
          achievement={ach} 
          unlocked={i < 3} 
        />
      ))}
    </div>
  ),
};

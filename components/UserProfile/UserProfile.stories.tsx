import type { Meta, StoryObj } from '@storybook/react';
import { UserProfile } from './UserProfile';

const meta: Meta<typeof UserProfile> = {
  title: 'Components/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

const mockUser = {
  id: '1',
  username: 'PixelFarmer',
  displayName: 'Pixel Farmer',
  avatarSeed: 'PixelFarmer',
  level: 15,
  xp: 2500,
};

export const Default: Story = {
  args: {
    user: mockUser,
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    user: { ...mockUser, displayName: 'Tiny Tim', level: 5 },
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    user: { ...mockUser, displayName: 'Big Boss', level: 99 },
    size: 'large',
  },
};

export const NoLevel: Story = {
  args: {
    user: mockUser,
    showLevel: false,
  },
};

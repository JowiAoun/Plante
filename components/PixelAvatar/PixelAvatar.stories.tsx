import type { Meta, StoryObj } from '@storybook/react';
import { PixelAvatar } from './PixelAvatar';

const meta: Meta<typeof PixelAvatar> = {
  title: 'Components/PixelAvatar',
  component: PixelAvatar,
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
type Story = StoryObj<typeof PixelAvatar>;

export const Default: Story = {
  args: {
    username: 'FarmerJohn',
    seed: 'FarmerJohn',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    username: 'Guest',
    seed: 'guest123',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    username: 'AdminUser',
    seed: 'admin_seed_secure',
    size: 'large',
  },
};

export const DifferentSeeds: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <PixelAvatar username="User 1" seed="alice" />
      <PixelAvatar username="User 2" seed="bob" />
      <PixelAvatar username="User 3" seed="charlie" />
      <PixelAvatar username="User 4" seed="dave" />
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { ActionButton } from './ActionButton';
import '../../index.css';

const meta: Meta<typeof ActionButton> = {
  title: 'Components/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: 'Water Now',
    variant: 'primary',
    icon: '💧',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Open Hatch',
    variant: 'secondary',
    icon: '🚪',
  },
};

export const Success: Story = {
  args: {
    label: 'Harvest Complete',
    variant: 'success',
    icon: '✅',
  },
};

export const Warning: Story = {
  args: {
    label: 'Check Sensors',
    variant: 'warning',
    icon: '⚠️',
  },
};

export const Error: Story = {
  args: {
    label: 'Emergency Stop',
    variant: 'error',
    icon: '🛑',
  },
};

export const Loading: Story = {
  args: {
    label: 'Watering...',
    variant: 'primary',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Unavailable',
    variant: 'primary',
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <ActionButton label="Small" size="small" variant="primary" />
      <ActionButton label="Medium" size="medium" variant="primary" />
      <ActionButton label="Large" size="large" variant="primary" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <ActionButton label="Primary Action" variant="primary" icon="💧" />
      <ActionButton label="Secondary Action" variant="secondary" icon="🔧" />
      <ActionButton label="Success Action" variant="success" icon="✅" />
      <ActionButton label="Warning Action" variant="warning" icon="⚠️" />
      <ActionButton label="Error Action" variant="error" icon="🛑" />
    </div>
  ),
};

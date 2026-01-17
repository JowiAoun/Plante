import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedButton } from './AnimatedButton';
import '../../index.css';

const meta: Meta<typeof AnimatedButton> = {
  title: 'Animations/AnimatedButton',
  component: AnimatedButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Click Me',
    variant: 'primary',
    icon: '💧',
  },
};

export const WithBounce: Story = {
  args: {
    label: 'Hover Me',
    variant: 'success',
    icon: '🌱',
    bounceOnHover: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <AnimatedButton label="Primary" variant="primary" icon="💧" />
      <AnimatedButton label="Secondary" variant="secondary" icon="🔧" />
      <AnimatedButton label="Success" variant="success" icon="✅" bounceOnHover />
      <AnimatedButton label="Warning" variant="warning" icon="⚠️" />
      <AnimatedButton label="Error" variant="error" icon="🛑" />
    </div>
  ),
};

export const ReducedMotionNote: Story = {
  render: () => (
    <div style={{ maxWidth: '300px', textAlign: 'center' }}>
      <p style={{ color: '#C2C3C7', fontSize: '12px', marginBottom: '16px' }}>
        Enable "Reduce motion" in your OS settings to see animations disabled.
      </p>
      <AnimatedButton label="Press Me" variant="primary" />
    </div>
  ),
};

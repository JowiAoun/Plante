import type { Meta, StoryObj } from '@storybook/react';
import { FarmCard } from './FarmCard';
import { mockFarms } from '@/mocks/data';
import '../../app/globals.css';

const meta: Meta<typeof FarmCard> = {
  title: 'Components/FarmCard',
  component: FarmCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A pixel-art styled card representing a farm unit on the dashboard.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    farm: {
      description: 'Farm data object',
      control: 'object',
    },
    selected: {
      description: 'Whether the card is selected',
      control: 'boolean',
    },
    onSelect: {
      description: 'Callback when card is clicked',
      action: 'selected',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Healthy farm
export const Healthy: Story = {
  args: {
    farm: mockFarms[0], // Tomato Paradise - healthy
    selected: false,
  },
};

// Warning status
export const Warning: Story = {
  args: {
    farm: mockFarms[1], // Herb Haven - warning
    selected: false,
  },
};

// Critical status
export const Critical: Story = {
  args: {
    farm: mockFarms[2], // Pepper Palace - critical
    selected: false,
  },
};

// Selected state
export const Selected: Story = {
  args: {
    farm: mockFarms[0],
    selected: true,
  },
};

// Multiple cards grid
export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      {mockFarms.map((farm) => (
        <FarmCard key={farm.id} farm={farm} />
      ))}
    </div>
  ),
};

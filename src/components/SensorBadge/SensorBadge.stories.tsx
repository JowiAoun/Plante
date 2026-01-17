import type { Meta, StoryObj } from '@storybook/react';
import { SensorBadge } from './SensorBadge';
import '../../index.css';

const meta: Meta<typeof SensorBadge> = {
  title: 'Components/SensorBadge',
  component: SensorBadge,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Temperature: Story = {
  args: {
    type: 'temp',
    value: 24,
    unit: '°C',
    trend: 'stable',
  },
};

export const Humidity: Story = {
  args: {
    type: 'humidity',
    value: 65,
    unit: '%',
    trend: 'up',
  },
};

export const SoilMoisture: Story = {
  args: {
    type: 'soil',
    value: 45,
    unit: '%',
    trend: 'down',
  },
};

export const WithLabel: Story = {
  args: {
    type: 'temp',
    value: 22,
    unit: '°C',
    trend: 'stable',
    showLabel: true,
  },
};

export const SmallSize: Story = {
  args: {
    type: 'humidity',
    value: 55,
    unit: '%',
    size: 'small',
  },
};

export const WarningStatus: Story = {
  args: {
    type: 'temp',
    value: 32,
    unit: '°C',
    trend: 'up',
  },
};

export const CriticalStatus: Story = {
  args: {
    type: 'soil',
    value: 15,
    unit: '%',
    trend: 'down',
  },
};

export const AllSensors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <SensorBadge type="temp" value={24} unit="°C" trend="stable" />
      <SensorBadge type="humidity" value={65} unit="%" trend="up" />
      <SensorBadge type="soil" value={45} unit="%" trend="down" />
      <SensorBadge type="light" value={850} unit="lux" trend="stable" />
      <SensorBadge type="water" value={80} unit="%" trend="stable" />
    </div>
  ),
};

export const StatusVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ color: '#C2C3C7', width: '60px' }}>Healthy:</span>
        <SensorBadge type="temp" value={24} unit="°C" />
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ color: '#C2C3C7', width: '60px' }}>Warning:</span>
        <SensorBadge type="temp" value={31} unit="°C" trend="up" />
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ color: '#C2C3C7', width: '60px' }}>Critical:</span>
        <SensorBadge type="temp" value={38} unit="°C" trend="up" />
      </div>
    </div>
  ),
};

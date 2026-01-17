import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell';
import { FarmCard } from '@/components/FarmCard';
import { mockUsers, mockNotifications, mockFarms } from '@/mocks/data';
import '@/app/globals.css';

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    user: mockUsers[0],
    notifications: mockNotifications,
    children: (
      <div>
        <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFF1E8', marginBottom: '16px' }}>
          Dashboard
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {mockFarms.map(farm => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      </div>
    ),
  },
};

export const LoggedOut: Story = {
  args: {
    user: null,
    notifications: [],
    children: (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '16px', color: '#FFEC27' }}>
          Welcome to Plante!
        </h2>
        <p style={{ color: '#C2C3C7', marginTop: '16px' }}>
          Login to start monitoring your plants.
        </p>
      </div>
    ),
  },
};

export const NightTheme: Story = {
  args: {
    user: mockUsers[0],
    notifications: mockNotifications,
    theme: 'night',
    children: <p style={{ color: '#FFF1E8' }}>Night theme content</p>,
  },
};

export const NeonTheme: Story = {
  args: {
    user: mockUsers[0],
    notifications: mockNotifications,
    theme: 'neon',
    children: <p style={{ color: '#FFF1E8' }}>Neon theme content</p>,
  },
};

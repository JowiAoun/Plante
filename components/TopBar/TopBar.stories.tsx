import type { Meta, StoryObj } from '@storybook/react';
import { TopBar } from './TopBar';
import { mockUsers, mockNotifications } from '@/mocks/data';
import '@/app/globals.css';

const meta: Meta<typeof TopBar> = {
  title: 'Layout/TopBar',
  component: TopBar,
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
  },
};

export const LoggedOut: Story = {
  args: {
    user: null,
    notifications: [],
  },
};

export const WithNotifications: Story = {
  args: {
    user: mockUsers[0],
    notifications: mockNotifications,
  },
};

export const NoNotifications: Story = {
  args: {
    user: mockUsers[0],
    notifications: [],
  },
};

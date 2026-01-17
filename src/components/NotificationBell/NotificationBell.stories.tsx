import type { Meta, StoryObj } from '@storybook/react';
import { NotificationBell } from './NotificationBell';
import { mockNotifications, storyStates } from '../../mocks/data';
import '../../index.css';

const meta: Meta<typeof NotificationBell> = {
  title: 'Components/NotificationBell',
  component: NotificationBell,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockNotifications,
  },
};

export const NoUnread: Story = {
  args: {
    items: mockNotifications.map(n => ({ ...n, read: true })),
  },
};

export const ManyNotifications: Story = {
  args: {
    items: storyStates.manyNotifications,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const WithActions: Story = {
  args: {
    items: mockNotifications,
    onMarkRead: (id) => console.log('Mark read:', id),
    onMarkAllRead: () => console.log('Mark all read'),
  },
};

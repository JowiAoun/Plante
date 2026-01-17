import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toast, ToastContainer } from './Toast';
import { ActionButton } from '@/components/ActionButton';
import '@/app/globals.css';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    message: 'This is an info message',
    variant: 'info',
    visible: true,
  },
};

export const Success: Story = {
  args: {
    message: 'Plant watered successfully!',
    variant: 'success',
    visible: true,
  },
};

export const Warning: Story = {
  args: {
    message: 'Humidity is getting low',
    variant: 'warning',
    visible: true,
  },
};

export const Error: Story = {
  args: {
    message: 'Failed to connect to sensor',
    variant: 'error',
    visible: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [toasts, setToasts] = useState<{ id: number; message: string; variant: 'success' | 'error' }[]>([]);
    let nextId = 0;

    const showToast = (variant: 'success' | 'error') => {
      const id = nextId++;
      setToasts(prev => [...prev, { 
        id, 
        message: variant === 'success' ? 'Action completed!' : 'Something went wrong',
        variant 
      }]);
    };

    const removeToast = (id: number) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
      <>
        <div style={{ display: 'flex', gap: '8px' }}>
          <ActionButton label="Show Success" variant="success" onClick={() => showToast('success')} />
          <ActionButton label="Show Error" variant="error" onClick={() => showToast('error')} />
        </div>
        <ToastContainer>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              variant={toast.variant}
              visible={true}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </ToastContainer>
      </>
    );
  },
};

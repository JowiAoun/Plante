import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PixelModal } from './PixelModal';
import { ActionButton } from '../ActionButton';
import '../../index.css';

const meta: Meta<typeof PixelModal> = {
  title: 'Components/PixelModal',
  component: PixelModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
const ModalDemo = ({ size = 'medium', title = 'Modal Title' }: { size?: 'small' | 'medium' | 'large', title?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <ActionButton label="Open Modal" onClick={() => setIsOpen(true)} />
      <PixelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        size={size}
      >
        <p>This is the modal content. Click outside or press Escape to close.</p>
        <div style={{ marginTop: '16px' }}>
          <ActionButton 
            label="Close" 
            variant="secondary" 
            onClick={() => setIsOpen(false)} 
          />
        </div>
      </PixelModal>
    </>
  );
};

export const Default: Story = {
  render: () => <ModalDemo />,
};

export const Small: Story = {
  render: () => <ModalDemo size="small" title="Small Modal" />,
};

export const Large: Story = {
  render: () => <ModalDemo size="large" title="Large Modal" />,
};

export const NoTitle: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <ActionButton label="Open Modal" onClick={() => setIsOpen(true)} />
        <PixelModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p>Modal without title</p>
        </PixelModal>
      </>
    );
  },
};

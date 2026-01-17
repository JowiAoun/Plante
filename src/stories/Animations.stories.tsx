import type { Meta, StoryObj } from '@storybook/react';
import { motion } from 'framer-motion';
import { 
  buttonPressVariants, 
  slideDownVariants, 
  modalPopVariants,
  staggerContainerVariants,
  staggerItemVariants,
  pulseVariants,
  glowVariants,
  pixelStepTiming,
} from '../utils/animations';
import '../../index.css';

/**
 * Animation Showcase
 * 
 * Demonstrates all available pixel-friendly animations.
 * All animations respect the `prefers-reduced-motion` media query.
 */
const meta: Meta = {
  title: 'Animations/Overview',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Pixel-friendly animation library using Framer Motion. All animations use integer scaling and steps() timing.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Box component for demos
const DemoBox = ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
  <div
    style={{
      width: '80px',
      height: '80px',
      backgroundColor: 'var(--color-surface)',
      border: '4px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-game)',
      fontSize: '10px',
      color: 'var(--color-text)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const ButtonPress: Story = {
  name: '1. Button Press (2-frame)',
  render: () => (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#C2C3C7', fontSize: '12px', marginBottom: '16px' }}>
        Click/tap to see 2-frame press animation
      </p>
      <motion.div
        variants={buttonPressVariants}
        initial="idle"
        whileTap="pressed"
        style={{ display: 'inline-block' }}
      >
        <DemoBox>PRESS</DemoBox>
      </motion.div>
    </div>
  ),
};

export const SlideDown: Story = {
  name: '2. Slide Down (dropdown)',
  render: () => (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#C2C3C7', fontSize: '12px', marginBottom: '16px' }}>
        Hover to show dropdown animation
      </p>
      <motion.div
        initial="hidden"
        whileHover="visible"
        style={{ position: 'relative' }}
      >
        <DemoBox>HOVER</DemoBox>
        <motion.div
          variants={slideDownVariants}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
          }}
        >
          <DemoBox style={{ width: '120px', height: '60px' }}>
            Dropdown
          </DemoBox>
        </motion.div>
      </motion.div>
    </div>
  ),
};

export const ModalPop: Story = {
  name: '3. Modal Pop (spring)',
  render: () => (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#C2C3C7', fontSize: '12px', marginBottom: '16px' }}>
        Click to toggle modal animation
      </p>
      <motion.div
        variants={modalPopVariants}
        initial="hidden"
        animate="visible"
        whileTap="hidden"
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <DemoBox style={{ width: '120px', height: '100px' }}>
          Modal
        </DemoBox>
      </motion.div>
    </div>
  ),
};

export const StaggeredList: Story = {
  name: '4. Staggered Items',
  render: () => (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', gap: '12px' }}
    >
      {[1, 2, 3, 4].map((i) => (
        <motion.div key={i} variants={staggerItemVariants}>
          <DemoBox style={{ width: '48px', height: '48px' }}>{i}</DemoBox>
        </motion.div>
      ))}
    </motion.div>
  ),
};

export const PulseAnimation: Story = {
  name: '5. Pulse (alerts)',
  render: () => (
    <motion.div
      variants={pulseVariants}
      initial="idle"
      animate="pulse"
    >
      <DemoBox style={{ borderColor: 'var(--color-critical)' }}>
        ALERT
      </DemoBox>
    </motion.div>
  ),
};

export const GlowEffect: Story = {
  name: '6. Glow (highlight)',
  render: () => (
    <motion.div
      variants={glowVariants}
      initial="idle"
      animate="glow"
    >
      <DemoBox style={{ borderColor: 'var(--color-accent)' }}>
        NEW!
      </DemoBox>
    </motion.div>
  ),
};

export const CSSStepsDemo: Story = {
  name: '7. CSS Steps Timing',
  render: () => (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#C2C3C7', fontSize: '12px', marginBottom: '16px' }}>
        CSS steps() for sprite-like animation
      </p>
      <div
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'var(--color-primary)',
          border: '4px solid var(--color-border)',
          animation: `rotate-steps 1s steps(8) infinite`,
        }}
      />
      <style>{`
        @keyframes rotate-steps {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: '#83769C', fontSize: '10px', marginTop: '12px' }}>
        {pixelStepTiming(8, 8)}
      </p>
    </div>
  ),
};

export const ReducedMotionDemo: Story = {
  name: '8. Reduced Motion',
  render: () => (
    <div style={{ maxWidth: '300px', textAlign: 'center' }}>
      <p style={{ color: '#C2C3C7', fontSize: '12px', marginBottom: '16px' }}>
        All animations respect the <code>prefers-reduced-motion</code> media query.
      </p>
      <p style={{ color: '#83769C', fontSize: '10px' }}>
        Enable "Reduce motion" in your OS accessibility settings to disable animations.
      </p>
    </div>
  ),
};

'use client'

/**
 * AnimatedButton Component
 * ActionButton with pixel-friendly press animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ActionButton } from '@/components/ActionButton';
import type { ActionButtonProps } from '@/components/ActionButton';
import { buttonPressVariants, buttonPressTransition } from '@/utils/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface AnimatedButtonProps extends ActionButtonProps {
  /** Enable bounce animation on hover */
  bounceOnHover?: boolean;
}

/**
 * AnimatedButton - ActionButton with 2-frame press animation
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  bounceOnHover = false,
  ...props
}) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <ActionButton {...props} />;
  }

  return (
    <motion.div
      variants={buttonPressVariants}
      initial="idle"
      whileTap="pressed"
      whileHover={bounceOnHover ? { y: -2 } : undefined}
      transition={buttonPressTransition}
      style={{ display: 'inline-block' }}
    >
      <ActionButton {...props} />
    </motion.div>
  );
};

export default AnimatedButton;

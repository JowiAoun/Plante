'use client';

/**
 * Register Page Component
 * Pixel-themed registration with Google OAuth
 */

import React from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import './Register.css';

/**
 * Register - New user registration page
 */
export const Register: React.FC = () => {
  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/profile-setup' });
  };

  return (
    <div className="register">
      <motion.div
        className="register__card nes-container is-dark"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo & Title */}
        <div className="register__logo">
          <img
            src="/logo.ico"
            alt="Plante Logo"
            style={{
              height: '48px',
              width: 'auto',
              imageRendering: 'pixelated'
            }}
          />
        </div>
        <h1 className="register__title">Join Plante</h1>
        <p className="register__subtitle">Start your farming adventure!</p>

        {/* Google Sign Up */}
        <button
          className="register__google-btn"
          onClick={handleGoogleSignUp}
          type="button"
        >
          <span className="register__google-icon">🔑</span>
          Sign up with Google
        </button>

        {/* Features */}
        <div className="register__features">
          <div className="register__feature">
            <span className="register__feature-icon">🏆</span>
            <span>Earn achievements and level up</span>
          </div>
          <div className="register__feature">
            <span className="register__feature-icon">📊</span>
            <span>Monitor your plants in real-time</span>
          </div>
          <div className="register__feature">
            <span className="register__feature-icon">🎮</span>
            <span>Compete on the leaderboard</span>
          </div>
        </div>

        {/* Footer Link */}
        <p className="register__footer">
          Already have an account?{' '}
          <Link href="/login" className="register__link">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;

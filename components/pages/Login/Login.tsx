'use client';

/**
 * Login Page Component
 * Pixel-themed login with Google OAuth
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import './Login.css';

/**
 * Login - Authentication page with Google sign-in
 */
export const Login: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.profileCompletedAt) {
        router.push('/dashboard');
      } else {
        router.push('/profile-setup');
      }
    }
  }, [session, status, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/profile-setup' });
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="login">
        <div className="login__loading">Loading...</div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (status === 'authenticated') {
    return (
      <div className="login">
        <div className="login__loading">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="login">
      <motion.div
        className="login__card nes-container is-dark"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo & Title */}
        <div className="login__logo">
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
        <h1 className="login__title">Plante</h1>
        <p className="login__subtitle">Welcome back, farmer!</p>

        {/* Google Sign In */}
        <button
          className="login__google-btn"
          onClick={handleGoogleSignIn}
          type="button"
        >
          <span className="login__google-icon">🔑</span>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="login__divider">
          <div className="login__divider-line" />
          <span className="login__divider-text">OR</span>
          <div className="login__divider-line" />
        </div>

        {/* Footer Link */}
        <p className="login__footer">
          New to Plante?{' '}
          <Link href="/register" className="login__link">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;


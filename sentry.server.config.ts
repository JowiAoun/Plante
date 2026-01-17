import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment tagging
  environment: process.env.SENTRY_ENVIRONMENT || 'development',

  // Disable Sentry if no DSN provided
  enabled: !!process.env.SENTRY_DSN,
});

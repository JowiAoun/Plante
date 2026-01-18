/**
 * Test Suite Setup
 * 
 * Configures test environment with concise output.
 * Verbose logging only on errors.
 */

import { config } from 'dotenv';
import { beforeAll, afterAll } from 'vitest';

// Load environment variables from .env file
config();

// Suppress console output for concise test runs
const originalConsole = { ...console };

beforeAll(() => {
  // Silence console during tests unless DEBUG=true
  if (process.env.DEBUG !== 'true') {
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    // Keep warn and error for important messages
  }
});

afterAll(() => {
  // Restore console
  Object.assign(console, originalConsole);
});

// Export helpers for tests
export const TEST_TIMEOUT = 10000; // 10 seconds for API calls
export const PI_TIMEOUT = 5000; // 5 seconds for Pi hardware

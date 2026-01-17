/**
 * MSW Browser Setup
 * Initialize Mock Service Worker for browser environment
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

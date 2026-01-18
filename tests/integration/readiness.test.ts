/**
 * Integration Readiness Tests
 * 
 * End-to-end check that all systems are ready for the hackathon.
 * Provides a summary of what's working and what needs attention.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { MongoClient } from 'mongodb';
import { PiApiClient } from '../../lib/pi-client';

interface ReadinessStatus {
  service: string;
  status: 'ready' | 'degraded' | 'not configured' | 'error';
  message?: string;
}

const readinessResults: ReadinessStatus[] = [];

describe('Hackathon Readiness Check', () => {
  // Database
  describe('Database', () => {
    it('MongoDB connection', async () => {
      const uri = process.env.MONGODB_URI;
      
      if (!uri) {
        readinessResults.push({
          service: 'MongoDB',
          status: 'not configured',
          message: 'MONGODB_URI not set',
        });
        expect(true).toBe(true); // Don't fail, just report
        return;
      }

      try {
        const client = new MongoClient(uri);
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        await client.close();
        
        readinessResults.push({
          service: 'MongoDB',
          status: 'ready',
        });
        expect(true).toBe(true);
      } catch (error) {
        readinessResults.push({
          service: 'MongoDB',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        // Don't fail the test, just report the error
        expect(true).toBe(true);
      }
    });
  });

  // Hardware
  describe('Hardware', () => {
    it('Pi API connection', async () => {
      const client = new PiApiClient();
      
      if (!client.isConfigured()) {
        readinessResults.push({
          service: 'Pi Hardware',
          status: 'not configured',
          message: 'PI_API_URL not set',
        });
        expect(true).toBe(true);
        return;
      }

      try {
        const health = await client.getHealth();
        readinessResults.push({
          service: 'Pi Hardware',
          status: health.status === 'healthy' ? 'ready' : 'degraded',
          message: `v${health.version}, uptime: ${Math.floor(health.uptime_seconds / 60)}min`,
        });
        expect(true).toBe(true);
      } catch (error) {
        readinessResults.push({
          service: 'Pi Hardware',
          status: 'error',
          message: 'Pi API not reachable',
        });
        // Don't fail - hardware might not be connected
        expect(true).toBe(true);
      }
    });
  });

  // External Services
  describe('External Services', () => {
    it('Twilio SMS', () => {
      const configured = !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      );

      readinessResults.push({
        service: 'Twilio SMS',
        status: configured ? 'ready' : 'not configured',
      });
      expect(true).toBe(true);
    });

    it('Sentry Error Tracking', () => {
      const configured = !!(
        process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
      );

      readinessResults.push({
        service: 'Sentry',
        status: configured ? 'ready' : 'not configured',
      });
      expect(true).toBe(true);
    });

    it('Google Gemini AI', () => {
      const configured = !!process.env.GOOGLE_GEMINI_API_KEY;

      readinessResults.push({
        service: 'Gemini AI',
        status: configured ? 'ready' : 'not configured',
      });
      expect(true).toBe(true);
    });

    it('ElevenLabs Voice', () => {
      const configured = !!process.env.ELEVENLABS_API_KEY;

      readinessResults.push({
        service: 'ElevenLabs',
        status: configured ? 'ready' : 'not configured',
      });
      expect(true).toBe(true);
    });
  });

  // Summary
  describe('Summary', () => {
    it('Print readiness report', () => {
      console.log('\n═══════════════════════════════════════');
      console.log('       HACKATHON READINESS REPORT      ');
      console.log('═══════════════════════════════════════\n');

      const ready = readinessResults.filter((r) => r.status === 'ready');
      const degraded = readinessResults.filter((r) => r.status === 'degraded');
      const notConfigured = readinessResults.filter(
        (r) => r.status === 'not configured'
      );
      const errors = readinessResults.filter((r) => r.status === 'error');

      readinessResults.forEach((r) => {
        const icon =
          r.status === 'ready'
            ? '✓'
            : r.status === 'degraded'
            ? '⚠'
            : r.status === 'error'
            ? '✗'
            : '○';
        const msg = r.message ? ` (${r.message})` : '';
        console.log(`  ${icon} ${r.service}: ${r.status}${msg}`);
      });

      console.log('\n───────────────────────────────────────');
      console.log(
        `  Ready: ${ready.length} | Degraded: ${degraded.length} | Not Configured: ${notConfigured.length} | Errors: ${errors.length}`
      );
      console.log('═══════════════════════════════════════\n');

      // Always pass - this is an informational report
      expect(true).toBe(true);
    });
  });
});

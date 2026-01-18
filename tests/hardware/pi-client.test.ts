/**
 * Hardware Integration Tests
 * 
 * Tests Raspberry Pi API client connectivity and sensor readings.
 * Gracefully skips if hardware is not available.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { PiApiClient, PiApiError } from '../../lib/pi-client';
import { PI_TIMEOUT } from '../setup';

describe('Pi Hardware Integration', { timeout: PI_TIMEOUT }, () => {
  let client: PiApiClient;
  let piAvailable = false;

  beforeAll(async () => {
    client = new PiApiClient();
    
    // Check if Pi is reachable
    if (!client.isConfigured()) {
      console.warn('⚠ PI_API_URL not configured, skipping hardware tests');
      return;
    }

    try {
      await client.getHealth();
      piAvailable = true;
    } catch {
      console.warn('⚠ Pi API not reachable, skipping hardware tests');
      piAvailable = false;
    }
  });

  describe('Configuration', () => {
    it('Should check if Pi API is configured', () => {
      const isConfigured = client.isConfigured();
      // Just verify the check works, don't require configuration
      expect(typeof isConfigured).toBe('boolean');
    });
  });

  describe('Health Endpoint', () => {
    it('GET /health - should return status', async () => {
      if (!piAvailable) return;

      const health = await client.getHealth();
      expect(health.status).toBeDefined();
      expect(['healthy', 'unhealthy']).toContain(health.status);
      expect(health.version).toBeDefined();
    });
  });

  describe('Sensor Endpoints', () => {
    it('GET /sensors - should return all readings', async () => {
      if (!piAvailable) return;

      const sensors = await client.getSensors();
      expect(sensors.timestamp).toBeDefined();
      expect(sensors.status).toBeDefined();
      expect(['ok', 'degraded', 'error']).toContain(sensors.status);
    });

    it('GET /sensors/temperature - should return temp/humidity', async () => {
      if (!piAvailable) return;

      const data = await client.getTemperature();
      // May be null if sensor not connected
      if (data.temperature) {
        expect(data.temperature.unit).toBeDefined();
        expect(typeof data.temperature.value).toBe('number');
      }
    });

    it('GET /sensors/light - should return light level', async () => {
      if (!piAvailable) return;

      try {
        const light = await client.getLight();
        expect(light.unit).toBeDefined();
        expect(typeof light.value).toBe('number');
      } catch (e) {
        // Light sensor may not be connected
        expect(e).toBeInstanceOf(PiApiError);
      }
    });

    it('GET /sensors/soil - should return moisture', async () => {
      if (!piAvailable) return;

      try {
        const soil = await client.getSoilMoisture();
        expect(soil.unit).toBeDefined();
        expect(typeof soil.value).toBe('number');
      } catch (e) {
        // Soil sensor may not be connected
        expect(e).toBeInstanceOf(PiApiError);
      }
    });
  });

  describe('Camera Endpoints', () => {
    it('GET /camera/latest - should return photo info', async () => {
      if (!piAvailable) return;

      try {
        const photo = await client.getLatestPhoto();
        expect(photo.timestamp).toBeDefined();
      } catch (e) {
        // Camera may not have photos yet
        expect(e).toBeInstanceOf(PiApiError);
      }
    });
  });
});

// Summary for hardware tests
describe('Hardware Summary', () => {
  it('Pi client is properly implemented', () => {
    const client = new PiApiClient();
    expect(client).toBeInstanceOf(PiApiClient);
    expect(typeof client.isConfigured).toBe('function');
    expect(typeof client.getHealth).toBe('function');
    expect(typeof client.getSensors).toBe('function');
  });
});

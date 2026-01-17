/**
 * Raspberry Pi Sensor API Client
 * 
 * Client for communicating with the Pi FastAPI server
 */

interface PiSensorReading {
  value: number;
  unit: string;
}

interface PiLightReading extends PiSensorReading {
  description?: string;
}

interface PiSensorResponse {
  timestamp: string;
  temperature: PiSensorReading | null;
  humidity: PiSensorReading | null;
  light: PiLightReading | null;
  soil_moisture: PiSensorReading | null;
  status: 'ok' | 'degraded' | 'error';
  errors: Array<{ sensor: string; error: string }>;
}

interface PiHealthResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  uptime_seconds: number;
  sensors_available: string[];
}

interface PiPhotoResponse {
  success: boolean;
  filepath?: string;
  filename?: string;
  timestamp: string;
  error?: string;
}

export class PiApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'PiApiError';
  }
}

/**
 * Raspberry Pi API Client
 */
export class PiApiClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(options?: {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
  }) {
    this.baseUrl = options?.baseUrl || process.env.PI_API_URL || '';
    this.apiKey = options?.apiKey || process.env.PI_API_KEY || '';
    this.timeout = options?.timeout || 10000; // 10 seconds default
  }

  /**
   * Check if the Pi API is configured
   */
  isConfigured(): boolean {
    return Boolean(this.baseUrl);
  }

  /**
   * Make a request to the Pi API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new PiApiError('Pi API URL not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new PiApiError(
          `Pi API error: ${response.status} ${response.statusText} - ${errorBody}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof PiApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new PiApiError('Pi API request timed out', undefined, error);
      }

      throw new PiApiError(
        `Failed to connect to Pi API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error
      );
    }
  }

  /**
   * Check Pi API health
   */
  async getHealth(): Promise<PiHealthResponse> {
    return this.request<PiHealthResponse>('/health');
  }

  /**
   * Get all sensor readings
   */
  async getSensors(useCache = true): Promise<PiSensorResponse> {
    const query = useCache ? '' : '?use_cache=false';
    return this.request<PiSensorResponse>(`/sensors${query}`);
  }

  /**
   * Get temperature and humidity readings
   */
  async getTemperature(): Promise<{
    temperature: PiSensorReading | null;
    humidity: PiSensorReading | null;
  }> {
    return this.request('/sensors/temperature');
  }

  /**
   * Get light sensor reading
   */
  async getLight(): Promise<PiLightReading> {
    return this.request<PiLightReading>('/sensors/light');
  }

  /**
   * Get soil moisture reading
   */
  async getSoilMoisture(): Promise<PiSensorReading> {
    return this.request<PiSensorReading>('/sensors/soil');
  }

  /**
   * Capture a photo
   */
  async capturePhoto(filename?: string): Promise<PiPhotoResponse> {
    const query = filename ? `?filename=${encodeURIComponent(filename)}` : '';
    return this.request<PiPhotoResponse>(`/camera/capture${query}`);
  }

  /**
   * Get latest photo metadata
   */
  async getLatestPhoto(): Promise<PiPhotoResponse> {
    return this.request<PiPhotoResponse>('/camera/latest');
  }
}

// Singleton instance
let piClient: PiApiClient | null = null;

/**
 * Get or create the Pi API client singleton
 */
export function getPiClient(): PiApiClient {
  if (!piClient) {
    piClient = new PiApiClient();
  }
  return piClient;
}

/**
 * Types exported for use in other modules
 */
export type {
  PiSensorReading,
  PiLightReading,
  PiSensorResponse,
  PiHealthResponse,
  PiPhotoResponse,
};

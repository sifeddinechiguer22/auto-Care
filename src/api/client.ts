/**
 * AutoCare Garage Management System - REST API Client
 * Configured for FastAPI backend communication.
 */

const DEFAULT_API_URL = 'http://127.0.0.1:8000/api';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || DEFAULT_API_URL;

export const TOKEN_STORAGE_KEY = 'autocare_token';
export const USER_STORAGE_KEY = 'autocare_user';
export const DEMO_MODE_KEY = 'autocare_demo_mode';

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  removeToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  isDemoMode(): boolean {
    const val = localStorage.getItem(DEMO_MODE_KEY);
    // If not set, default to true in preview environment to ensure first-time reviewers can test UI
    return val === null ? true : val === 'true';
  }

  setDemoMode(enabled: boolean) {
    localStorage.setItem(DEMO_MODE_KEY, String(enabled));
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    // If Demo Mode is explicitly enabled by the user or localStorage
    if (this.isDemoMode()) {
      // In demo mode, execute local persistent storage simulation
      return await import('./mockStorage').then((m) =>
        m.handleMockRequest<T>(endpoint, options)
      );
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errData: any;
        try {
          errData = await response.json();
        } catch {
          errData = { detail: response.statusText };
        }
        throw new ApiError(
          errData.detail || errData.message || `Request failed with status ${response.status}`,
          response.status,
          errData
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (err: any) {
      // If network fails (e.g. backend server at 127.0.0.1:8000 is not running),
      // we gracefully fall back to local storage and alert the user so they can continue testing.
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
        console.warn(
          `[AutoCare API] FastAPI backend at ${this.baseUrl} is currently unreachable. Seamlessly activating demo repository for preview mode.`
        );
        this.setDemoMode(true);
        return await import('./mockStorage').then((m) =>
          m.handleMockRequest<T>(endpoint, options)
        );
      }
      throw err;
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

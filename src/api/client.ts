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
    return false;
  }

  setDemoMode(enabled: boolean) {
    if (enabled) {
      localStorage.setItem(DEMO_MODE_KEY, 'false');
    } else {
      localStorage.setItem(DEMO_MODE_KEY, 'false');
    }
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
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
        throw new ApiError(
          `Impossible de joindre le backend AutoCare sur ${this.baseUrl}. Vérifiez que le serveur FastAPI est lancé.`,
          503,
          { detail: err.message }
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

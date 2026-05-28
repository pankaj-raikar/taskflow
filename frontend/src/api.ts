import { Task, User } from './types';

export type AuthMode = 'signin' | 'signup';

export interface AuthCredentials {
  mode: AuthMode;
  name?: string;
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export type TaskPayload = Omit<Task, 'id' | 'dateLabel'>;
export type TaskPatch = Partial<TaskPayload>;

type FetchLike = typeof fetch;

const SESSION_STORAGE_KEY = 'taskflow_auth_session';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function loadSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export class ApiClient {
  constructor(
    private readonly baseUrl = API_BASE_URL,
    private readonly token: string | null = null,
    private readonly fetcher: FetchLike = globalThis.fetch.bind(globalThis)
  ) {}

  async register(input: { name: string; email: string; password: string }) {
    return this.request<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async login(input: { email: string; password: string }) {
    return this.request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async getCurrentUser() {
    const response = await this.request<{ data: User }>('/users/me');
    return response.data;
  }

  async listTasks() {
    const response = await this.request<{ data: Task[] }>('/tasks');
    return response.data;
  }

  async createTask(input: TaskPayload) {
    const response = await this.request<{ data: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    return response.data;
  }

  async updateTask(id: string, input: TaskPatch) {
    const response = await this.request<{ data: Task }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
    return response.data;
  }

  async deleteTask(id: string) {
    const response = await this.request<{ data: Task }>(`/tasks/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined)
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      headers
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(payload.error ?? 'Request failed', response.status);
    }

    return payload as T;
  }
}

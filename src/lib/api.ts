const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  [key: string]: T | boolean | string | undefined;
}

interface AuthCodeResponse extends ApiResponse {
  userId?: string;
  expiresAt?: string;
}

interface LoginResponse extends ApiResponse {
  token?: string;
  userId?: string;
  user?: UserData;
  expiresAt?: string;
  attemptsRemaining?: number;
}

interface VerifyResponse extends ApiResponse {
  valid?: boolean;
  userId?: string;
  user?: UserData;
  expiresAt?: string;
}

export interface UserData {
  xp: number;
  level: number;
  prestige: number;
  prestigeAvailable: number;
  totalMessages: number;
  lastMessageTime: string;
  badges: string[];
  lastPrestigeLevel: number;
  levelHistory: unknown[];
  dailyBonusMultiplier: number;
  dailyBonusExpiry: string | null;
  allowMentions: boolean;
  pushName: string | null;
  customName: string | null;
  customNameEnabled: boolean;
  jid: string;
}

export interface UserResponse extends ApiResponse {
  userId?: string;
  user?: UserData;
}

export interface DailyBonusResponse extends ApiResponse {
  dailyBonus?: unknown;
}

export interface MentionsData {
  [key: string]: boolean;
}

export interface MentionsResponse extends ApiResponse {
  mentions?: MentionsData;
}

export interface HealthResponse extends ApiResponse {
  status?: string;
  timestamp?: string;
  uptime?: number;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }
  
  return data;
}

export const api = {
  auth: {
    getCode: (number: string) => 
      fetchApi<AuthCodeResponse>('/api/auth/getCode', {
        method: 'POST',
        body: JSON.stringify({ number }),
      }),

    login: (number: string, code: string) =>
      fetchApi<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ number, code }),
      }),

    verify: (token: string) =>
      fetchApi<VerifyResponse>('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),

    logout: (token: string) =>
      fetchApi<ApiResponse>('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },

  users: {
    get: (id: string) => 
      fetchApi<UserResponse>(`/api/users/${encodeURIComponent(id)}`),

    update: (id: string, data: Partial<UserData>) =>
      fetchApi<UserResponse>(`/api/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  dailyBonus: {
    get: () => fetchApi<DailyBonusResponse>('/api/daily-bonus'),
  },

  mentions: {
    get: () => fetchApi<MentionsResponse>('/api/mentions'),
    update: (data: MentionsData) =>
      fetchApi<MentionsResponse>('/api/mentions', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  health: {
    check: () => fetchApi<HealthResponse>('/api/health'),
  },
};

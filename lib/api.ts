const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  id?: string;
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
  progressXP?: number;
  nextLevelXP?: number;
  neededXP?: number;
  progressPercent?: number;
  emojiReaction?: boolean;
  emoji?: string | null;
}

export interface UserResponse extends ApiResponse {
  userId?: string;
  user?: UserData;
}

export interface UsersListResponse extends ApiResponse {
  count?: number;
  users?: UserData[];
}

export interface DailyBonusData {
  lastBonusDate: string;
  lastBonusUser: string;
}

export interface DailyBonusResponse extends ApiResponse {
  dailyBonus?: DailyBonusData;
}

export interface MentionsData {
  globalEnabled?: boolean;
  [key: string]: boolean | undefined;
}

export interface MentionsResponse extends ApiResponse {
  mentions?: MentionsData;
}

export interface HealthResponse extends ApiResponse {
  status?: string;
  timestamp?: string;
  uptime?: number;
}

export interface AdminData {
  number: string;
  fullId: string;
}

export interface AdminsResponse extends ApiResponse {
  count?: number;
  admins?: AdminData[];
}

export interface BackupUser {
  id: string;
  data: UserData;
  deletedAt: string;
  expiresAt: string;
}

export interface BackupsResponse extends ApiResponse {
  count?: number;
  backups?: BackupUser[];
}

export interface ParticipanteDetalhado {
  id: string;
  nome: string;
  presente: string | null;
}

export interface AmigoSorteado {
  id: string;
  nome: string;
  presente: string | null;
}

export interface AmigoSecretoGroup {
  groupId: string;
  groupName: string;
  participantes: ParticipanteDetalhado[];
  totalParticipantes: number;
  userIdInGroup?: string;
  meuNome?: string;
  meuPresente?: string | null;
  sorteioRealizado: boolean;
  sorteioData?: string | null;
  amigoSorteado?: AmigoSorteado | null;
}

export interface AmigoSecretoResponse extends ApiResponse {
  count?: number;
  groups?: AmigoSecretoGroup[];
  searchedIds?: string[];
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
    list: () => fetchApi<UsersListResponse>('/api/users'),
    
    get: (id: string) => 
      fetchApi<UserResponse>(`/api/users/${encodeURIComponent(id)}`),

    create: (id: string, data?: Partial<UserData>) =>
      fetchApi<UserResponse>('/api/users', {
        method: 'POST',
        body: JSON.stringify({ id, ...data }),
      }),

    update: (id: string, data: Partial<UserData>) =>
      fetchApi<UserResponse>(`/api/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    replace: (id: string, data: UserData) =>
      fetchApi<UserResponse>(`/api/users/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<ApiResponse & { deletedUser?: UserData; backupExpiresAt?: string }>(`/api/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
  },

  backup: {
    list: () => fetchApi<BackupsResponse>('/api/backup/users'),
    
    restore: (id: string) =>
      fetchApi<UserResponse>(`/api/backup/restore/${encodeURIComponent(id)}`, {
        method: 'POST',
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

  admins: {
    list: () => fetchApi<AdminsResponse>('/api/admins'),
  },

  amigoSecreto: {
    list: () => fetchApi<AmigoSecretoResponse>('/api/amigo-secreto'),
    
    getByUser: (id: string) =>
      fetchApi<AmigoSecretoResponse>(`/api/amigo-secreto/user/${encodeURIComponent(id)}`),
  },

  health: {
    check: () => fetchApi<HealthResponse>('/api/health'),
  },
};

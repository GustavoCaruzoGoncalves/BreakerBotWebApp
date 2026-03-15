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

export interface AuraRankEntry {
  userId: string;
  auraPoints: number;
  tierName: string;
  displayName: string;
  character?: string | null;
}

export interface AuraTier {
  minPoints: number;
  name: string;
}

export interface AuraRankingResponse extends ApiResponse {
  limit?: number;
  ranking?: AuraRankEntry[];
  tiers?: AuraTier[];
}

export interface AuraDailyMissions {
  lastResetDate: string | null;
  drawnMissions: string[];
  completedMissionIds: string[];
  progress: {
    messages: number;
    reactions: number;
    duelWin: number;
    surviveAttack: number;
    media: number;
    helpSomeone: number;
  };
}

export interface AuraUserData {
  auraPoints: number;
  stickerHash: string | null;
  stickerDataUrl: string | null;
  character: string | null;
  hasStickerHash: boolean;
  dailyMissions: AuraDailyMissions | null;
  lastRitualDate: string | null;
  lastTreinarAt: number | null;
  lastDominarAt: number | null;
  tierName: string;
  tierMinPoints: number;
}

export interface AuraUserResponse extends ApiResponse {
  userId?: string;
  displayName?: string;
  aura?: AuraUserData;
  praisedBy?: string[];
  profile?: {
    pushName: string | null;
    customName: string | null;
    customNameEnabled: boolean;
  };
}

export interface AuraTiersResponse extends ApiResponse {
  tiers?: AuraTier[];
}

export interface AuraSlotReelSymbol {
  id: string;
  emoji: string;
}

export interface AuraSlotResponse extends ApiResponse {
  reels?: AuraSlotReelSymbol[][];
  bet?: number;
  win?: number;
  netChange?: number;
  balance?: number;
}

export interface AuraConfigResponse extends ApiResponse {
  tiers?: AuraTier[];
  missionIds?: string[];
  missionConfig?: Record<string, { target: number; reward: number; label: string }>;
  randomEvents?: unknown[];
  eventSpawnChance?: number;
  eventCooldownMs?: number;
  mogDurationMs?: number;
  mognowCountdownSec?: number;
  mognowWindowMs?: number;
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
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const text = await response.text();
  let data: Record<string, unknown>;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Resposta inválida da API: ${text.slice(0, 100)}`);
  }

  if (!response.ok) {
    throw new Error((data.message as string) || `Erro ${response.status}: ${response.statusText}`);
  }

  return data as T;
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

  adminUsers: {
    export: (userId: string) =>
      fetch(`${API_BASE_URL}/api/admin/users/export`, {
        headers: { 'X-User-Id': userId },
      }),

    import: (data: Record<string, unknown>, userId: string) =>
      fetchApi<ApiResponse & { imported?: number }>('/api/admin/users/import', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      } as RequestInit),
  },

  amigoSecreto: {
    list: () => fetchApi<AmigoSecretoResponse>('/api/amigo-secreto'),
    
    getByUser: (id: string) =>
      fetchApi<AmigoSecretoResponse>(`/api/amigo-secreto/user/${encodeURIComponent(id)}`),
    
    updatePresente: (groupId: string, odI: string, presente: string) =>
      fetchApi<ApiResponse & { odI?: string; presente?: string | null }>(`/api/amigo-secreto/${encodeURIComponent(groupId)}/presente`, {
        method: 'PATCH',
        body: JSON.stringify({ odI, presente }),
      }),
  },

  health: {
    check: () => fetchApi<HealthResponse>('/api/health'),
  },

  aura: {
    ranking: (limit = 10) =>
      fetchApi<AuraRankingResponse>(`/api/aura/ranking?limit=${limit}`),

    getUser: (id: string) =>
      fetchApi<AuraUserResponse>(`/api/aura/users/${encodeURIComponent(id)}`),

    tiers: () =>
      fetchApi<AuraTiersResponse>('/api/aura/tiers'),

    config: () =>
      fetchApi<AuraConfigResponse>('/api/aura/config'),

    slot: (token: string, bet: number) =>
      fetchApi<AuraSlotResponse>('/api/aura/slot', {
        method: 'POST',
        body: JSON.stringify({ token, bet }),
      }),

    gameReward: (token: string, game: string, score: number) =>
      fetchApi<{ success: boolean; reward?: number; balance?: number }>('/api/aura/game-reward', {
        method: 'POST',
        body: JSON.stringify({ token, game, score }),
      }),
  },
};

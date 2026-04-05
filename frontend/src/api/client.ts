const TOKEN_KEY = 'finance_token';

/** Production / preview: set in Vercel to your Render API origin, e.g. https://your-api.onrender.com (no trailing slash) */
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}

export type Role = 'viewer' | 'analyst' | 'admin';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: string;
};

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const t = getToken();
  if (t) headers.set('Authorization', `Bearer ${t}`);

  const res = await fetch(apiUrl(path), { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data as T;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  register: (body: { email: string; password: string; name: string }) =>
    api<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export type Summary = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recordCount: number;
  categoryBreakdown: { category: string; type: string; total: number }[];
  recentActivity: {
    id: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    notes?: string;
    createdBy: { name: string; email: string } | null;
  }[];
};

export type Trends = {
  period: string;
  points: { label: string; income: number; expense: number; net: number }[];
};

export type RecordRow = {
  id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  notes?: string;
  createdBy?: { id: string; name: string; email: string };
};

export const dashboardApi = {
  summary: () => api<Summary>('/api/dashboard/summary'),
  trends: (period: 'weekly' | 'monthly') =>
    api<Trends>(`/api/dashboard/trends?period=${period}`),
};

export const recordsApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.set(k, String(v));
    });
    return api<{ data: RecordRow[]; pagination: { page: number; total: number; pages: number } }>(
      `/api/records?${q.toString()}`
    );
  },
  create: (body: {
    amount: number;
    type: string;
    category: string;
    date: string;
    notes?: string;
  }) =>
    api<RecordRow>('/api/records', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<RecordRow>) =>
    api<RecordRow>(`/api/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api<void>(`/api/records/${id}`, { method: 'DELETE' }),
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: string;
  createdAt?: string;
};

export const usersApi = {
  list: (page = 1, search = '') =>
    api<{ data: AdminUser[]; pagination: { page: number; total: number; pages: number } }>(
      `/api/users?page=${page}&search=${encodeURIComponent(search)}`
    ),
  create: (body: {
    email: string;
    password: string;
    name: string;
    role?: Role;
    status?: string;
  }) =>
    api<AdminUser>('/api/users', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<{ name: string; role: Role; status: string; password: string }>) =>
    api<AdminUser>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) => api<void>(`/api/users/${id}`, { method: 'DELETE' }),
};

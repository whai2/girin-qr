const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

export interface Permissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface AuthResponse {
  token: string;
  role: string;
  permissions: Permissions;
}

export interface MeResponse {
  role: string;
  permissions: Permissions;
}

export async function login(id: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '로그인에 실패했습니다.');
  }
  return res.json();
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('인증이 만료되었습니다.');
  return res.json();
}

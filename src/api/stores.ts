import { getAuthToken } from '../contexts/AuthContext';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra };
}

export interface Store {
  _id: string;
  slug: string;
  name: string;
}

// 장소 목록 조회
export async function fetchStores(): Promise<Store[]> {
  const res = await fetch(`${API_BASE}/stores`, { headers: authHeaders() });
  return res.json();
}

// 장소 추가
export async function createStore(data: { slug: string; name: string }): Promise<Store> {
  const res = await fetch(`${API_BASE}/stores`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  return res.json();
}

// 장소 수정
export async function updateStore(id: string, data: Partial<{ slug: string; name: string }>): Promise<Store> {
  const res = await fetch(`${API_BASE}/stores/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  return res.json();
}

// 장소 삭제
export async function deleteStore(id: string): Promise<void> {
  await fetch(`${API_BASE}/stores/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

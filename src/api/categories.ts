import { getAuthToken } from '../contexts/AuthContext';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra };
}

export interface Category {
  _id: string;
  name: string;
  order: number;
}

// 카테고리 목록 조회
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, { headers: authHeaders() });
  if (!res.ok) throw new Error('카테고리 조회 실패');
  return res.json();
}

// 카테고리 생성
export async function createCategory(data: { name: string; order?: number }): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('카테고리 생성 실패');
  return res.json();
}

// 카테고리 수정
export async function updateCategory(id: string, data: { name?: string; order?: number }): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('카테고리 수정 실패');
  return res.json();
}

// 카테고리 삭제
export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('카테고리 삭제 실패');
}

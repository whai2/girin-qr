import { getAuthToken } from '../contexts/AuthContext';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra };
}

// 상품 기본 정보 (서버 DB)
export interface Product {
  _id: string;
  name: string;
  number: number;
  category: number;
  image: string;
  price: number;
  smartStoreUrl?: string;
}

// 장소별 상품 정보 (기본 정보 + 장소별 설정 merge)
export interface StoreProduct extends Product {
  soldOut: boolean;
  soldOutSizes: string[];
  ageGroup: ('kids' | 'adult')[];
}

// ── Products (상품 기본 정보) ──

// 전체 상품 조회
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`, { headers: authHeaders() });
  return res.json();
}

// 상품 등록 (이미지 포함)
export async function createProduct(data: {
  name: string;
  number: number;
  category: number;
  price: number;
  image?: File;
  smartStoreUrl?: string;
}): Promise<Product> {
  const form = new FormData();
  form.append('name', data.name);
  form.append('number', String(data.number));
  form.append('category', String(data.category));
  form.append('price', String(data.price));
  if (data.image) form.append('image', data.image);
  if (data.smartStoreUrl) form.append('smartStoreUrl', data.smartStoreUrl);

  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  return res.json();
}

// 상품 수정 (이미지 포함 가능)
export async function updateProduct(
  id: string,
  data: {
    name?: string;
    number?: number;
    category?: number;
    price?: number;
    image?: File;
    smartStoreUrl?: string;
  },
): Promise<Product> {
  const form = new FormData();
  if (data.name !== undefined) form.append('name', data.name);
  if (data.number !== undefined) form.append('number', String(data.number));
  if (data.category !== undefined) form.append('category', String(data.category));
  if (data.price !== undefined) form.append('price', String(data.price));
  if (data.image) form.append('image', data.image);
  if (data.smartStoreUrl !== undefined) form.append('smartStoreUrl', data.smartStoreUrl);

  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: form,
  });
  return res.json();
}

// 상품 삭제
export async function deleteProduct(id: string): Promise<void> {
  await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

// ── Stores (팝업 스토어) ──

export interface Store {
  _id: string;
  slug: string;
  name: string;
}

// 팝업 스토어 목록 조회
export async function fetchStores(): Promise<Store[]> {
  const res = await fetch(`${API_BASE}/stores`, { headers: authHeaders() });
  return res.json();
}

// 팝업 스토어 등록
export async function createStore(data: { slug: string; name: string }): Promise<Store> {
  const res = await fetch(`${API_BASE}/stores`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  return res.json();
}

// 팝업 스토어 삭제
export async function deleteStore(id: string): Promise<void> {
  await fetch(`${API_BASE}/stores/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

// ── Store Products (장소별 상품 설정) ──

// 장소별 상품 목록 조회
export async function fetchStoreProducts(storeId: string): Promise<StoreProduct[]> {
  const res = await fetch(`${API_BASE}/stores/${storeId}/products`, { headers: authHeaders() });
  return res.json();
}

// 장소별 상품 설정 수정
export async function updateStoreProduct(
  storeId: string,
  productId: string,
  data: Partial<Pick<StoreProduct, 'soldOut' | 'soldOutSizes' | 'ageGroup'>>,
): Promise<StoreProduct> {
  const res = await fetch(`${API_BASE}/stores/${storeId}/products/${productId}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  return res.json();
}

// 장소별 품절 토글
export async function toggleStoreProductSoldOut(storeId: string, productId: string): Promise<StoreProduct> {
  const res = await fetch(`${API_BASE}/stores/${storeId}/products/${productId}/toggle-soldout`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return res.json();
}

// 장소별 사이즈 품절 토글
export async function toggleStoreProductSizeSoldOut(storeId: string, productId: string, size: string): Promise<StoreProduct> {
  const res = await fetch(`${API_BASE}/stores/${storeId}/products/${productId}/toggle-size`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ size }),
  });
  return res.json();
}

// 장소별 연령 그룹 토글
export async function toggleStoreProductAge(storeId: string, productId: string, age: 'kids' | 'adult'): Promise<StoreProduct> {
  const res = await fetch(`${API_BASE}/stores/${storeId}/products/${productId}/toggle-age`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ age }),
  });
  return res.json();
}

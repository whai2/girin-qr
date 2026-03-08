const API_BASE = '/api';

export interface Product {
  _id: string;
  name: string;
  number: number;
  category: number;
  image: string;
  price: number;
  soldOut: boolean;
  soldOutSizes: string[];
}

// 전체 상품 조회
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}

// 상품 등록 (이미지 포함)
export async function createProduct(data: {
  name: string;
  number: number;
  category: number;
  price: number;
  image?: File;
}): Promise<Product> {
  const form = new FormData();
  form.append('name', data.name);
  form.append('number', String(data.number));
  form.append('category', String(data.category));
  form.append('price', String(data.price));
  if (data.image) form.append('image', data.image);

  const res = await fetch(`${API_BASE}/products`, { method: 'POST', body: form });
  return res.json();
}

// 상품 삭제
export async function deleteProduct(id: string): Promise<void> {
  await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
}

// 판매 상태 토글
export async function toggleSoldOut(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}/toggle-soldout`, { method: 'PATCH' });
  return res.json();
}

// 사이즈별 품절 토글
export async function toggleSizeSoldOut(id: string, size: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}/toggle-size`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size }),
  });
  return res.json();
}

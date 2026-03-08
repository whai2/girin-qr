import { useState, useCallback, useEffect } from 'react';
import {
  fetchProducts,
  toggleSoldOut as apiToggleSoldOut,
  toggleSizeSoldOut as apiToggleSizeSoldOut,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  type Product,
} from '../api/products';
import { products as defaultProducts } from '../data/products';

export type { Product };

// localStorage 캐시 키
const CACHE_KEY = 'girin_product_state';

function loadCache(): Record<string, { soldOut: boolean; soldOutSizes: string[] }> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(products: Product[]) {
  const cache: Record<string, { soldOut: boolean; soldOutSizes: string[] }> = {};
  for (const p of products) {
    if (p.soldOut || (p.soldOutSizes && p.soldOutSizes.length > 0)) {
      cache[p._id] = { soldOut: p.soldOut, soldOutSizes: p.soldOutSizes || [] };
    }
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// API 실패 시 기존 하드코딩 데이터를 fallback으로 사용
function toApiProduct(p: { id: number; name: string; number: number; category: number; image: string; price: number }): Product {
  const cache = loadCache();
  const cached = cache[String(p.id)];
  return {
    _id: String(p.id), name: p.name, number: p.number, category: p.category,
    image: p.image, price: p.price,
    soldOut: cached?.soldOut ?? false,
    soldOutSizes: cached?.soldOutSizes ?? [],
  };
}

export const ALL_SIZES = [
  '110', '120', '130', '140', '150',
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
];

export function useProductState(location?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const data = await fetchProducts(location);
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // API 응답이 비어있으면 하드코딩 데이터 사용 (location 필터 없이)
        setProducts(defaultProducts.map(toApiProduct));
      }
    } catch {
      setProducts(defaultProducts.map(toApiProduct));
    }
    setLoading(false);
  }, [location]);

  useEffect(() => {
    reload();
  }, [reload]);

  // products 변경 시 localStorage에 캐시 저장
  useEffect(() => {
    if (products.length > 0) {
      saveCache(products);
    }
  }, [products]);

  const toggleSoldOut = useCallback(async (id: string) => {
    try {
      const updated = await apiToggleSoldOut(id);
      if (updated && updated._id) {
        setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      } else {
        throw new Error('Invalid response');
      }
    } catch {
      // API 실패 시 로컬 상태만 토글
      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, soldOut: !p.soldOut } : p
        )
      );
    }
  }, []);

  const isSoldOut = useCallback(
    (id: string) => {
      const p = products.find((p) => p._id === id);
      if (!p) return false;
      if (p.soldOut) return true;
      // 모든 사이즈가 품절이면 soldOut으로 간주
      if (p.soldOutSizes && p.soldOutSizes.length >= ALL_SIZES.length) {
        return ALL_SIZES.every((s) => p.soldOutSizes.includes(s));
      }
      return false;
    },
    [products]
  );

  const toggleSizeSoldOut = useCallback(async (id: string, size: string) => {
    try {
      const updated = await apiToggleSizeSoldOut(id, size);
      if (updated && updated._id) {
        setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      } else {
        throw new Error('Invalid response');
      }
    } catch {
      // API 실패 시 로컬 상태만 토글
      setProducts((prev) =>
        prev.map((p) => {
          if (p._id !== id) return p;
          const sizes = p.soldOutSizes || [];
          return {
            ...p,
            soldOutSizes: sizes.includes(size)
              ? sizes.filter((s) => s !== size)
              : [...sizes, size],
          };
        })
      );
    }
  }, []);

  const getSoldOutSizesForProduct = useCallback(
    (id: string): string[] =>
      products.find((p) => p._id === id)?.soldOutSizes ?? [],
    [products]
  );

  const addProduct = useCallback(
    async (product: { name: string; number: number; category: number; price: number; image?: File; location?: string }) => {
      const created = await apiCreateProduct(product);
      setProducts((prev) => [...prev, created]);
    },
    []
  );

  const removeProduct = useCallback(async (id: string) => {
    await apiDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }, []);

  return {
    products,
    loading,
    toggleSoldOut,
    isSoldOut,
    toggleSizeSoldOut,
    getSoldOutSizesForProduct,
    addProduct,
    removeProduct,
    reload,
  };
}

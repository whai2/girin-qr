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

// API 실패 시 기존 하드코딩 데이터를 fallback으로 사용
function toApiProduct(p: { id: number; name: string; number: number; category: number; image: string; price: number }): Product {
  return { _id: String(p.id), name: p.name, number: p.number, category: p.category, image: p.image, price: p.price, soldOut: false, soldOutSizes: [] };
}

export const ALL_SIZES = [
  '110', '120', '130', '140', '150',
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
];

export function useProductState() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const data = await fetchProducts();
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(defaultProducts.map(toApiProduct));
      }
    } catch {
      setProducts(defaultProducts.map(toApiProduct));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleSoldOut = useCallback(async (id: string) => {
    const updated = await apiToggleSoldOut(id);
    setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
  }, []);

  const isSoldOut = useCallback(
    (id: string) => products.find((p) => p._id === id)?.soldOut ?? false,
    [products]
  );

  const toggleSizeSoldOut = useCallback(async (id: string, size: string) => {
    const updated = await apiToggleSizeSoldOut(id, size);
    setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
  }, []);

  const getSoldOutSizesForProduct = useCallback(
    (id: string): string[] =>
      products.find((p) => p._id === id)?.soldOutSizes ?? [],
    [products]
  );

  const addProduct = useCallback(
    async (product: { name: string; number: number; category: number; price: number; image?: File }) => {
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

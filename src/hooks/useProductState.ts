import { useState, useCallback, useEffect } from 'react';
import {
  fetchProducts,
  toggleSoldOut as apiToggleSoldOut,
  toggleSizeSoldOut as apiToggleSizeSoldOut,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  type Product,
} from '../api/products';

export type { Product };

export const ALL_SIZES = [
  '110', '120', '130', '140', '150',
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
];

export function useProductState() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const data = await fetchProducts();
    setProducts(data);
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

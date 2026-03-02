import { useState, useCallback, useEffect } from 'react';
import { products as defaultProducts, type Product } from '../data/products';

const SOLD_OUT_KEY = 'girin_sold_out';
const CUSTOM_PRODUCTS_KEY = 'girin_custom_products';
const SOLD_OUT_SIZES_KEY = 'girin_sold_out_sizes';

export const ALL_SIZES = [
  '110', '120', '130', '140', '150',
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
];

function getSoldOutIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(SOLD_OUT_KEY) || '[]');
  } catch {
    return [];
  }
}

function getCustomProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function getSoldOutSizes(): Record<number, string[]> {
  try {
    return JSON.parse(localStorage.getItem(SOLD_OUT_SIZES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function useProductState() {
  const [soldOutIds, setSoldOutIds] = useState<number[]>(getSoldOutIds);
  const [customProducts, setCustomProducts] = useState<Product[]>(getCustomProducts);
  const [soldOutSizes, setSoldOutSizes] = useState<Record<number, string[]>>(getSoldOutSizes);

  const allProducts = [...defaultProducts, ...customProducts];

  useEffect(() => {
    localStorage.setItem(SOLD_OUT_KEY, JSON.stringify(soldOutIds));
  }, [soldOutIds]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(customProducts));
  }, [customProducts]);

  useEffect(() => {
    localStorage.setItem(SOLD_OUT_SIZES_KEY, JSON.stringify(soldOutSizes));
  }, [soldOutSizes]);

  const toggleSoldOut = useCallback((id: number) => {
    setSoldOutIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);

  const isSoldOut = useCallback(
    (id: number) => soldOutIds.includes(id),
    [soldOutIds]
  );

  const toggleSizeSoldOut = useCallback((productId: number, size: string) => {
    setSoldOutSizes((prev) => {
      const current = prev[productId] || [];
      const updated = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];
      return { ...prev, [productId]: updated };
    });
  }, []);

  const getSoldOutSizesForProduct = useCallback(
    (productId: number): string[] => soldOutSizes[productId] || [],
    [soldOutSizes]
  );

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setCustomProducts((prev) => {
      const maxId = Math.max(
        ...defaultProducts.map((p) => p.id),
        ...prev.map((p) => p.id),
        0
      );
      return [...prev, { ...product, id: maxId + 1 }];
    });
  }, []);

  const removeProduct = useCallback((id: number) => {
    setCustomProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    products: allProducts,
    soldOutIds,
    toggleSoldOut,
    isSoldOut,
    toggleSizeSoldOut,
    getSoldOutSizesForProduct,
    addProduct,
    removeProduct,
  };
}

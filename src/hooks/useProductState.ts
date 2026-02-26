import { useState, useCallback, useEffect } from 'react';
import { products as defaultProducts, type Product } from '../data/products';

const SOLD_OUT_KEY = 'girin_sold_out';
const CUSTOM_PRODUCTS_KEY = 'girin_custom_products';

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

export function useProductState() {
  const [soldOutIds, setSoldOutIds] = useState<number[]>(getSoldOutIds);
  const [customProducts, setCustomProducts] = useState<Product[]>(getCustomProducts);

  const allProducts = [...defaultProducts, ...customProducts];

  useEffect(() => {
    localStorage.setItem(SOLD_OUT_KEY, JSON.stringify(soldOutIds));
  }, [soldOutIds]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(customProducts));
  }, [customProducts]);

  const toggleSoldOut = useCallback((id: number) => {
    setSoldOutIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);

  const isSoldOut = useCallback(
    (id: number) => soldOutIds.includes(id),
    [soldOutIds]
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
    addProduct,
    removeProduct,
  };
}

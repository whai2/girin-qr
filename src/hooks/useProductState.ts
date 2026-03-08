import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStoreProducts,
  toggleStoreProductSoldOut,
  toggleStoreProductSizeSoldOut,
  toggleStoreProductAge,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  type StoreProduct,
} from '../api/products';

export type { StoreProduct };

export const ALL_SIZES = [
  '110', '120', '130', '140', '150',
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
];

function storeProductsKey(storeSlug: string) {
  return ['storeProducts', storeSlug] as const;
}

export function useProductState(storeSlug: string) {
  const queryClient = useQueryClient();
  const queryKey = storeProductsKey(storeSlug);

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchStoreProducts(storeSlug),
    enabled: !!storeSlug,
  });

  // 품절 토글
  const soldOutMutation = useMutation({
    mutationFn: (id: string) => toggleStoreProductSoldOut(storeSlug, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<StoreProduct[]>(queryKey);
      queryClient.setQueryData<StoreProduct[]>(queryKey, (old) =>
        old?.map((p) => (p._id === id ? { ...p, soldOut: !p.soldOut } : p))
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  // 사이즈 품절 토글
  const sizeSoldOutMutation = useMutation({
    mutationFn: ({ id, size }: { id: string; size: string }) =>
      toggleStoreProductSizeSoldOut(storeSlug, id, size),
    onMutate: async ({ id, size }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<StoreProduct[]>(queryKey);
      queryClient.setQueryData<StoreProduct[]>(queryKey, (old) =>
        old?.map((p) => {
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
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  // 연령 그룹 토글
  const ageGroupMutation = useMutation({
    mutationFn: ({ id, age }: { id: string; age: 'kids' | 'adult' }) =>
      toggleStoreProductAge(storeSlug, id, age),
    onMutate: async ({ id, age }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<StoreProduct[]>(queryKey);
      queryClient.setQueryData<StoreProduct[]>(queryKey, (old) =>
        old?.map((p) => {
          if (p._id !== id) return p;
          const groups = p.ageGroup || [];
          return {
            ...p,
            ageGroup: groups.includes(age)
              ? groups.filter((g) => g !== age)
              : [...groups, age],
          };
        })
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  // 상품 등록
  const addMutation = useMutation({
    mutationFn: (product: { name: string; number: number; category: number; price: number; image?: File }) =>
      apiCreateProduct(product),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  // 상품 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<StoreProduct[]>(queryKey);
      queryClient.setQueryData<StoreProduct[]>(queryKey, (old) =>
        old?.filter((p) => p._id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleSoldOut = useCallback((id: string) => {
    soldOutMutation.mutate(id);
  }, [soldOutMutation]);

  const toggleSizeSoldOut = useCallback((id: string, size: string) => {
    sizeSoldOutMutation.mutate({ id, size });
  }, [sizeSoldOutMutation]);

  const toggleAgeGroup = useCallback((id: string, age: 'kids' | 'adult') => {
    ageGroupMutation.mutate({ id, age });
  }, [ageGroupMutation]);

  const isSoldOut = useCallback(
    (id: string) => {
      const p = products.find((p) => p._id === id);
      if (!p) return false;
      if (p.soldOut) return true;
      if (p.soldOutSizes && p.soldOutSizes.length >= ALL_SIZES.length) {
        return ALL_SIZES.every((s) => p.soldOutSizes.includes(s));
      }
      return false;
    },
    [products]
  );

  const getSoldOutSizesForProduct = useCallback(
    (id: string): string[] => {
      const sizes = products.find((p) => p._id === id)?.soldOutSizes ?? [];
      return [...sizes].sort((a, b) => ALL_SIZES.indexOf(a) - ALL_SIZES.indexOf(b));
    },
    [products]
  );

  const addProduct = useCallback(
    async (product: { name: string; number: number; category: number; price: number; image?: File }) => {
      return addMutation.mutateAsync(product);
    },
    [addMutation]
  );

  const removeProduct = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    products,
    loading,
    toggleSoldOut,
    isSoldOut,
    toggleSizeSoldOut,
    getSoldOutSizesForProduct,
    toggleAgeGroup,
    addProduct,
    removeProduct,
  };
}

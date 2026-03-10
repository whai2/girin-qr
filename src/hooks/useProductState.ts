import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStoreProducts,
  toggleStoreProductSoldOut,
  toggleStoreProductSizeSoldOut,
  toggleStoreProductAge,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  type StoreProduct,
  type StoreProductQuery,
  type PaginatedResponse,
} from '../api/products';

export type { StoreProduct };

export const ALL_SIZES = [
  '110', '120', '130', '140', '150',
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
];

type PaginatedStoreProducts = PaginatedResponse<StoreProduct>;

function storeProductsKey(storeSlug: string, params?: StoreProductQuery) {
  return params ? ['storeProducts', storeSlug, params] as const : ['storeProducts', storeSlug] as const;
}

// items 매핑 헬퍼 (optimistic update용)
function mapItems(
  old: PaginatedStoreProducts | undefined,
  fn: (items: StoreProduct[]) => StoreProduct[],
): PaginatedStoreProducts | undefined {
  return old ? { ...old, items: fn(old.items) } : old;
}

export function useProductState(storeSlug: string, params?: StoreProductQuery) {
  const queryClient = useQueryClient();
  const queryKey = storeProductsKey(storeSlug, params);
  // invalidation용 prefix key (모든 params 매칭)
  const prefixKey = ['storeProducts', storeSlug] as const;

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchStoreProducts(storeSlug, params),
    enabled: !!storeSlug,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;

  // 품절 토글
  const soldOutMutation = useMutation({
    mutationFn: (id: string) => toggleStoreProductSoldOut(storeSlug, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<PaginatedStoreProducts>(queryKey);
      queryClient.setQueryData<PaginatedStoreProducts>(queryKey, (old) =>
        mapItems(old, (items) => items.map((p) => (p._id === id ? { ...p, soldOut: !p.soldOut } : p)))
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: prefixKey }),
  });

  // 사이즈 품절 토글
  const sizeSoldOutMutation = useMutation({
    mutationFn: ({ id, size }: { id: string; size: string }) =>
      toggleStoreProductSizeSoldOut(storeSlug, id, size),
    onMutate: async ({ id, size }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<PaginatedStoreProducts>(queryKey);
      queryClient.setQueryData<PaginatedStoreProducts>(queryKey, (old) =>
        mapItems(old, (items) =>
          items.map((p) => {
            if (p._id !== id) return p;
            const sizes = p.soldOutSizes || [];
            return {
              ...p,
              soldOutSizes: sizes.includes(size)
                ? sizes.filter((s) => s !== size)
                : [...sizes, size],
            };
          })
        )
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: prefixKey }),
  });

  // 연령 그룹 토글
  const ageGroupMutation = useMutation({
    mutationFn: ({ id, age }: { id: string; age: 'kids' | 'adult' }) =>
      toggleStoreProductAge(storeSlug, id, age),
    onMutate: async ({ id, age }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<PaginatedStoreProducts>(queryKey);
      queryClient.setQueryData<PaginatedStoreProducts>(queryKey, (old) =>
        mapItems(old, (items) =>
          items.map((p) => {
            if (p._id !== id) return p;
            const groups = p.ageGroup || [];
            return {
              ...p,
              ageGroup: groups.includes(age)
                ? groups.filter((g) => g !== age)
                : [...groups, age],
            };
          })
        )
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: prefixKey }),
  });

  // 상품 등록
  const addMutation = useMutation({
    mutationFn: (product: { name: string; number: number; category: number; price: number; image?: File; smartStoreUrl?: string }) =>
      apiCreateProduct(product),
    onSettled: () => queryClient.invalidateQueries({ queryKey: prefixKey }),
  });

  // 상품 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; number?: number; category?: number; price?: number; image?: File; smartStoreUrl?: string } }) =>
      apiUpdateProduct(id, data),
    onSettled: () => queryClient.invalidateQueries({ queryKey: prefixKey }),
  });

  // 상품 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<PaginatedStoreProducts>(queryKey);
      queryClient.setQueryData<PaginatedStoreProducts>(queryKey, (old) =>
        mapItems(old, (items) => items.filter((p) => p._id !== id))
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: prefixKey }),
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
    async (product: { name: string; number: number; category: number; price: number; image?: File; smartStoreUrl?: string }) => {
      return addMutation.mutateAsync(product);
    },
    [addMutation]
  );

  const editProduct = useCallback(
    async (id: string, data: { name?: string; number?: number; category?: number; price?: number; image?: File; smartStoreUrl?: string }) => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation]
  );

  const removeProduct = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    products,
    total,
    loading,
    toggleSoldOut,
    isSoldOut,
    toggleSizeSoldOut,
    getSoldOutSizesForProduct,
    toggleAgeGroup,
    addProduct,
    editProduct,
    removeProduct,
  };
}

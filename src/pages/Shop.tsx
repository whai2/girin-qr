import { motion } from "framer-motion";
import { useCallback } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../components/ProductCard";
import { fetchStores, fetchStoreProducts, type StoreProduct } from "../api/products";
import { ALL_SIZES } from "../hooks/useProductState";

const PAGE_LIMIT = 21;

function isSoldOut(p: StoreProduct) {
  if (p.soldOut) return true;
  if (p.soldOutSizes && p.soldOutSizes.length >= ALL_SIZES.length) {
    return ALL_SIZES.every((s) => p.soldOutSizes.includes(s));
  }
  return false;
}

function getSoldOutSizes(p: StoreProduct): string[] {
  const sizes = p.soldOutSizes ?? [];
  return [...sizes].sort((a, b) => ALL_SIZES.indexOf(a) - ALL_SIZES.indexOf(b));
}

export default function Shop() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
  });
  const store = storeSlug ? stores.find((s) => s.slug === storeSlug) : undefined;

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const activeCategory = categoryParam !== null ? Number(categoryParam) : undefined;
  const activeSize = searchParams.get("size") || "";
  const page = Number(searchParams.get("page") || "1");

  const filters = {
    ageGroup: (activeSize || 'all') as 'kids' | 'adult' | 'all',
    ...(activeCategory !== undefined ? { category: activeCategory } : {}),
  };

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newPage <= 1) {
          next.delete("page");
        } else {
          next.set("page", String(newPage));
        }
        return next;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['shopProducts', storeSlug, filters, page],
    queryFn: () =>
      fetchStoreProducts(storeSlug!, {
        ...filters,
        page,
        limit: PAGE_LIMIT,
      }),
    enabled: !!storeSlug,
  });

  const products = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  if (!storesLoading && storeSlug && !store) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="px-2 md:px-8 pb-8">
      <motion.div
        key={`${activeCategory ?? 'all'}-${activeSize ?? 'all'}-${page}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-3 gap-x-2 gap-y-5 md:gap-x-3 md:gap-y-6"
      >
        {products.map((product, i) => (
          <ProductCard
            key={product._id}
            product={product}
            soldOut={isSoldOut(product)}
            soldOutSizes={getSoldOutSizes(product)}
            eager={i < 6}
          />
        ))}
      </motion.div>

      {isLoading && (
        <p className="text-center text-black/40 py-4">로딩 중...</p>
      )}

      {!isLoading && products.length === 0 && (
        <p className="text-center text-black/40 py-20">
          해당 카테고리에 상품이 없습니다.
        </p>
      )}

      {/* 페이지네이션 */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 pb-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-sm font-bold rounded-lg border border-gray-300 bg-white disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm font-bold rounded-lg border border-gray-300 bg-white disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

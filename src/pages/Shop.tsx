import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import ProductCard from "../components/ProductCard";
import { getStoreBySlug } from "../data/popupStores";
import { fetchStoreProducts, type StoreProduct } from "../api/products";
import { ALL_SIZES } from "../hooks/useProductState";

const SCROLL_KEY = "shop-scroll-y";
const PAGE_LIMIT = 20;

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
  const store = storeSlug ? getStoreBySlug(storeSlug) : undefined;

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const activeCategory = categoryParam !== null ? Number(categoryParam) : undefined;
  const activeSize = searchParams.get("size") || "";

  const filters = {
    // TODO: 테스트 후 ageGroup 복원
    // ageGroup: (activeSize || 'all') as 'kids' | 'adult' | 'all',
    ...(activeCategory !== undefined ? { category: activeCategory } : {}),
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['shopProducts', storeSlug, filters],
    queryFn: ({ pageParam }) =>
      fetchStoreProducts(storeSlug!, {
        ...filters,
        page: pageParam,
        limit: PAGE_LIMIT,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total
        ? lastPage.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!storeSlug,
  });

  const products = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const sentinelRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);

  // 스크롤 위치 저장
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (anchor && anchor.href.includes("/product/")) {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // 스크롤 위치 복원
  useEffect(() => {
    if (restoredRef.current || products.length === 0) return;
    restoredRef.current = true;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      sessionStorage.removeItem(SCROLL_KEY);
      setTimeout(() => {
        window.scrollTo({
          top: Number(saved),
          behavior: "instant" as ScrollBehavior,
        });
      }, 50);
    }
  }, [products]);

  // 무한 스크롤 (Intersection Observer)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (storeSlug && !store) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="px-2 md:px-8 pb-8">
      <motion.div
        key={`${activeCategory ?? 'all'}-${activeSize ?? 'all'}`}
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

      {/* 무한 스크롤 센티넬 */}
      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <p className="text-center text-black/40 py-4">로딩 중...</p>
      )}

      {!isLoading && products.length === 0 && (
        <p className="text-center text-black/40 py-20">
          해당 카테고리에 상품이 없습니다.
        </p>
      )}
    </div>
  );
}

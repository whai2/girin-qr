import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProductState } from '../hooks/useProductState';
import ProductCard from '../components/ProductCard';

const SCROLL_KEY = 'shop-scroll-y';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const activeCategory = categoryParam ? Number(categoryParam) : 0;
  const { products, isSoldOut, getSoldOutSizesForProduct } = useProductState();
  const restoredRef = useRef(false);

  // 스크롤 위치 저장 (클릭으로 페이지 떠나기 전에 저장)
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };
    // 링크 클릭 시 스크롤 위치 저장
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (anchor && anchor.href.includes('/product/')) {
        saveScroll();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 스크롤 위치 복원 (상품 로드 후)
  useEffect(() => {
    if (restoredRef.current || products.length === 0) return;
    restoredRef.current = true;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      sessionStorage.removeItem(SCROLL_KEY);
      // smooth scroll 무시하고 즉시 이동
      setTimeout(() => {
        window.scrollTo({ top: Number(saved), behavior: 'instant' as ScrollBehavior });
      }, 50);
    }
  }, [products]);

  const filtered =
    activeCategory === 0
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="px-2 md:px-8 pb-8">
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-3 gap-x-2 gap-y-5 md:gap-x-3 md:gap-y-6"
      >
        {filtered.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            soldOut={isSoldOut(product._id)}
            soldOutSizes={getSoldOutSizesForProduct(product._id)}
          />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-center text-black/40 py-20">
          해당 카테고리에 상품이 없습니다.
        </p>
      )}
    </div>
  );
}

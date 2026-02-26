import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProductState } from '../hooks/useProductState';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const activeCategory = categoryParam ? Number(categoryParam) : 0;
  const { products, isSoldOut } = useProductState();

  const filtered =
    activeCategory === 0
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="px-4 md:px-12 pb-8">
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-3 gap-4 md:gap-6"
      >
        {filtered.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            soldOut={isSoldOut(product.id)}
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

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProductState } from '../hooks/useProductState';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { products, isSoldOut } = useProductState();
  const featured = products.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="h-[60vh] md:h-[70vh] bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            GIRIN
          </h1>
          <p className="text-gray-500 text-lg md:text-xl mb-8">
            기린 티셔츠 컬렉션
          </p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white px-8 py-3 text-sm tracking-wide hover:bg-gray-800 transition-colors"
          >
            Shop Now
          </Link>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="px-12 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-semibold">인기 상품</h2>
          <Link
            to="/shop"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            전체 보기 &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {featured.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              soldOut={isSoldOut(product.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

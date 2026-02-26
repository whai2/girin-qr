import { motion } from 'framer-motion';
import type { Product } from '../data/products';

interface Props {
  product: Product;
  index: number;
  soldOut?: boolean;
}

export default function ProductCard({ product, index, soldOut }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="flex flex-col items-center"
    >
      <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover ${
              soldOut ? 'opacity-50 grayscale' : ''
            }`}
          />
        </div>
      </div>
      <p className="mt-2 text-sm font-bold text-center">{product.name}</p>
      {soldOut && (
        <p className="text-xs text-red-500 font-bold text-center mt-0.5">
          Sold out..
        </p>
      )}
    </motion.div>
  );
}

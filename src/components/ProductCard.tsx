import { motion } from 'framer-motion';
import type { Product } from '../data/products';
import { CATEGORY_NAMES } from '../data/products';

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
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group cursor-pointer border border-[#e8dfd6] rounded-lg p-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            soldOut ? 'opacity-40 grayscale' : ''
          }`}
        />
        {soldOut ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 text-white text-sm font-semibold px-4 py-2 rounded-full">
              품절
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-black/70 text-white text-sm font-semibold px-4 py-2 rounded-full">
              판매중
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-gray-400">
          {CATEGORY_NAMES[product.category]}
        </p>
        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
        <p className={`text-sm ${soldOut ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
          {product.price.toLocaleString()}원
        </p>
      </div>
    </motion.div>
  );
}

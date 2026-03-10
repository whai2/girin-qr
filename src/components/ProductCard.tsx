import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { StoreProduct } from '../api/products';

interface Props {
  product: StoreProduct;
  soldOut?: boolean;
  soldOutSizes?: string[];
  /** 뷰포트 내 첫 번째 줄 이미지인 경우 true (lazy 비활성화) */
  eager?: boolean;
}

export default function ProductCard({ product, soldOut, soldOutSizes = [], eager }: Props) {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [loaded, setLoaded] = useState(false);

  return (
    <Link to={`/${storeSlug}/product/${product._id}`}>
      <div className="flex flex-col items-center cursor-pointer">
        <div className="w-full rounded-2xl overflow-hidden">
          <div className="aspect-square overflow-hidden relative">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-4/5 h-4/5 animate-pulse"
                  fill="none"
                >
                  <path
                    d="M30 20 L20 35 L30 35 L30 80 L70 80 L70 35 L80 35 L70 20 L58 20 C58 25 54 28 50 28 C46 28 42 25 42 20 Z"
                    fill="#e5e7eb"
                  />
                </svg>
              </div>
            )}
            <img
              src={product.image}
              alt={product.name}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={eager ? 'high' : 'low'}
              onLoad={() => setLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                loaded ? 'opacity-100' : 'opacity-0'
              } ${soldOut ? 'opacity-50 grayscale' : ''}`}
            />
          </div>
        </div>
        <p className="mt-0.5 text-sm font-bold text-center">{product.name}</p>
        {product.ageGroup && product.ageGroup.length > 0 && (
          <p className="text-xs text-gray-500 text-center">
            {product.ageGroup.length === 2
              ? '둘 다 있음'
              : product.ageGroup[0] === 'kids'
                ? '아동만 있음'
                : '성인만 있음'}
          </p>
        )}
        {soldOutSizes.length > 0 && (
          <div className="text-center mt-0.5">
            <p className="text-sm text-red-500">{soldOutSizes.join(', ')}</p>
            <p className="text-sm text-red-500 font-bold">Sold out..</p>
          </div>
        )}
        {soldOut && soldOutSizes.length === 0 && (
          <p className="text-xs text-red-500 font-bold text-center mt-0.5">
            Sold out..
          </p>
        )}
      </div>
    </Link>
  );
}

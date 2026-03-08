import { Link, useParams } from 'react-router-dom';

import type { StoreProduct } from '../api/products';

interface Props {
  product: StoreProduct;

  soldOut?: boolean;
  soldOutSizes?: string[];
}

export default function ProductCard({ product, soldOut, soldOutSizes = [] }: Props) {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  return (
    <Link to={`/${storeSlug}/product/${product._id}`}>
      <div
        className="flex flex-col items-center cursor-pointer"
      >
        <div className="w-full rounded-2xl overflow-hidden">
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

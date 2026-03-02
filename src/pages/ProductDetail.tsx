import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProductState } from '../hooks/useProductState';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isSoldOut, getSoldOutSizesForProduct } = useProductState();

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-bold">상품을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm underline"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const soldOut = isSoldOut(product.id);
  const soldOutSizes = getSoldOutSizesForProduct(product.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto px-4 py-8 flex flex-col items-center"
    >
      {/* Close button */}
      <button
        onClick={() => navigate(-1)}
        className="self-end mb-4"
      >
        <img src="/wtl-close-button.png" alt="닫기" className="h-8 w-8" />
      </button>

      {/* Big product image */}
      <div className="w-full rounded-2xl overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full ${soldOut ? 'opacity-50 grayscale' : ''}`}
        />
      </div>

      {/* Product name */}
      <h2 className="mt-4 text-xl font-black text-center">{product.name}</h2>
      <p className="text-sm font-bold text-center mt-1">
        {product.price.toLocaleString()}원
      </p>

      {/* Sold out sizes */}
      {soldOutSizes.length > 0 && (
        <div className="mt-2 text-center">
          <p className="text-sm font-bold text-red-500">{soldOutSizes.join(', ')}</p>
          <p className="text-red-500 font-bold text-sm">Sold out..</p>
        </div>
      )}

      {/* Shop link button */}
      <a
        href="https://smartstore.naver.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 hover:opacity-80 transition-opacity"
      >
        <img
          src="/wtl-shop-button.png"
          alt="ONLINE SHOP"
          className="h-12 md:h-14"
        />
      </a>
    </motion.div>
  );
}

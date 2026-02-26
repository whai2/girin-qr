import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, adminLogout } from './AdminLogin';
import { useProductState } from '../hooks/useProductState';
import { CATEGORY_NAMES } from '../data/products';

export default function Admin() {
  const navigate = useNavigate();
  const {
    products,
    toggleSoldOut,
    isSoldOut,
    addProduct,
    removeProduct,
  } = useProductState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(1);
  const [newPrice, setNewPrice] = useState('20000');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !newName) return;
    addProduct({
      name: newName,
      number: 0,
      category: newCategory,
      image: preview,
      price: Number(newPrice) || 20000,
    });
    setNewName('');
    setNewPrice('20000');
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  if (!isAdminAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-white px-12 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">관리자</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* Upload Section */}
      <section className="mb-12 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">상품 추가</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="상품명"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black"
            >
              {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="가격"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm"
            />
            {preview && (
              <img
                src={preview}
                alt="미리보기"
                className="w-16 h-16 object-cover rounded"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={!preview || !newName}
            className="bg-black text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            추가
          </button>
        </form>
      </section>

      {/* Product Management */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          상품 관리 ({products.length}개)
        </h2>
        <div className="space-y-3">
          {products.map((product) => {
            const soldOut = isSoldOut(product.id);
            const isCustom = product.number === 0;
            return (
              <div
                key={product.id}
                className="flex items-center gap-4 border border-gray-200 rounded-lg p-3"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {CATEGORY_NAMES[product.category]} ·{' '}
                    {product.price.toLocaleString()}원
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSoldOut(product.id)}
                    className={`px-3 py-1.5 text-xs rounded-full cursor-pointer transition-colors ${
                      soldOut
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {soldOut ? '품절' : '판매중'}
                  </button>
                  {isCustom && (
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

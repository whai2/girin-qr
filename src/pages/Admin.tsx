import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, adminLogout } from './AdminLogin';
import { useProductState } from '../hooks/useProductState';
import { ALL_SIZES } from '../hooks/useProductState';
import { CATEGORY_NAMES } from '../data/products';
import { POPUP_STORES } from '../data/popupStores';

const TABS = ['전체리스트', '판매리스트', 'QR코드'];

const categoryItems = [
  { key: 0, label: '전체' },
  ...Object.entries(CATEGORY_NAMES).map(([key, label]) => ({
    key: Number(key),
    label,
  })),
];

export default function Admin() {
  const navigate = useNavigate();
  const [activeLocationIdx, setActiveLocationIdx] = useState(0);
  const activeStore = POPUP_STORES[activeLocationIdx];

  const {
    products,
    toggleSoldOut,
    isSoldOut,
    toggleSizeSoldOut,
    getSoldOutSizesForProduct,
    addProduct,
    removeProduct,
  } = useProductState(activeStore.slug);
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');

  // 상품 등록 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState(0);
  const [formCategory, setFormCategory] = useState(1);
  const [formPrice, setFormPrice] = useState(20000);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormNumber(0);
    setFormCategory(1);
    setFormPrice(20000);
    setFormImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!formName.trim()) return alert('상품명을 입력하세요.');
    if (!formImage) return alert('이미지를 선택하세요.');

    setIsSubmitting(true);
    try {
      await addProduct({
        name: formName,
        number: formNumber,
        category: formCategory,
        price: formPrice,
        image: formImage,
        location: activeStore.slug,
      });
      resetForm();
      setShowAddForm(false);
    } catch {
      alert('등록에 실패했습니다.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
    await removeProduct(id);
  };

  if (!isAdminAuthenticated()) return null;

  const filtered = products
    .filter((p) => activeCategory === 0 || p.category === activeCategory)
    .filter((p) => !search || p.name.includes(search));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <img
            src="/wtl-admin-title.png"
            alt="WTL Manager"
            className="h-20 md:h-28"
          />
          <div className="flex flex-col items-end gap-2">
            <img
              src="/wtl-super-manager-door.png"
              alt="Super Manager"
              className="h-20 md:h-28"
            />
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Location Tabs */}
      <div className="flex gap-3 px-4 pb-4">
        {POPUP_STORES.map((store, i) => (
          <button
            key={store.slug}
            onClick={() => setActiveLocationIdx(i)}
            className={`px-8 py-3.5 text-lg font-bold rounded-xl transition-colors ${
              activeLocationIdx === i
                ? 'bg-[#ffdd71] text-black'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {store.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 px-4 pb-3 border-b border-gray-200">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`text-base font-bold pb-2 transition-colors ${
              activeTab === i
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search + 등록 버튼 */}
      <div className="px-4 py-3 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
        />
        {activeTab === 0 && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-3 bg-[#ffdd71] text-black font-bold rounded-lg whitespace-nowrap"
          >
            {showAddForm ? '닫기' : '+ 등록'}
          </button>
        )}
      </div>

      {/* 상품 등록 폼 */}
      {showAddForm && activeTab === 0 && (
        <div className="mx-4 mb-4 p-4 border-2 border-[#ffdd71] rounded-xl bg-[#fffbea]">
          <h3 className="font-bold text-lg mb-3">새 상품 등록</h3>

          {/* 이미지 업로드 */}
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">이미지</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-black transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm text-center">클릭하여<br />이미지 선택</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* 상품명 */}
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">상품명</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="예: 11번 기린"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          {/* 번호 + 카테고리 */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">번호</label>
              <input
                type="number"
                value={formNumber}
                onChange={(e) => setFormNumber(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">카테고리</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              >
                {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 가격 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">가격 (원)</label>
            <input
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          {/* 등록 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-black text-white font-bold rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '상품 등록'}
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-3 px-4 pb-4 overflow-x-auto">
        {categoryItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveCategory(item.key)}
            className={`text-sm whitespace-nowrap transition-colors ${
              activeCategory === item.key
                ? 'text-black font-bold'
                : 'text-gray-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="px-4 pb-8">
        {activeTab === 2 ? (
          <div className="text-center text-gray-400 py-20">
            QR코드 기능 준비중
          </div>
        ) : activeTab === 0 ? (
          /* 전체리스트 */
          <div className="space-y-3">
            {filtered.map((product) => {
              const soldOut = isSoldOut(product._id);
              return (
                <div
                  key={product._id}
                  className="flex items-center gap-4 border border-black rounded-xl p-3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold">{product.name}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {CATEGORY_NAMES[product.category]}
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {product.price.toLocaleString()}원
                    </p>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => toggleSoldOut(product._id)}
                        className="text-sm text-blue-500"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="text-sm text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <span
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-black ${
                      soldOut
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-[#ffdd71] text-black'
                    }`}
                  >
                    {soldOut ? '미판매' : '판매중'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* 판매리스트 - 사이즈별 품절 관리 */
          <div className="space-y-4">
            {filtered.map((product) => {
              const soldOutSizes = getSoldOutSizesForProduct(product._id);
              return (
                <div
                  key={product._id}
                  className="border border-black rounded-xl p-4"
                >
                  <div className="flex gap-4 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg bg-gray-50"
                    />
                    <div>
                      <p className="text-base font-bold">{product.name}</p>
                      <p className="text-sm text-gray-400">
                        {CATEGORY_NAMES[product.category]}
                      </p>
                    </div>
                  </div>
                  {/* Size Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {ALL_SIZES.map((size) => {
                      const isSizeSoldOut = soldOutSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => toggleSizeSoldOut(product._id, size)}
                          className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                            isSizeSoldOut
                              ? 'bg-red-500 text-white border-red-500'
                              : 'bg-white text-black border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && activeTab !== 2 && (
          <p className="text-center text-gray-400 py-20">
            상품이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

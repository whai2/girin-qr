import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, adminLogout } from './AdminLogin';
import { useProductState } from '../hooks/useProductState';
import { ALL_SIZES } from '../hooks/useProductState';
import { CATEGORY_NAMES } from '../data/products';

const LOCATIONS = ['더현대 대구', '신세계 강남'];
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
  const {
    products,
    toggleSoldOut,
    isSoldOut,
    toggleSizeSoldOut,
    getSoldOutSizesForProduct,
  } = useProductState();

  const [activeLocation, setActiveLocation] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/');
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
        {LOCATIONS.map((loc, i) => (
          <button
            key={loc}
            onClick={() => setActiveLocation(i)}
            className={`px-8 py-3.5 text-lg font-bold rounded-xl transition-colors ${
              activeLocation === i
                ? 'bg-[#ffdd71] text-black'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {loc}
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

      {/* Search */}
      <div className="px-4 py-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
        />
      </div>

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
              const soldOut = isSoldOut(product.id);
              return (
                <div
                  key={product.id}
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
                    <button
                      onClick={() => toggleSoldOut(product.id)}
                      className="text-sm text-blue-500 mt-1"
                    >
                      수정
                    </button>
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
              const soldOutSizes = getSoldOutSizesForProduct(product.id);
              return (
                <div
                  key={product.id}
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
                          onClick={() => toggleSizeSoldOut(product.id, size)}
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

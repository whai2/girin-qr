import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStores } from '../../api/products';
import { fetchCategories } from '../../api/categories';

const sizeItems = [
  { key: '', label: '전체' },
  { key: 'adult', label: '성인사이즈' },
  { key: 'kids', label: '아동사이즈' },
];

export default function Header() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentSize = searchParams.get('size') || '';
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
  });
  const currentStore = storeSlug ? stores.find((s) => s.slug === storeSlug) : undefined;
  const isShop = !!currentStore && !location.pathname.includes('/product/');
  const isAdmin = location.pathname.startsWith('/admin');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: isShop,
  });

  const categoryItems = [
    { key: '', label: '전체' },
    ...categories.map((c) => ({ key: String(c.order), label: c.name })),
  ];

  if (isAdmin) return null;

  const handleSizeClick = (sizeKey: string) => {
    const params = new URLSearchParams(searchParams);
    if (sizeKey) {
      params.set('size', sizeKey);
    } else {
      params.delete('size');
    }
    setSearchParams(params);
  };

  const basePath = storeSlug ? `/${storeSlug}` : '/';

  return (
    <header className="pt-7 pb-4">
      {/* Logo */}
      <div className="text-center mb-6">
        <Link to={basePath}>
          <img
            src="/wtl-logo.png"
            alt="WTL - WGGG T-SHIRTS LIST"
            className="h-24 md:h-32 mx-auto"
          />
        </Link>
      </div>

      {/* 현재 팝업 스토어 이름 표시 */}
      {currentStore && (
        <p className="text-center text-lg font-black text-black pb-6">
          {currentStore.name}
        </p>
      )}

      {/* Category Tabs */}
      {isShop && (
        <>
          <nav className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 pb-2">
            {categoryItems.map((item) => (
              <Link
                key={item.key}
                to={item.key ? `${basePath}?category=${item.key}` : basePath}
                className={`text-sm whitespace-nowrap transition-colors ${
                  currentCategory === item.key
                    ? 'text-black font-bold'
                    : 'text-black/50 hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Size Filter */}
          <nav className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 pt-1 pb-2">
            {sizeItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleSizeClick(item.key)}
                className={`text-sm whitespace-nowrap transition-colors ${
                  currentSize === item.key
                    ? 'text-black font-bold'
                    : 'text-black/50 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}

import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CATEGORY_NAMES } from '../../data/products';

const categoryItems = [
  { key: '', label: '전체' },
  ...Object.entries(CATEGORY_NAMES).map(([key, label]) => ({ key, label })),
];

export default function Header() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const isShop = location.pathname === '/' || location.pathname === '/shop';
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <header className="pt-10 pb-4">
      {/* Logo */}
      <div className="text-center mb-6">
        <Link to="/">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            GIRIN
          </h1>
          <p className="text-sm font-bold tracking-widest mt-1">
            GIRIN T-SHIRTS LIST
          </p>
        </Link>
      </div>

      {/* Category Tabs */}
      {isShop && (
        <nav className="flex justify-center gap-4 md:gap-6 overflow-x-auto px-4 pb-2">
          {categoryItems.map((item) => (
            <Link
              key={item.key}
              to={item.key ? `/?category=${item.key}` : '/'}
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
      )}
    </header>
  );
}

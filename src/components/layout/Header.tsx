import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_NAMES } from '../../data/products';

const categoryItems = [
  { key: '', label: '전체' },
  ...Object.entries(CATEGORY_NAMES).map(([key, label]) => ({ key, label })),
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const isShop = location.pathname === '/shop';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="h-16 px-12 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          GIRIN
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm tracking-wide transition-colors ${
              location.pathname === '/'
                ? 'text-black font-semibold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Home
          </Link>
          {categoryItems.map((item) => (
            <Link
              key={item.key}
              to={item.key ? `/shop?category=${item.key}` : '/shop'}
              className={`text-sm tracking-wide transition-colors ${
                isShop && currentCategory === item.key
                  ? 'text-black font-semibold'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/admin/login"
            className="text-sm text-gray-300 hover:text-gray-500 transition-colors"
          >
            관리자
          </Link>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 토글"
        >
          <div className="w-5 flex flex-col gap-1">
            <span
              className={`block h-0.5 bg-black transition-transform origin-center ${
                menuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-black transition-opacity ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-black transition-transform origin-center ${
                menuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-b border-gray-100"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className={`text-sm tracking-wide ${
                  location.pathname === '/'
                    ? 'text-black font-semibold'
                    : 'text-gray-500'
                }`}
              >
                Home
              </Link>
              {categoryItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.key ? `/shop?category=${item.key}` : '/shop'}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm tracking-wide ${
                    isShop && currentCategory === item.key
                      ? 'text-black font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

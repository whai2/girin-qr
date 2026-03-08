import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isProductDetail = location.pathname.startsWith('/product/');

  if (isAdmin) return null;
  if (isProductDetail) return null;

  return (
    <footer className="flex flex-col items-center">
      {/* Online Shop Button */}
      <div className="py-12">
        <a
          href="https://smartstore.naver.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
        >
          <img src="/wtl-shop-button.png" alt="ONLINE SHOP" className="h-14 md:h-16" />
        </a>
      </div>

      {/* Copyright */}
      <div className="py-4">
        <img src="/wtl-copyright.png" alt="Copyright" className="h-5 md:h-6" />
      </div>

      {/* Staff Door (white background) */}
      <div className="w-full bg-white flex items-end justify-center pt-20 pb-12" style={{ boxShadow: '0 9999px 0 9999px white' }}>
        <Link
          to="/admin/login"
          className="hover:opacity-70 transition-opacity"
        >
          <img src="/wtl-staff-door.png" alt="관리자" style={{ height: '18rem' }} />
        </Link>
      </div>
    </footer>
  );
}

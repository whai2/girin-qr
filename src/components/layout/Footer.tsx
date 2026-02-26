import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="py-12 flex flex-col items-center gap-6">
      <a
        href="https://smartstore.naver.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg font-bold tracking-wide hover:opacity-70 transition-opacity"
      >
        ONLINE SHOP &rarr;
      </a>
      <Link
        to="/admin/login"
        className="text-xs text-black/20 hover:text-black/40 transition-colors"
      >
        관리자
      </Link>
    </footer>
  );
}

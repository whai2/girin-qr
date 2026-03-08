import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MarqueeBanner from './MarqueeBanner';
import FloatingMascot from '../FloatingMascot';

export default function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col ${isAdmin ? 'bg-white' : ''}`}>
      {!isAdmin && <MarqueeBanner />}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {!isAdmin && <FloatingMascot />}
    </div>
  );
}

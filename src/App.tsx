import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import { POPUP_STORES } from './data/popupStores';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* 기본 경로 → 첫 번째 팝업 스토어로 리다이렉트 */}
              <Route index element={<Navigate to={`/${POPUP_STORES[0].slug}`} replace />} />
              {/* 팝업 스토어별 상품 목록 */}
              <Route path=":storeSlug" element={<Shop />} />
              {/* 팝업 스토어별 상품 상세 */}
              <Route path=":storeSlug/product/:id" element={<ProductDetail />} />
              <Route path="admin/login" element={<AdminLogin />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

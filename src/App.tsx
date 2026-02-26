import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import Shop from './pages/Shop';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Shop />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;

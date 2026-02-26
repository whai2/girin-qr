import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'girin1234';
const AUTH_KEY = 'girin_admin_auth';

export function isAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

export function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
}

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      navigate('/admin');
    } else {
      setError('비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">관리자 로그인</h1>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="비밀번호 입력"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg text-sm hover:bg-gray-800 transition-colors"
        >
          로그인
        </button>
      </form>
    </div>
  );
}


import React, { useState } from 'react';
import { User } from '../types';
import { ShieldAlert, Key, User as UserIcon, AlertCircle } from 'lucide-react';

interface LoginOverlayProps {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => (u.username === username || u.name === username) && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('帳號或密碼錯誤');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 overflow-hidden relative border border-slate-700">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="祐大技術顧問" className="w-40 h-40 object-contain" />
          </div>
          <div className="text-xl font-bold text-slate-800 mb-2">祐大技術顧問股份有限公司</div>
          <h2 className="text-2xl font-bold text-indigo-600">作業環境監測管理 系統登入</h2>
          <p className="text-slate-500 mt-2 text-sm italic">請輸入您的帳號或姓名與密碼</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <UserIcon size={14} /> 帳號 / 姓名
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              placeholder="例如: admin 或 王大同"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <Key size={14} /> 密碼
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              placeholder="請輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-shake">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]"
          >
            登入系統
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-2">
          <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">預設測試帳號</p>
          <div className="flex justify-around text-[10px] text-slate-500">
            <span>Admin: admin / 1111</span>
            <span>Engineer: 王大同 / 1111</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginOverlay;

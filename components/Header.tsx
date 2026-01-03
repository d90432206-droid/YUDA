
import React from 'react';
import { User as UserType } from '../types';
import { LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-sm font-medium">作業環境監測管理</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{user.username}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <UserIcon size={18} />
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2"
            title="登出"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;


import React from 'react';
import { User as UserType } from '../types';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick }) => {
  return (
    <header className="h-16 lg:h-20 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shadow-sm sticky top-0 z-30 w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Menu size={24} />
        </button>
        <span className="text-slate-500 text-xs lg:text-sm font-medium truncate max-w-[150px] lg:max-w-none">
          作業環境監測管理
        </span>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs lg:text-sm font-semibold text-slate-800 leading-none truncate max-w-[80px] lg:max-w-none">{user.name}</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter hidden sm:block">{user.username}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
            <UserIcon size={18} />
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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

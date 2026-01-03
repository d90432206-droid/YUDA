
import React from 'react';
import { User } from '../types';
import { LayoutDashboard, Microscope, Beaker, ShieldCheck, Users, Tag } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const menuItems = [
    { id: 'dashboard', label: '儀表板', icon: LayoutDashboard },
    { id: 'instruments', label: '儀器設備管理', icon: Microscope },
    { id: 'materials', label: '介質管理', icon: Beaker },
    { id: 'personnel', label: '人員管理', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-600 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <img src="/logo.png" alt="祐大技術顧問" className="w-32 h-32 object-contain" />
          <div className="text-sm font-bold text-slate-800 mt-2 text-center leading-tight">祐大技術顧問<br />股份有限公司</div>
        </div>
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight text-center">作業環境監測管理</h1>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all ${isActive
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-500'
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
            <Tag size={10} /> 認可資格
          </p>
          <div className="flex flex-wrap gap-1">
            {user.qualifications.slice(0, 2).map((q, idx) => (
              <span key={idx} className="text-[9px] bg-white text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-bold shadow-sm">
                {q}
              </span>
            ))}
            {user.qualifications.length > 2 && <span className="text-[9px] text-slate-500">...</span>}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Hammer
} from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Users, label: 'Handymen', path: '/admin/handymen' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: ShieldCheck, label: 'Verifications', path: '/admin/verifications' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-screen sticky top-0 flex flex-col text-slate-400">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center">
          <Hammer className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-white font-black text-lg leading-tight"><span className="text-[#F59E0B]">M</span>3ALLEM</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
              location.pathname === item.path 
                ? "bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/20" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-sm hover:bg-slate-800 hover:text-white transition-all">
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <Link to="/" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-sm text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut className="w-5 h-5" />
          Exit Admin
        </Link>
      </div>
    </aside>
  );
};

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, icon: Icon, count, onClick, className }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#F59E0B]/30 transition-all duration-300 group text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/10 transition-colors">
        <Icon className="w-7 h-7 text-slate-600 group-hover:text-[#F59E0B] transition-colors" />
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{name}</h3>
      {count !== undefined && (
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{count} Professionals</p>
      )}
    </button>
  );
};

import React from 'react';
import { Wrench } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className, iconOnly = false, variant = 'dark' }) => {
  return (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      {/* Icon Part */}
      <div className={cn(
        "relative w-11 h-11 flex items-center justify-center rounded-[14px] transition-all duration-500",
        "bg-gradient-to-br from-[#1E3A8A] to-[#162a63] group-hover:from-[#F59E0B] group-hover:to-[#d97706] group-hover:rotate-[10deg]",
        "shadow-lg shadow-[#1E3A8A]/20 group-hover:shadow-[#F59E0B]/30 group-hover:scale-110"
      )}>
        <Wrench className="w-6 h-6 text-white group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />
        {/* Subtle accent dot */}
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#F59E0B] rounded-full border-[2.5px] border-white group-hover:bg-[#1E3A8A] transition-colors duration-500 shadow-sm" />
      </div>

      {/* Text Part */}
      {!iconOnly && (
        <div className="flex flex-col -space-y-1.5">
          <span className={cn(
            "text-2xl font-display font-black tracking-tight transition-colors duration-500",
            variant === 'dark' ? "text-slate-900" : "text-white"
          )}>
            <span className="text-[#F59E0B]">B</span>REKOUL
          </span>
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "h-[1px] w-4 transition-all duration-500 group-hover:w-8",
              variant === 'dark' ? "bg-slate-300" : "bg-white/30"
            )} />
            <span className={cn(
              "text-[10px] font-bold tracking-wider opacity-60",
              variant === 'dark' ? "text-slate-500" : "text-white/70"
            )}>
              بريكول
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Star, CheckCircle, MessageCircle, Phone } from 'lucide-react';
import { Handyman } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { translations } from '../locales/ar';

interface HandymanCardProps {
  handyman: Handyman;
  className?: string;
}

export const HandymanCard: React.FC<HandymanCardProps> = ({ handyman, className }) => {
  const whatsappUrl = `https://wa.me/${handyman.whatsapp_number.replace(/\D/g, '')}`;
  const t = translations.common;
  const cats = translations.categories;

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group text-right",
      className
    )}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={handyman.avatar_url || `https://picsum.photos/seed/${handyman.id}/400/300`} 
          alt={handyman.full_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {handyman.is_verified && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{t.verifiedPro}</span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-[#1E3A8A] transition-colors">
              {handyman.full_name}
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              {cats[handyman.category as keyof typeof cats] || handyman.category} • {handyman.city}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-700">{handyman.rating}</span>
          </div>
        </div>
        
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
          {handyman.bio}
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Link 
              to={`/profile/${handyman.id}`}
              className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              {t.viewProfile}
            </Link>
            <a 
              href={`tel:${handyman.whatsapp_number}`}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-[#162a63] text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              {t.callNow}
            </a>
          </div>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            {t.contactWhatsApp}
          </a>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Pencil, Clock, MapPin, Star, ShieldCheck } from 'lucide-react';

const ProfileHeader = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Top Section: Dark Blue Banner */}
      <div className="h-48 md:h-60 bg-[#1E3A8A] relative w-full">
        {/* Decorative elements for a senior feel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          {/* Profile Image: Circular Avatar with Overlap */}
          <div className="absolute -bottom-16 md:-bottom-20 right-4 md:right-8">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 h-40 rounded-full border-[6px] md:border-[8px] border-white shadow-2xl overflow-hidden bg-white">
                <img 
                  src="https://picsum.photos/seed/artisan/400/400" 
                  alt="Said Al-Bloumi" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Online status indicator */}
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 border-4 border-white rounded-full shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area: White Background Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 pt-20 md:pt-24 pb-8">
            
            {/* Main Info Section (Right side in RTL) */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900">سعيد البلومي</h1>
                    <ShieldCheck className="w-6 h-6 text-blue-600 fill-blue-50" />
                  </div>
                  <p className="text-slate-500 font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    الدار البيضاء، المغرب
                  </p>
                </div>

                {/* Edit Account Button */}
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 w-full md:w-auto">
                  <Pencil className="w-4 h-4" />
                  <span>تعديل الحساب</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100 text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9 (120 تقييم)</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 text-sm font-bold">
                  <span>كهربائي معتمد</span>
                </div>
              </div>
            </div>

            {/* Sidebar Card (Far right in visual RTL, left side of flex container) */}
            <div className="lg:w-80">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">تفاصيل مهنية</h3>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">الخبرة</p>
                    <p className="text-lg font-black text-slate-900">10 سنوات خبرة</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-bold">المشاريع المكتملة</span>
                    <span className="text-slate-900 font-black">450+</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { HandymanCard } from '../components/HandymanCard';
import { Handyman, Category } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { translations } from '../locales/ar';

const MOCK_PROS: Handyman[] = [
  {
    id: '1',
    full_name: 'Ahmed El Mansouri',
    avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=300&fit=crop',
    category: 'Electricity',
    city: 'Casablanca',
    rating: 4.9,
    review_count: 124,
    is_verified: true,
    subscription_status: 'Premium',
    bio: 'Certified electrician with 10+ years of experience in residential and commercial wiring.',
    whatsapp_number: '+212600000000',
    created_at: '2024-01-01'
  },
  {
    id: '2',
    full_name: 'Youssef Benali',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    category: 'Plumbing',
    city: 'Marrakech',
    rating: 4.8,
    review_count: 89,
    is_verified: true,
    subscription_status: 'Free',
    bio: 'Expert plumber specializing in leak detection, bathroom renovations, and emergency repairs.',
    whatsapp_number: '+212600000001',
    created_at: '2024-02-01'
  },
  {
    id: '3',
    full_name: 'Mustapha Alami',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
    category: 'Construction',
    city: 'Rabat',
    rating: 4.7,
    review_count: 56,
    is_verified: false,
    subscription_status: 'Free',
    bio: 'Professional builder and mason. High-quality construction and renovation services.',
    whatsapp_number: '+212600000002',
    created_at: '2024-03-01'
  },
  {
    id: '4',
    full_name: 'Fatima Zahra',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    category: 'Painting',
    city: 'Casablanca',
    rating: 5.0,
    review_count: 42,
    is_verified: true,
    subscription_status: 'Premium',
    bio: 'Interior design and professional painting services. Bringing color to your home.',
    whatsapp_number: '+212600000003',
    created_at: '2024-03-15'
  },
  {
    id: '5',
    full_name: 'Karim Idrissi',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
    category: 'Carpentry',
    city: 'Tangier',
    rating: 4.6,
    review_count: 28,
    is_verified: true,
    subscription_status: 'Free',
    bio: 'Custom furniture and wood repairs. Traditional and modern Moroccan styles.',
    whatsapp_number: '+212600000004',
    created_at: '2024-03-20'
  }
];

const CATEGORIES: Category[] = ['Electricity', 'Plumbing', 'Construction', 'Painting', 'Carpentry'];
const CITIES = ['Casablanca', 'Marrakech', 'Rabat', 'Tangier', 'Agadir', 'Fes'];

export const Directory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredPros, setFilteredPros] = useState<Handyman[]>(MOCK_PROS);
  const [showFilters, setShowFilters] = useState(false);
  const t = translations.common;
  const cats = translations.categories;

  const q = searchParams.get('q') || '';
  const cat = searchParams.get('cat') || '';
  const city = searchParams.get('city') || '';

  useEffect(() => {
    let results = MOCK_PROS;

    if (q) {
      results = results.filter(p => 
        p.full_name.toLowerCase().includes(q.toLowerCase()) || 
        p.bio.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (cat) {
      results = results.filter(p => p.category === cat);
    }

    if (city) {
      results = results.filter(p => p.city === city);
    }

    setFilteredPros(results);
  }, [q, cat, city]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">قلب على الحريفي ديالك</h1>
          <p className="text-slate-500">كنعرضو {filteredPros.length} حريفي فالمغرب</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="قلب بالسمية ولا بالخدمة..." 
              className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all shadow-sm text-right"
              value={q}
              onChange={(e) => updateFilter('q', e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-5 h-5" />
              فلاتر
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">الفئة</label>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button 
                      onClick={() => updateFilter('cat', '')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        !cat ? "bg-[#1E3A8A] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      الكل
                    </button>
                    {CATEGORIES.map(c => (
                      <button 
                        key={c}
                        onClick={() => updateFilter('cat', c)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                          cat === c ? "bg-[#1E3A8A] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {cats[c as keyof typeof cats] || c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">المدينة</label>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button 
                      onClick={() => updateFilter('city', '')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        !city ? "bg-[#1E3A8A] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      الكل
                    </button>
                    {CITIES.map(c => (
                      <button 
                        key={c}
                        onClick={() => updateFilter('city', c)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                          city === c ? "bg-[#1E3A8A] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {filteredPros.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPros.map((pro, idx) => (
              <motion.div
                key={pro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <HandymanCard handyman={pro} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">ما لقينا حتى حريفي</h3>
            <p className="text-slate-500 mb-8">جرب تبدل الفلاتر ولا الكلمات اللي قلبتي بيهم.</p>
            <button 
              onClick={() => setSearchParams({})}
              className="bg-[#1E3A8A] text-white px-8 py-3 rounded-xl font-bold"
            >
              مسح كاع الفلاتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

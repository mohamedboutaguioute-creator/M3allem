import React, { useState } from 'react';
import { Search, MapPin, Zap, Droplets, Hammer, Paintbrush, ArrowLeft, ShieldCheck, Star, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CategoryCard } from '../components/CategoryCard';
import { HandymanCard } from '../components/HandymanCard';
import { Handyman } from '../types';
import { motion } from 'framer-motion';
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
  }
];

const CATEGORIES = [
  { name: 'Electricity', icon: Zap, count: 450 },
  { name: 'Plumbing', icon: Droplets, count: 380 },
  { name: 'Construction', icon: Hammer, count: 290 },
  { name: 'Painting', icon: Paintbrush, count: 210 },
];

const CITIES = ['Casablanca', 'Marrakech', 'Rabat', 'Tangier', 'Agadir', 'Fes'];

export const Home: React.FC = () => {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();
  const t = translations.common;
  const hero = translations.hero;
  const cats = translations.categories;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/directory?q=${search}&city=${city}`);
  };

  return (
    <div className="flex flex-col min-h-screen text-right">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-[#1E3A8A]/5 skew-x-12 transform -translate-x-1/4" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mr-0 ml-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-sm font-bold mb-6">
                #1 {t.appName} فالمغرب
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                {hero.title}
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                {hero.subtitle}
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSearch}
              className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-2 border border-slate-100"
            >
              <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-l border-slate-100 py-3 md:py-0">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={hero.placeholder} 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 text-right"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center px-4 gap-3 py-3 md:py-0">
                <MapPin className="w-5 h-5 text-slate-400" />
                <select 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-bold appearance-none cursor-pointer text-right"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">{t.allCities}</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button 
                type="submit"
                className="bg-[#1E3A8A] hover:bg-[#162a63] text-white px-8 py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {t.search} <ArrowLeft className="w-4 h-4" />
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">أهم الفئات</h2>
              <p className="text-slate-500 max-w-lg">قلب على الحريفي اللي محتاج ليه فالفئة اللي بغيتي.</p>
            </div>
            <Link to="/directory" className="hidden md:flex items-center gap-2 text-[#1E3A8A] font-bold hover:gap-3 transition-all">
              شوف كاع الفئات <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <CategoryCard 
                  name={cats[cat.name as keyof typeof cats] || cat.name}
                  icon={cat.icon}
                  count={cat.count}
                  onClick={() => navigate(`/directory?cat=${cat.name}`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pros Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">أحسن الحريفية</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">الحريفية اللي عندهم أحسن تقييم فالمغرب، موثوقين ومعقولين.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_PROS.map((pro, idx) => (
              <motion.div
                key={pro.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <HandymanCard handyman={pro} />
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/directory" 
              className="inline-flex items-center gap-2 bg-white border border-slate-200 px-8 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              شوف كاع الحريفية <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-[#1E3A8A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border-4 border-white rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-[#F59E0B]" />
              </div>
              <h3 className="text-xl font-bold mb-3">حريفية موثوقين</h3>
              <p className="text-white/70 text-sm leading-relaxed">كاع الحريفية عندنا كيدوزو من فحص دقيق للهوية والخبرة.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-[#F59E0B]" />
              </div>
              <h3 className="text-xl font-bold mb-3">جودة مضمونة</h3>
              <p className="text-white/70 text-sm leading-relaxed">قرا تقييمات حقيقية من عند ناس جربو الخدمات ديالنا.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-[#F59E0B]" />
              </div>
              <h3 className="text-xl font-bold mb-3">دعم محلي</h3>
              <p className="text-white/70 text-sm leading-relaxed">كنشجعو الحريفية المحليين باش نكبرو الاقتصاد ديالنا مجموعين.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F59E0B] rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 relative">واش نتا حريفي معقول؟</h2>
            <p className="text-white/90 text-xl mb-12 max-w-2xl mx-auto relative">
              انضم لأكبر منصة ديال الحريفية فالمغرب وكبر الخدمة ديالك دابا.
            </p>
            <Link 
              to="/auth?type=pro" 
              className="inline-flex items-center gap-2 bg-white text-[#F59E0B] px-10 py-5 rounded-2xl font-black text-lg hover:shadow-xl transition-all active:scale-[0.98] relative"
            >
              سجل الخدمة ديالك <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { HandymanCard } from '../components/HandymanCard';
import { Handyman, Category } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { translations } from '../locales/ar';
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const CATEGORIES: Category[] = ['Electricity', 'Plumbing', 'Construction', 'Painting', 'Carpentry', 'Plastering', 'Aluminum', 'Tiling'];
const CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Meknes', 
  'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Mohammedia', 'Khouribga', 'El Jadida', 
  'Beni Mellal', 'Nador', 'Taza', 'Settat', 'Larache', 'Ksar El Kebir', 'Guelmim', 
  'Khemisset', 'Berrechid', 'Ouarzazate', 'Tiznit', 'Taroudant', 'Essaouira'
];

const SPECIALTIES = [
  { ar: "رصاص", fr: "Plombier", value: "Plumbing" },
  { ar: "كهربائي", fr: "Électricien", value: "Electricity" },
  { ar: "جباص", fr: "Plâtrier", value: "Plastering" },
  { ar: "صباغ", fr: "Peintre", value: "Painting" },
  { ar: "نجار", fr: "Menuisier", value: "Carpentry" },
  { ar: "بناء", fr: "Maçon", value: "Construction" },
  { ar: "معلم ألمنيوم", fr: "Menuisier Aluminium", value: "Aluminum" },
  { ar: "زلايجي", fr: "Carreleur", value: "Tiling" }
];

export const Directory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allPros, setAllPros] = useState<Handyman[]>([]);
  const [filteredPros, setFilteredPros] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof SPECIALTIES>([]);
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');
  const [localCat, setLocalCat] = useState(searchParams.get('cat') || '');
  const [localCity, setLocalCity] = useState(searchParams.get('city') || '');
  const [localVerified, setLocalVerified] = useState(searchParams.get('verified') === 'true');
  const t = translations.common;
  const cats = translations.categories;

  const q = searchParams.get('q') || '';
  const cat = searchParams.get('cat') || '';
  const city = searchParams.get('city') || '';
  const verifiedOnly = searchParams.get('verified') === 'true';

  useEffect(() => {
    const q = query(
      collection(db, 'users'), 
      where('isPublished', '==', true),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pros = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          full_name: data.displayName || '',
          email: data.email || '',
          avatar_url: data.avatar_url || '',
          category: data.category || 'Electricity',
          city: data.city || '',
          rating: data.rating || 0,
          review_count: data.review_count || 0,
          is_verified: data.is_verified || false,
          is_searchable: data.is_searchable || false,
          isProfileComplete: data.isProfileComplete || false,
          isPublished: data.isPublished || false,
          status: data.status || 'inactive',
          subscription_status: data.subscription_status || 'Free',
          bio: data.bio || '',
          whatsapp_number: data.whatsapp_number || '',
          phone_number: data.phone_number || '',
          created_at: data.createdAt || '',
          years_of_experience: data.years_of_experience || 0,
          skills: data.skills || [],
          facebook_url: data.facebook_url || '',
          address: data.address || '',
          zipcode: data.zipcode || '',
          price: data.price || 0,
          search_keywords: data.search_keywords || []
        } as Handyman;
      });

      // Sort by verified first, then by rating
      const sortedPros = pros.sort((a, b) => {
        if (a.is_verified !== b.is_verified) {
          return a.is_verified ? -1 : 1;
        }
        return (b.rating || 0) - (a.rating || 0);
      });

      setAllPros(sortedPros);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching pros:', error);
      handleFirestoreError(error, OperationType.GET, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLocalSearch(q);
  }, [q]);

  useEffect(() => {
    if (localSearch.trim().length > 0) {
      const filtered = SPECIALTIES.filter(s => 
        s.ar.toLowerCase().includes(localSearch.toLowerCase()) || 
        s.fr.toLowerCase().includes(localSearch.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [localSearch]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-amber-100 text-amber-900 font-black">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  useEffect(() => {
    let results = allPros;

    if (q) {
      const searchTerms = q.toLowerCase().split(' ').filter(t => t.length > 0);
      results = results.filter(p => {
        const nameMatch = p.full_name.toLowerCase().includes(q.toLowerCase());
        const bioMatch = p.bio.toLowerCase().includes(q.toLowerCase());
        const categoryMatch = p.category.toLowerCase().includes(q.toLowerCase());
        const cityMatch = p.city.toLowerCase().includes(q.toLowerCase());
        
        // Match against specialties (Arabic and French)
        const specialtyMatch = SPECIALTIES.some(s => 
          (s.ar.includes(q) || s.fr.toLowerCase().includes(q.toLowerCase())) && 
          p.category === s.value
        );

        const keywordMatch = searchTerms.every(term => 
          p.search_keywords?.some(kw => kw.toLowerCase().includes(term)) ||
          p.skills?.some(skill => skill.toLowerCase().includes(term))
        );
        
        return nameMatch || bioMatch || categoryMatch || cityMatch || specialtyMatch || keywordMatch;
      });
    }

    if (cat) {
      results = results.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }

    if (city) {
      results = results.filter(p => p.city === city);
    }

    if (verifiedOnly) {
      results = results.filter(p => p.is_verified);
    }

    setFilteredPros(results);
  }, [q, cat, city, verifiedOnly, allPros]);

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    if (localSearch) newParams.set('q', localSearch);
    if (localCat) newParams.set('cat', localCat);
    if (localCity) newParams.set('city', localCity);
    if (localVerified) newParams.set('verified', 'true');
    setSearchParams(newParams);
    setShowSuggestions(false);
  };

  const updateFilter = (key: string, value: string | boolean) => {
    if (key === 'cat') setLocalCat(String(value));
    if (key === 'city') setLocalCity(String(value));
    if (key === 'verified') setLocalVerified(Boolean(value));
    if (key === 'q') setLocalSearch(String(value));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">قلب على الحريفي ديالك</h1>
          <p className="text-slate-500">كنعرضو {filteredPros.length} حريفي فالمغرب</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 relative z-50">
          <div className="flex-1 relative z-20">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="قلب بالسمية ولا بالخدمة..." 
              className="w-full pr-12 pl-12 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all shadow-sm text-right font-bold"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                // Debounce URL update or update on enter/blur
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              onFocus={() => localSearch.trim().length > 0 && setShowSuggestions(true)}
            />
            {localSearch && (
              <button 
                onClick={() => {
                  setLocalSearch('');
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                >
                  <div className="p-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLocalCat(s.value);
                          setLocalSearch(s.ar);
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all text-right group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors uppercase tracking-wider">
                            {highlightText(s.fr, localSearch)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-900 font-bold">
                            {highlightText(s.ar, localSearch)}
                          </span>
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                            <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {showSuggestions && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowSuggestions(false)}
              />
            )}
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
            <button 
              onClick={handleSearch}
              className="bg-[#1E3A8A] hover:bg-[#162a63] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
            >
              بحث <Search className="w-5 h-5" />
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
                      onClick={() => setLocalCat('')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        !localCat ? "bg-[#1E3A8A] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      الكل
                    </button>
                    {CATEGORIES.map(c => (
                      <button 
                        key={c}
                        onClick={() => setLocalCat(c)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                          localCat === c ? "bg-[#1E3A8A] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
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
                      onClick={() => setLocalCity('')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        !localCity ? "bg-[#1E3A8A] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      الكل
                    </button>
                    {CITIES.map(c => (
                      <button 
                        key={c}
                        onClick={() => setLocalCity(c)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                          localCity === c ? "bg-[#1E3A8A] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                  <label className="flex items-center justify-end gap-3 cursor-pointer group">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#1E3A8A] transition-colors">عرض الحريفية الموثوقين فقط</span>
                    <button 
                      onClick={() => setLocalVerified(!localVerified)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        localVerified ? "bg-emerald-500" : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        localVerified ? "right-1" : "right-7"
                      )} />
                    </button>
                  </label>
                </div>

                <div className="md:col-span-2 pt-6 flex justify-center">
                  <button 
                    onClick={handleSearch}
                    className="bg-[#F59E0B] hover:bg-[#d97706] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-lg shadow-amber-900/20 transition-all active:scale-[0.98]"
                  >
                    تطبيق الفلاتر
                  </button>
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

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, MessageCircle, ArrowLeft, Calendar, Shield, Award, Image as ImageIcon, Phone, Mail, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { Handyman, Review } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [handyman, setHandyman] = useState<Handyman | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'professionals_public', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHandyman({
            id: docSnap.id,
            full_name: data.fullName || '',
            avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800&h=800&fit=crop',
            category: data.speciality || 'General',
            city: data.city || '',
            rating: data.rating || 0,
            review_count: data.review_count || 0,
            is_verified: data.isVerified || false,
            subscription_status: data.subscription_status || 'Free',
            bio: data.bio || '',
            whatsapp_number: data.whatsapp_number || '',
            portfolio_images: data.portfolio_images || [],
            created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            years_of_experience: data.years_of_experience || 0,
            skills: data.skills || [],
            facebook_url: data.facebook_url || '',
            price: data.price || 0
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!handyman) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-right" dir="rtl">
        <h2 className="text-2xl font-black mb-4">الحريفي غير موجود</h2>
        <Link to="/directory" className="text-[#1E3A8A] font-bold">الرجوع للدليل</Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${handyman.whatsapp_number.replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-right" dir="rtl">
      {/* Header / Cover */}
      <div className="h-64 bg-[#1E3A8A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          <div className="absolute -bottom-20 right-4 sm:right-8 left-4 sm:left-8 flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] border-4 border-white overflow-hidden shadow-2xl bg-white">
              <img 
                src={handyman.avatar_url} 
                alt={handyman.full_name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 pb-4 text-center md:text-right">
              <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-2 md:gap-4 mb-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                  {handyman.full_name}
                  {handyman.is_verified && (
                    <div className="group relative">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                      <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        حريفي موثق
                      </div>
                    </div>
                  )}
                </h1>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-bold uppercase tracking-wider text-sm">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                  {handyman.category}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  {handyman.city}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-slate-900 font-black">{handyman.rating}</span>
                  <span className="text-xs">({handyman.review_count} تقييم)</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto pb-4">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <MessageCircle className="w-7 h-7 fill-white" />
                تواصل فواتساب
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Bio */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                نبذة مهنية
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {handyman.bio || "مازال ما ضاف حتى نبذة."}
              </p>
            </section>

            {/* Skills */}
            {handyman.skills && handyman.skills.length > 0 && (
              <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  المهارات والتخصصات
                </h2>
                <div className="flex flex-wrap gap-3">
                  {handyman.skills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio */}
            {handyman.portfolio_images && handyman.portfolio_images.length > 0 && (
              <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  معرض الأعمال
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {handyman.portfolio_images.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="aspect-square rounded-3xl overflow-hidden border border-slate-100 shadow-sm"
                    >
                      <img 
                        src={img} 
                        alt={`عمل ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-black text-slate-900 mb-8">تفاصيل الحريفي</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 rounded-[1.25rem] flex items-center justify-center">
                    <Clock className="w-7 h-7 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">الخبرة</p>
                    <p className="font-black text-slate-900 text-lg">{handyman.years_of_experience || 0}+ سنوات</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center">
                    <Shield className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">التوثيق</p>
                    <p className="font-black text-slate-900 text-lg">{handyman.is_verified ? 'حريفي موثق' : 'قيد التوثيق'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-50 rounded-[1.25rem] flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">ثمن الخدمة</p>
                    <p className="font-black text-slate-900 text-lg">{handyman.price || 0} درهم/ساعة</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 space-y-4">
                <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                  محتاج استشارة أو ثمن محدد؟ تواصل مع {handyman.full_name.split(' ')[0]} دابا فواتساب.
                </p>
                <a 
                  href={`tel:${handyman.whatsapp_number}`}
                  className="w-full flex items-center justify-center gap-3 bg-[#1E3A8A] text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <Phone className="w-6 h-6" /> اتصل الآن
                </a>
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-6 h-6 fill-white" /> واتساب
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

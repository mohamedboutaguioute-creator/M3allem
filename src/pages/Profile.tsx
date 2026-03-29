import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, MessageCircle, ArrowLeft, Calendar, Shield, Award, Image as ImageIcon, Phone, Mail, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { Handyman, Review } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ReviewSystem } from '../components/ReviewSystem';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [handyman, setHandyman] = useState<Handyman | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHandyman({
            id: docSnap.id,
            full_name: data.displayName || '',
            email: data.email || '',
            avatar_url: data.avatar_url || '',
            category: data.category || 'Electricity',
            city: data.city || '',
            rating: data.rating || 0,
            review_count: data.review_count || 0,
            is_verified: data.is_verified || false,
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
            price: data.price || 0
          } as Handyman);
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
      <div className="h-80 bg-[#1E3A8A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-amber-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative flex items-end pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full">
            {/* Profile Image */}
            <div className="relative z-20 shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-8 border-white/10 overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm">
                <img 
                  src={handyman.avatar_url} 
                  alt={handyman.full_name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {handyman.is_verified && (
                <div className="absolute -bottom-2 -left-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-xl border-4 border-[#1E3A8A] z-30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-right space-y-4 z-20">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-sm">
                  {handyman.full_name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/80 font-bold uppercase tracking-wider text-sm">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                    <Award className="w-4 h-4 text-[#F59E0B]" />
                    {handyman.category}
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                    <MapPin className="w-4 h-4 text-[#F59E0B]" />
                    {handyman.city}
                  </div>
                  <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl backdrop-blur-md border border-amber-500/20">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="font-black">{handyman.rating}</span>
                    <span className="text-xs opacity-70">({handyman.review_count} تقييم)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 z-20 w-full md:w-auto">
              <div className="flex flex-col sm:flex-row md:flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-green-900/20 hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <MessageCircle className="w-6 h-6 fill-white" />
                    تواصل فواتساب
                  </a>
                  {handyman.whatsapp_number && (
                    <span className="text-white/80 text-sm font-bold tracking-widest" dir="ltr">
                      {handyman.whatsapp_number}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <a 
                    href={`tel:${handyman.phone_number}`}
                    className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-lg transition-all backdrop-blur-md hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <Phone className="w-6 h-6" />
                    اتصل دابا
                  </a>
                  {handyman.phone_number && (
                    <span className="text-white/80 text-sm font-bold tracking-widest" dir="ltr">
                      {handyman.phone_number}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
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

            {/* Reviews */}
            <section id="reviews">
              <ReviewSystem artisanId={handyman.id} artisanName={handyman.full_name} />
            </section>
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

              <div className="mt-10 pt-8 border-t border-slate-100 space-y-6">
                <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                  محتاج استشارة أو ثمن محدد؟ تواصل مع {handyman.full_name.split(' ')[0]} دابا فواتساب.
                </p>
                <div className="flex flex-col items-center gap-2">
                  <a 
                    href={`tel:${handyman.phone_number}`}
                    className="w-full flex items-center justify-center gap-3 bg-[#1E3A8A] text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                  >
                    <Phone className="w-6 h-6" /> اتصل الآن
                  </a>
                  {handyman.phone_number && (
                    <span className="text-slate-500 text-sm font-bold tracking-widest" dir="ltr">
                      {handyman.phone_number}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                  >
                    <MessageCircle className="w-6 h-6 fill-white" /> واتساب
                  </a>
                  {handyman.whatsapp_number && (
                    <span className="text-slate-500 text-sm font-bold tracking-widest" dir="ltr">
                      {handyman.whatsapp_number}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

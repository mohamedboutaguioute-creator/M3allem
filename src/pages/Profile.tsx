import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, MessageCircle, ArrowLeft, Calendar, Shield, Award, Image as ImageIcon } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Professional not found</h2>
        <Link to="/directory" className="text-[#1E3A8A] font-bold">Back to Directory</Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${handyman.whatsapp_number.replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header / Cover */}
      <div className="h-48 bg-[#1E3A8A] relative">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white overflow-hidden shadow-xl bg-white">
              <img 
                src={handyman.avatar_url} 
                alt={handyman.full_name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 pb-2 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{handyman.full_name}</h1>
                {handyman.is_verified && (
                  <div className="flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                    <CheckCircle className="w-3 h-3 fill-emerald-500 text-white" />
                    Verified Pro
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium">
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
                  <span className="text-slate-900 font-bold">{handyman.rating}</span>
                  <span>({handyman.review_count} reviews)</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto pb-2">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <MessageCircle className="w-6 h-6 fill-white" />
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Bio */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                About Me
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                {handyman.bio || "No bio provided yet."}
              </p>
            </section>

            {/* Skills */}
            {handyman.skills && handyman.skills.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  Skills & Specializations
                </h2>
                <div className="flex flex-wrap gap-3 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
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
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  Work Portfolio
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {handyman.portfolio_images.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                    >
                      <img 
                        src={img} 
                        alt={`Work ${idx + 1}`} 
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
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-black text-slate-900 mb-6">Quick Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                    <p className="font-bold text-slate-900">{handyman.years_of_experience || 0}+ Years</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verification</p>
                    <p className="font-bold text-slate-900">{handyman.is_verified ? 'Identity Verified' : 'Pending Verification'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Service Price</p>
                    <p className="font-bold text-slate-900">{handyman.price || 0} DH/hr</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Need a custom quote? Message {handyman.full_name.split(' ')[0]} directly on WhatsApp for a free consultation.
                </p>
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  Send a Message
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

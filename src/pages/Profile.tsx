import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, MessageCircle, ArrowLeft, Calendar, Shield, Award, Image as ImageIcon } from 'lucide-react';
import { Handyman, Review } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const MOCK_PROS: Record<string, Handyman> = {
  '1': {
    id: '1',
    full_name: 'Ahmed El Mansouri',
    avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800&h=800&fit=crop',
    category: 'Electricity',
    city: 'Casablanca',
    rating: 4.9,
    review_count: 124,
    is_verified: true,
    subscription_status: 'Premium',
    bio: 'Certified electrician with 10+ years of experience in residential and commercial wiring. I specialize in smart home installations, electrical panel upgrades, and emergency troubleshooting. My goal is to provide safe, efficient, and reliable electrical solutions for your home or business.',
    whatsapp_number: '+212600000000',
    created_at: '2024-01-01',
    portfolio_images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558227691-41ea78d1f631?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1565004814542-815006655cd7?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop'
    ]
  }
};

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    handyman_id: '1',
    customer_name: 'Sara K.',
    rating: 5,
    comment: 'Ahmed was very professional and fixed our electrical issue in no time. Highly recommended!',
    created_at: '2024-03-15'
  },
  {
    id: 'r2',
    handyman_id: '1',
    customer_name: 'Omar D.',
    rating: 4,
    comment: 'Great service, arrived on time. A bit expensive but worth the quality.',
    created_at: '2024-03-10'
  }
];

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const handyman = id ? MOCK_PROS[id] : null;

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
                {handyman.bio}
              </p>
            </section>

            {/* Portfolio */}
            {handyman.portfolio_images && (
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

            {/* Reviews */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  Customer Reviews
                </h2>
                <button className="text-[#1E3A8A] font-bold text-sm hover:underline">Write a Review</button>
              </div>
              <div className="space-y-4">
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                          {review.customer_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{review.customer_name}</p>
                          <p className="text-xs text-slate-400">{review.created_at}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-4 h-4", 
                              i < review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
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
                    <p className="font-bold text-slate-900">10+ Years</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verification</p>
                    <p className="font-bold text-slate-900">Identity Verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Portfolio</p>
                    <p className="font-bold text-slate-900">24 Projects Completed</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Need a custom quote? Message Ahmed directly on WhatsApp for a free consultation.
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

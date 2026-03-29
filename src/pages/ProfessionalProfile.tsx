import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, 
  Award, Image as ImageIcon, Edit2, Save, X, Plus, Trash2, 
  CheckCircle, MessageCircle, Facebook, Globe, ExternalLink, Camera,
  LogOut, Star, DollarSign, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { ReviewSystem } from '../components/ReviewSystem';
import { 
  collection, 
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '../lib/utils';
import { Handyman } from '../types';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Meknes', 
  'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Mohammedia', 'Khouribga', 'El Jadida', 
  'Beni Mellal', 'Nador', 'Taza', 'Settat', 'Larache', 'Ksar El Kebir', 'Guelmim', 
  'Khemisset', 'Berrechid', 'Ouarzazate', 'Tiznit', 'Taroudant', 'Essaouira'
];

const CITY_COORDINATES: Record<string, [number, number]> = {
  'الدار البيضاء': [33.5731, -7.5898],
  'الرباط': [34.0209, -6.8416],
  'سلا': [34.0333, -6.8333],
  'مراكش': [31.6295, -7.9811],
  'فاس': [34.0181, -5.0078],
  'طنجة': [35.7595, -5.8340],
  'أكادير': [30.4278, -9.5981],
  'مكناس': [33.8935, -5.5473],
  'وجدة': [34.6805, -1.9077],
  'القنيطرة': [34.2610, -6.5802],
  'تطوان': [35.5785, -5.3684],
  'آسفي': [32.2994, -9.2372],
  'الجديدة': [33.2316, -8.5007],
  'الناظور': [35.1681, -2.9335],
  'سطات': [33.0010, -7.6166],
  'المحمدية': [33.6835, -7.3849],
  'خريبكة': [32.8810, -6.9063],
  'بني ملال': [32.3373, -6.3498],
  'تمارة': [33.9236, -6.9111],
  'العيون': [27.1253, -13.1625],
  'تازة': [34.2167, -4.0167],
  'تارودانت': [30.4703, -8.8770],
  'القصر الكبير': [35.0000, -5.9000],
  'العرائش': [35.1833, -6.1500],
  'كلميم': [28.9833, -10.0667],
  'برشيد': [33.2667, -7.5833],
  'الفقيه بن صالح': [32.5000, -6.6833],
  'تاوريرت': [34.4167, -2.9000],
  'بركان': [34.9167, -2.3167],
  'سيدي سليمان': [34.2600, -5.9200],
  'الرشيدية': [31.9319, -4.4244],
  'سيدي قاسم': [34.2200, -5.7000],
  'خنيفرة': [32.9394, -5.6681],
  'تيفلت': [33.8944, -6.3144],
  'الصويرة': [31.5085, -9.7595],
  'تيزنيت': [29.6974, -9.7316],
  'ورزازات': [30.9189, -6.8934],
  'الخميسات': [33.8167, -6.0667],
  'Casablanca': [33.5731, -7.5898],
  'Rabat': [34.0209, -6.8416],
  'Marrakech': [31.6295, -7.9811],
  'Tangier': [35.7595, -5.8340],
  'Agadir': [30.4278, -9.5981],
  'Fes': [34.0181, -5.0078],
  'Meknes': [33.8935, -5.5473],
  'Oujda': [34.6805, -1.9077],
  'Kenitra': [34.2610, -6.5802],
  'Tetouan': [35.5785, -5.3684],
  'Safi': [32.2994, -9.2372],
  'Mohammedia': [33.6835, -7.3849],
  'Khouribga': [32.8810, -6.9063],
  'El Jadida': [33.2316, -8.5007],
  'Beni Mellal': [32.3373, -6.3498],
  'Nador': [35.1681, -2.9335],
  'Taza': [34.2167, -4.0167],
  'Settat': [33.0010, -7.6166],
  'Larache': [35.1833, -6.1500],
  'Ksar El Kebir': [35.0000, -5.9000],
  'Guelmim': [28.9833, -10.0667],
  'Berrechid': [33.2667, -7.5833],
  'Ouarzazate': [30.9189, -6.8934],
  'Tiznit': [29.6974, -9.7316],
  'Taroudant': [30.4703, -8.8770],
  'Essaouira': [31.5085, -9.7595],
  'Khemisset': [33.8167, -6.0667],
};

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
};

export const ProfessionalProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Handyman | null>(null);
  const [editData, setEditData] = useState<Partial<Handyman>>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Sync user profile to Firestore if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        try {
          const initialProfile = {
            displayName: user.displayName || 'حريفي جديد',
            email: user.email,
            plan: 'Free',
            role: 'pro',
            createdAt: new Date().toISOString(),
            avatar_url: user.photoURL || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800&h=800&fit=crop',
            category: 'Electricity',
            city: 'Casablanca',
            rating: 0,
            review_count: 0,
            is_verified: false,
            is_searchable: false,
            search_keywords: [],
            subscription_status: 'Free',
            bio: '',
            whatsapp_number: '',
            phone_number: '',
            diploma_title: '',
            diploma_url: '',
            portfolio_images: [],
            years_of_experience: 0,
            skills: [],
            facebook_url: '',
            address: '',
            zipcode: '',
            price: 0
          };
          await setDoc(userRef, initialProfile);
          userSnap = await getDoc(userRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }

      const userData = userSnap?.data() || {};
      const profileData: Handyman = {
        id: user.uid,
        full_name: userData.displayName || user.displayName || 'حريفي جديد',
        email: userData.email || user.email || '',
        avatar_url: userData.avatar_url || user.photoURL || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800&h=800&fit=crop',
        category: userData.category || 'Electricity',
        city: userData.city || 'Casablanca',
        rating: userData.rating || 0,
        review_count: userData.review_count || 0,
        is_verified: userData.is_verified || false,
        is_searchable: userData.is_searchable || false,
        isProfileComplete: userData.isProfileComplete || false,
        subscription_status: userData.subscription_status || 'Free',
        bio: userData.bio || '',
        whatsapp_number: userData.whatsapp_number || '',
        phone_number: userData.phone_number || '',
        portfolio_images: userData.portfolio_images || [],
        created_at: userData.createdAt || new Date().toISOString(),
        years_of_experience: userData.years_of_experience || 0,
        skills: userData.skills || [],
        facebook_url: userData.facebook_url || '',
        address: userData.address || '',
        zipcode: userData.zipcode || '',
        price: userData.price || 0
      };

      setProfile(profileData);
      setEditData(profileData);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, [navigate]);

  const handleSave = async () => {
    if (!auth.currentUser || !profile) return;
    setSaving(true);

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const isProfileComplete = !!(
        editData.full_name && 
        editData.category && 
        editData.city && 
        editData.bio && 
        editData.bio.length > 20 &&
        (editData.whatsapp_number || editData.phone_number) &&
        editData.portfolio_images && editData.portfolio_images.length > 0
      );

      const isSearchable = isProfileComplete;

      // Generate search keywords
      const keywords = new Set<string>();
      if (editData.full_name) {
        editData.full_name.toLowerCase().split(' ').forEach(word => {
          if (word.length > 1) keywords.add(word);
        });
      }
      if (editData.category) keywords.add(editData.category.toLowerCase());
      if (editData.city) keywords.add(editData.city.toLowerCase());
      if (editData.skills) {
        editData.skills.forEach(skill => keywords.add(skill.toLowerCase()));
      }

      const updatePayload = {
        displayName: editData.full_name,
        email: editData.email,
        avatar_url: editData.avatar_url,
        category: editData.category,
        city: editData.city,
        bio: editData.bio,
        whatsapp_number: editData.whatsapp_number,
        phone_number: editData.phone_number,
        portfolio_images: editData.portfolio_images,
        years_of_experience: editData.years_of_experience,
        skills: editData.skills,
        facebook_url: editData.facebook_url,
        address: editData.address,
        zipcode: editData.zipcode,
        price: editData.price,
        is_searchable: isSearchable,
        isProfileComplete: isProfileComplete,
        isPublished: true,
        status: 'active',
        search_keywords: Array.from(keywords)
      };

      await setDoc(userRef, updatePayload, { merge: true });
      setProfile({ ...profile, ...editData, is_searchable: isSearchable, isProfileComplete: isProfileComplete } as Handyman);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Placeholder for actual Firebase Storage upload
      const url = URL.createObjectURL(file);
      setEditData({ ...editData, avatar_url: url });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Placeholder for actual Firebase Storage upload
      const url = URL.createObjectURL(file);
      setEditData({ 
        ...editData, 
        portfolio_images: [...(editData.portfolio_images || []), url] 
      });
    } catch (error) {
      console.error('Error uploading portfolio image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolioImage = (imageUrl: string) => {
    setEditData({
      ...editData,
      portfolio_images: editData.portfolio_images?.filter(img => img !== imageUrl)
    });
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (editData.skills?.includes(newSkill.trim())) {
      setNewSkill('');
      return;
    }
    setEditData({
      ...editData,
      skills: [...(editData.skills || []), newSkill.trim()]
    });
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setEditData({
      ...editData,
      skills: editData.skills?.filter(skill => skill !== skillToRemove)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-right" dir="rtl">
      {/* Header / Cover */}
      <div className="h-64 bg-[#1E3A8A] relative z-20">
        {/* Background Decorative Elements - Moved to a separate overflow-hidden container */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          <div className="absolute -bottom-16 md:-bottom-24 left-1/2 -translate-x-1/2 z-50">
            {/* Profile Image with Upload Overlay */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-white overflow-hidden shadow-2xl bg-white relative z-10 transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={isEditing ? editData.avatar_url : profile.avatar_url} 
                  alt={profile.full_name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {(isEditing || uploading) && (
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-20">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-white mb-2" />
                        <span className="text-white text-xs font-bold">تغيير الصورة</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                )}
              </div>
              
              {/* Verified Badge */}
              {profile.is_verified && (
                <div className="absolute -bottom-2 -left-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-xl border-4 border-white z-30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info Card */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col gap-8">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-end gap-4">
                    {isEditing ? (
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">الاسم الكامل</label>
                        <input 
                          type="text"
                          value={editData.full_name}
                          onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                          className="text-2xl font-black text-[#1E3A8A] bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:border-[#1E3A8A] outline-none w-full"
                          placeholder="الاسم الكامل"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black text-[#1E3A8A] tracking-tight">{profile.full_name}</h1>
                        {profile.is_verified && (
                          <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg shadow-blue-200" title="موثوق">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-[#1E3A8A]">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">المهنة</p>
                        {isEditing ? (
                          <select 
                            value={editData.category}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value as any })}
                            className="bg-transparent border-none outline-none font-black text-[#1E3A8A] text-lg cursor-pointer"
                          >
                            <option value="Electricity">كهربائي</option>
                            <option value="Plumbing">رصاص</option>
                            <option value="Construction">بناء</option>
                            <option value="Painting">صباغ</option>
                            <option value="Carpentry">نجار</option>
                            <option value="Plastering">جباص</option>
                            <option value="Aluminum">معلم ألمنيوم</option>
                            <option value="Tiling">زلايجي</option>
                          </select>
                        ) : (
                          <p className="font-black text-[#1E3A8A] text-lg">
                            {profile.category === 'Electricity' ? 'كهربائي' :
                             profile.category === 'Plumbing' ? 'رصاص' :
                             profile.category === 'Construction' ? 'بناء' :
                             profile.category === 'Painting' ? 'صباغ' :
                             profile.category === 'Carpentry' ? 'نجار' :
                             profile.category === 'Plastering' ? 'جباص' :
                             profile.category === 'Aluminum' ? 'معلم ألمنيوم' :
                             profile.category === 'Tiling' ? 'زلايجي' : profile.category}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">المدينة</p>
                        {isEditing ? (
                          <select 
                            value={editData.city}
                            onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                            className="bg-transparent border-none outline-none font-black text-[#1E3A8A] text-lg cursor-pointer"
                          >
                            {CITIES.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="font-black text-[#1E3A8A] text-lg">{profile.city}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                        <div className="flex items-center ml-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= (profile.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-amber-700 font-black text-sm">{profile.rating || 5.0}</span>
                        <span className="text-slate-400 font-bold text-xs mr-2">({profile.review_count || 0} تقييم)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 bg-blue-50 text-[#1E3A8A] px-5 py-3 rounded-2xl border border-blue-100 shadow-sm">
                        <Phone className="w-5 h-5" />
                        {isEditing ? (
                          <input 
                            type="tel"
                            value={editData.phone_number}
                            onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                            className="bg-transparent border-none outline-none font-black text-lg w-32"
                            placeholder="06XXXXXXXX"
                          />
                        ) : (
                          <span className="font-black text-lg tracking-wider" dir="ltr">
                            {profile.phone_number ? profile.phone_number.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5') : 'غير متوفر'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full px-6 py-4 bg-[#1E3A8A] text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 border-2 border-white/20"
                    >
                      <Edit2 className="w-5 h-5" />
                      تعديل الحساب
                    </button>
                    <button 
                      onClick={() => auth.signOut()}
                      className="w-full px-6 py-4 bg-white text-red-600 rounded-2xl font-black shadow-lg hover:bg-red-50 transition-all border-2 border-red-50 flex items-center justify-center gap-3"
                    >
                      <LogOut className="w-5 h-5" />
                      خروج
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Bio Section */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                نبذة مهنية وشخصية
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea 
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    rows={6}
                    className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-3xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none resize-none text-slate-600 leading-relaxed text-right"
                    placeholder="وصف خبرتك والخدمات اللي كتقدم..."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">سنوات الخبرة</label>
                      <input 
                        type="number"
                        value={editData.years_of_experience}
                        onChange={(e) => setEditData({ ...editData, years_of_experience: Number(e.target.value) })}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none text-right"
                        placeholder="مثال: 5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">العنوان الكامل</label>
                      <input 
                        type="text"
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none text-right"
                        placeholder="العنوان (مثال: حي المعاريف، شارع...)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">الرمز البريدي</label>
                      <input 
                        type="text"
                        value={editData.zipcode}
                        onChange={(e) => setEditData({ ...editData, zipcode: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none text-right"
                        placeholder="الرمز البريدي"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {profile.bio || "مازال ما ضفتي حتى نبذة. ضغط على تعديل باش تعرف الزبناء بيك!"}
                  </p>
                  {profile.address && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.address} {profile.zipcode && `- ${profile.zipcode}`}</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Skills Section */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                المهارات والتخصصات
              </h2>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {(isEditing ? editData.skills : profile.skills)?.map((skill, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm border border-slate-100 group"
                  >
                    {skill}
                    {isEditing && (
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-3">
                  <input 
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="ضيف مهارة (مثال: تركيب ألواح شمسية)"
                    className="flex-1 px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none text-right"
                  />
                  <button 
                    onClick={addSkill}
                    className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              )}
            </section>

            {/* Portfolio Section (Previous Projects Gallery) */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  مشاريع سابقة (معرض الأعمال)
                </h2>
                {isEditing && (
                  <label className="text-[#1E3A8A] font-bold flex items-center gap-2 hover:underline cursor-pointer">
                    <Plus className="w-4 h-4" /> إضافة صور
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePortfolioUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(isEditing ? editData.portfolio_images : profile.portfolio_images)?.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-3xl overflow-hidden border border-slate-100 relative group">
                    <img 
                      src={img} 
                      alt={`مشروع ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isEditing && (
                      <button 
                        onClick={() => handleDeletePortfolioImage(img)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <label className={cn(
                    "aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all cursor-pointer",
                    uploading && "opacity-50 cursor-not-allowed"
                  )}>
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F59E0B]"></div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">تحميل</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePortfolioUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </section>

            {/* Reviews Section */}
            <section id="reviews">
              <ReviewSystem artisanId={auth.currentUser?.uid || ''} artisanName={profile.full_name} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Core Details Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8">تفاصيل مهنية</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 rounded-[1.25rem] flex items-center justify-center">
                    <Clock className="w-7 h-7 text-[#1E3A8A]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">سنوات الخبرة</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={editData.years_of_experience}
                          onChange={(e) => setEditData({ ...editData, years_of_experience: Number(e.target.value) })}
                          className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-right"
                        />
                        <span className="font-bold text-slate-900">سنة</span>
                      </div>
                    ) : (
                      <p className="font-black text-slate-900 text-lg">{profile.years_of_experience} سنة</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center">
                    <Shield className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">التوثيق</p>
                    <p className="font-black text-slate-900 text-lg">
                      {profile.is_verified ? 'حريفي موثق' : 'قيد التوثيق'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-50 rounded-[1.25rem] flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">ثمن الخدمة</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={editData.price}
                          onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                          className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-right"
                        />
                        <span className="font-bold text-slate-900">درهم/ساعة</span>
                      </div>
                    ) : (
                      <p className="font-black text-slate-900 text-lg">{profile.price} درهم/ساعة</p>
                    )}
                  </div>
                </div>

                {/* Map Section */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">منطقة الخدمة</p>
                  <div className="h-48 rounded-3xl overflow-hidden border border-slate-100 shadow-inner relative z-0">
                    <MapContainer 
                      center={CITY_COORDINATES[profile.city] || [31.7917, -7.0926]} 
                      zoom={12} 
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={CITY_COORDINATES[profile.city] || [31.7917, -7.0926]}>
                        <Popup>
                          <span className="font-bold">{profile.city}</span> <br />
                          منطقة العمل المفضلة
                        </Popup>
                      </Marker>
                      <MapUpdater center={CITY_COORDINATES[isEditing ? editData.city || '' : profile.city] || [31.7917, -7.0926]} />
                    </MapContainer>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center italic">
                    * يتم تحديد الموقع بناءً على المدينة المختارة
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8">التواصل والروابط</h3>
              
              {isEditing ? (
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none text-right"
                        placeholder="example@mail.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="tel"
                        value={editData.phone_number}
                        onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none text-right"
                        placeholder="06XXXXXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">رقم واتساب</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="tel"
                        value={editData.whatsapp_number}
                        onChange={(e) => setEditData({ ...editData, whatsapp_number: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#25D366] focus:bg-white transition-all outline-none text-right"
                        placeholder="06XXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              ) : (
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-3 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 mb-2">
                  <Mail className="w-6 h-6 text-[#1E3A8A]" />
                  <span className="text-[#1E3A8A] font-black text-lg">{profile.email}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <a 
                    href={`tel:${profile.phone_number || profile.whatsapp_number}`}
                    className="w-full flex items-center justify-center gap-3 bg-[#1E3A8A] text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    <Phone className="w-7 h-7" /> اتصل الآن
                  </a>
                  {profile.phone_number && (
                    <span className="text-slate-500 text-sm font-bold tracking-widest" dir="ltr">
                      {profile.phone_number}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <a 
                    href={`https://wa.me/${(profile.whatsapp_number || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-green-200 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    <MessageCircle className="w-7 h-7 fill-white" /> واتساب
                  </a>
                  {profile.whatsapp_number && (
                    <span className="text-slate-500 text-sm font-bold tracking-widest" dir="ltr">
                      {profile.whatsapp_number}
                    </span>
                  )}
                </div>
              </div>
              )}

              <button 
                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <Mail className="w-6 h-6" /> إرسال رسالة
              </button>

              <div className="mt-10 pt-8 border-t border-slate-100 space-y-6">
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">روابط اجتماعية</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editData.facebook_url}
                          onChange={(e) => setEditData({ ...editData, facebook_url: e.target.value })}
                          placeholder="رابط صفحة فيسبوك"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-right"
                        />
                      ) : (
                        <a 
                          href={profile.facebook_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
                        >
                          {profile.facebook_url ? 'صفحة فيسبوك' : 'غير متصل'}
                          {profile.facebook_url && <ExternalLink className="w-3 h-3" />}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button for Profile Editing */}
      {isEditing && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-6 bg-white/80 backdrop-blur-md p-4 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1E3A8A] text-white px-16 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-300 hover:scale-105 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-8 h-8 animate-spin" /> : <Save className="w-8 h-8" />}
            حفظ التغييرات
          </button>
          <button 
            onClick={() => setIsEditing(false)}
            className="bg-white text-slate-600 px-10 py-6 rounded-3xl font-black text-xl shadow-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            إلغاء
          </button>
        </div>
      )}
    </div>
  );
};

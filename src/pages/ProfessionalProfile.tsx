import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, 
  Award, Image as ImageIcon, Edit2, Save, X, Plus, Trash2, 
  CheckCircle, MessageCircle, Facebook, Globe, ExternalLink, Camera,
  LayoutDashboard, LogOut, Star, DollarSign, Clock, CheckCircle2
} from 'lucide-react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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

const CITY_COORDINATES: Record<string, [number, number]> = {
  'Casablanca': [33.5731, -7.5898],
  'Rabat': [34.0209, -6.8416],
  'Marrakech': [31.6295, -7.9811],
  'Fes': [34.0181, -5.0078],
  'Tangier': [35.7595, -5.8340],
  'Agadir': [30.4278, -9.5981],
  'Meknes': [33.8935, -5.5473],
  'Oujda': [34.6805, -1.9077],
  'Kenitra': [34.2610, -6.5802],
  'Tetouan': [35.5785, -5.3684],
  'Safi': [32.2994, -9.2372],
  'El Jadida': [33.2316, -8.5007],
  'Nador': [35.1681, -2.9335],
  'Settat': [33.0010, -7.6166],
  'Mohammedia': [33.6835, -7.3849],
  'Khouribga': [32.8810, -6.9063],
  'Beni Mellal': [32.3373, -6.3498],
  'Temara': [33.9236, -6.9111],
  'Laayoune': [27.1253, -13.1625],
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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Fetch profile data
        const publicRef = doc(db, 'professionals_public', user.uid);
        const privateRef = doc(db, 'professionals_private', user.uid);

        const [publicSnap, privateSnap] = await Promise.all([
          getDoc(publicRef),
          getDoc(privateRef)
        ]);

        if (publicSnap.exists()) {
          const publicData = publicSnap.data();
          const privateData = privateSnap.exists() ? privateSnap.data() : {};
          
          const fullProfile: Handyman = {
            id: user.uid,
            full_name: publicData.fullName || '',
            avatar_url: publicData.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800&h=800&fit=crop',
            category: publicData.speciality || 'General',
            city: publicData.city || '',
            rating: publicData.rating || 0,
            review_count: publicData.review_count || 0,
            is_verified: publicData.isVerified || false,
            subscription_status: publicData.subscription_status || 'Free',
            bio: publicData.bio || '',
            whatsapp_number: publicData.whatsapp_number || '',
            portfolio_images: publicData.portfolio_images || [],
            created_at: publicData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            years_of_experience: publicData.years_of_experience || 0,
            skills: publicData.skills || [],
            facebook_url: publicData.facebook_url || '',
            address: privateData.address || '',
            zipcode: privateData.zipcode || '',
            price: publicData.price || 0
          };

          setProfile(fullProfile);
          setEditData(fullProfile);
        } else {
          navigate('/complete-profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    if (!auth.currentUser || !profile) return;
    setSaving(true);

    try {
      const publicRef = doc(db, 'professionals_public', auth.currentUser.uid);
      const privateRef = doc(db, 'professionals_private', auth.currentUser.uid);

      const publicUpdate = {
        fullName: editData.full_name,
        avatar_url: editData.avatar_url,
        speciality: editData.category,
        city: editData.city,
        bio: editData.bio,
        whatsapp_number: editData.whatsapp_number,
        years_of_experience: Number(editData.years_of_experience),
        skills: editData.skills,
        portfolio_images: editData.portfolio_images,
        facebook_url: editData.facebook_url,
        price: Number(editData.price)
      };

      const privateUpdate = {
        address: editData.address,
        zipcode: editData.zipcode
      };

      await Promise.all([
        updateDoc(publicRef, publicUpdate),
        updateDoc(privateRef, privateUpdate)
      ]);

      setProfile({ ...profile, ...editData } as Handyman);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !editData.skills?.includes(newSkill.trim())) {
      setEditData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skillToRemove)
    }));
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `portfolios/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const newPortfolio = [...(editData.portfolio_images || []), downloadURL];
      setEditData(prev => ({
        ...prev,
        portfolio_images: newPortfolio
      }));

      // Also update the profile state so it shows up immediately if not in edit mode
      // (though usually we are in edit mode when uploading)
      if (!isEditing) {
        const publicRef = doc(db, 'professionals_public', auth.currentUser.uid);
        await updateDoc(publicRef, { portfolio_images: newPortfolio });
        setProfile(prev => prev ? { ...prev, portfolio_images: newPortfolio } : null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolioImage = async (imageUrl: string) => {
    if (!auth.currentUser) return;

    try {
      // 1. Remove from Firestore
      const newPortfolio = (editData.portfolio_images || []).filter(img => img !== imageUrl);
      setEditData(prev => ({
        ...prev,
        portfolio_images: newPortfolio
      }));

      if (!isEditing) {
        const publicRef = doc(db, 'professionals_public', auth.currentUser.uid);
        await updateDoc(publicRef, { portfolio_images: newPortfolio });
        setProfile(prev => prev ? { ...prev, portfolio_images: newPortfolio } : null);
      }

      // 2. Delete from Storage (optional, but good practice)
      // Note: We need to extract the path from the URL or store it. 
      // For now, we'll just remove it from the list.
      // If we want to delete from storage, we'd need the ref.
      // const imageRef = ref(storage, imageUrl);
      // await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setEditData(prev => ({ ...prev, avatar_url: downloadURL }));
      
      if (!isEditing) {
        const publicRef = doc(db, 'professionals_public', auth.currentUser.uid);
        await updateDoc(publicRef, { avatar_url: downloadURL });
        setProfile(prev => prev ? { ...prev, avatar_url: downloadURL } : null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
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
      <div className="h-64 bg-[#1E3A8A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          <div className="absolute -bottom-20 right-4 sm:right-8 left-4 sm:left-8 flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Profile Image with Upload Overlay */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] border-4 border-white overflow-hidden shadow-2xl bg-white">
                <img 
                  src={isEditing ? editData.avatar_url : profile.avatar_url} 
                  alt={profile.full_name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </label>
              )}
            </div>

            <div className="flex-1 pb-4 text-center md:text-right">
              <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-2 md:gap-4 mb-3">
                {isEditing ? (
                  <input 
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="text-3xl font-black text-slate-900 bg-white border-2 border-slate-200 rounded-xl px-4 py-1 outline-none focus:border-[#F59E0B] text-right"
                  />
                ) : (
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                    {profile.full_name}
                    {profile.is_verified && (
                      <div className="group relative">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                        <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          رقم الهاتف مفعل
                        </div>
                      </div>
                    )}
                  </h1>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-bold uppercase tracking-wider text-sm">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                  {isEditing ? (
                    <select 
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value as any })}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-right"
                    >
                      <option value="Electricity">كهرباء</option>
                      <option value="Plumbing">رصاصة</option>
                      <option value="Construction">بناء</option>
                      <option value="Painting">صباغة</option>
                      <option value="Carpentry">نجارة</option>
                    </select>
                  ) : (
                    profile.category
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  {isEditing ? (
                    <input 
                      type="text"
                      value={editData.city}
                      onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-right"
                    />
                  ) : (
                    profile.city
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pb-4 w-full md:w-auto">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    <X className="w-5 h-5" /> إلغاء
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1E3A8A] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    <Save className="w-5 h-5" /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#F59E0B] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <Edit2 className="w-5 h-5" /> تعديل الملف
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Bio Section */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                نبذة مهنية
              </h2>
              {isEditing ? (
                <textarea 
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows={6}
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-3xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none resize-none text-slate-600 leading-relaxed text-right"
                  placeholder="وصف خبرتك والخدمات اللي كتقدم..."
                />
              ) : (
                <p className="text-slate-600 leading-relaxed text-lg">
                  {profile.bio || "مازال ما ضفتي حتى نبذة. ضغط على تعديل باش تعرف الزبناء بيك!"}
                </p>
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

            {/* Portfolio Section */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  معرض الأعمال
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
                      alt={`عمل ${idx + 1}`} 
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
              <div className="space-y-4">
                <a 
                  href={`tel:${profile.whatsapp_number}`}
                  className="w-full flex items-center justify-center gap-3 bg-[#1E3A8A] text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <Phone className="w-6 h-6" /> اتصل الآن
                </a>
                <a 
                  href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-6 h-6 fill-white" /> واتساب
                </a>
                <button 
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <Mail className="w-6 h-6" /> إرسال رسالة
                </button>
              </div>

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
    </div>
  );
};

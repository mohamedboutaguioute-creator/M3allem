import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Hash, Briefcase, DollarSign, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase';

export const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: location.state?.email || '',
    phone: location.state?.phone || '',
    address: '',
    zipcode: '',
    city: '',
    speciality: '',
    price: ''
  });

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/register');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Generate search keywords
      const keywords = new Set<string>();
      if (formData.fullName) {
        formData.fullName.toLowerCase().split(' ').forEach(word => {
          if (word.length > 1) keywords.add(word);
        });
      }
      if (formData.speciality) keywords.add(formData.speciality.toLowerCase());
      if (formData.city) keywords.add(formData.city.toLowerCase());

      const updatePayload = {
        displayName: formData.fullName,
        email: formData.email,
        phone_number: formData.phone,
        address: formData.address,
        zipcode: formData.zipcode,
        city: formData.city,
        category: formData.speciality,
        price: Number(formData.price),
        role: 'pro',
        isPublished: true,
        status: 'active',
        is_searchable: true, // Also set this for backward compatibility with previous logic
        isProfileComplete: false, // Will be true once bio and portfolio are added in dashboard
        search_keywords: Array.from(keywords),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 0,
        review_count: 0,
        is_verified: false,
        subscription_status: 'Free',
        bio: '', // Empty for now
        portfolio_images: []
      };

      await setDoc(userRef, updatePayload, { merge: true });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      setLoading(false);
      setError(err.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-20">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-[#1E3A8A] p-10 text-white relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <h2 className="text-3xl font-black mb-2 relative">Complete Your Profile</h2>
            <p className="text-white/70 relative">Tell us more about your services to start receiving bookings.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ahmed El Mansouri"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ahmed@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+212 6..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none appearance-none"
                  >
                    <option value="">Select City</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Tangier">Tangier</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Fes">Fes</option>
                    <option value="Meknes">Meknes</option>
                    <option value="Oujda">Oujda</option>
                    <option value="Kenitra">Kenitra</option>
                    <option value="Tetouan">Tetouan</option>
                    <option value="Safi">Safi</option>
                    <option value="Mohammedia">Mohammedia</option>
                    <option value="Khouribga">Khouribga</option>
                    <option value="El Jadida">El Jadida</option>
                    <option value="Beni Mellal">Beni Mellal</option>
                    <option value="Nador">Nador</option>
                    <option value="Taza">Taza</option>
                    <option value="Settat">Settat</option>
                    <option value="Larache">Larache</option>
                    <option value="Ksar El Kebir">Ksar El Kebir</option>
                    <option value="Guelmim">Guelmim</option>
                    <option value="Khemisset">Khemisset</option>
                    <option value="Berrechid">Berrechid</option>
                    <option value="Ouarzazate">Ouarzazate</option>
                    <option value="Tiznit">Tiznit</option>
                    <option value="Taroudant">Taroudant</option>
                    <option value="Essaouira">Essaouira</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Zipcode */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Zip Code</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="zipcode"
                    required
                    value={formData.zipcode}
                    onChange={handleChange}
                    placeholder="20000"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street name, Building, Apartment..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Speciality */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Speciality</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="speciality"
                    required
                    value={formData.speciality}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none appearance-none"
                  >
                    <option value="">Select Speciality</option>
                    <option value="Electricity">Electrician</option>
                    <option value="Plumbing">Plumber</option>
                    <option value="Carpentry">Carpenter</option>
                    <option value="Painting">Painter</option>
                    <option value="Construction">Mason</option>
                    <option value="Plastering">Plasterer</option>
                    <option value="Aluminum">Aluminum Worker</option>
                    <option value="Tiling">Tiler</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Service Price (DH/hr)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="150"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F59E0B] text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-amber-200 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Complete Registration'}
              {!loading && <ShieldCheck className="w-6 h-6" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

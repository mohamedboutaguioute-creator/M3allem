import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Phone, MapPin, Camera, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isPro = searchParams.get('type') === 'pro';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    category: '',
    bio: '',
    password: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-20">
      <div className="max-w-xl w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-12 group">
          <div className="w-12 h-12 bg-[#1E3A8A] rounded-2xl flex items-center justify-center group-hover:bg-[#F59E0B] transition-colors">
            <span className="text-white font-black text-2xl">M</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">M3ALLEM</span>
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E3A8A] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <h2 className="text-3xl font-black mb-2 relative">
              {isPro ? 'Join as a Professional' : 'Welcome Back'}
            </h2>
            <p className="text-white/70 relative">
              {isPro 
                ? 'Start growing your business with M3ALLEM today.' 
                : 'Sign in to manage your reviews and bookings.'}
            </p>
          </div>

          <div className="p-10">
            {isPro ? (
              /* Multi-step Pro Registration */
              <div>
                {/* Progress Bar */}
                <div className="flex gap-2 mb-10">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-500",
                        step >= i ? "bg-[#F59E0B]" : "bg-slate-100"
                      )} 
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="e.g. Ahmed El Mansouri" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            type="email" 
                            placeholder="ahmed@example.com" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A]"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={handleNext}
                        className="w-full bg-[#1E3A8A] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        Continue <ArrowRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                              type="tel" 
                              placeholder="06..." 
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A]"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">City</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A] appearance-none">
                              <option>Casablanca</option>
                              <option>Marrakech</option>
                              <option>Rabat</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Category</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A] appearance-none">
                            <option>Electricity</option>
                            <option>Plumbing</option>
                            <option>Construction</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={handleBack}
                          className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold"
                        >
                          Back
                        </button>
                        <button 
                          onClick={handleNext}
                          className="flex-[2] bg-[#1E3A8A] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
                        >
                          Continue <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Verification (ID Card)</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:border-[#F59E0B] transition-colors cursor-pointer group">
                          <Camera className="w-10 h-10 text-slate-300 mx-auto mb-4 group-hover:text-[#F59E0B] transition-colors" />
                          <p className="text-sm font-bold text-slate-900 mb-1">Upload ID Photo</p>
                          <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Professional Bio</label>
                        <textarea 
                          rows={4}
                          placeholder="Tell customers about your skills and experience..."
                          className="w-full p-6 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-[#1E3A8A] resize-none"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={handleBack}
                          className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold"
                        >
                          Back
                        </button>
                        <button 
                          className="flex-[2] bg-[#F59E0B] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
                        >
                          Complete Registration <ShieldCheck className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Simple Customer Login */
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Password</label>
                    <button className="text-xs font-bold text-[#1E3A8A] hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                </div>
                <button className="w-full bg-[#1E3A8A] text-white py-5 rounded-2xl font-black text-lg hover:shadow-lg transition-all">
                  Sign In
                </button>
                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    Don't have an account? <Link to="/register" className="font-bold text-[#1E3A8A] hover:underline">Create one</Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            to={isPro ? "/auth" : "/auth?type=pro"} 
            className="text-sm font-bold text-slate-500 hover:text-[#1E3A8A] transition-colors"
          >
            {isPro ? "Looking for a handyman? Sign in as Customer" : "Are you a professional? Join as M3allem"}
          </Link>
        </div>
      </div>
    </div>
  );
};

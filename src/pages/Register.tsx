import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

type Step = 'email' | 'password' | 'phone' | 'success';

export const Register: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 6) setStep('phone');
    else setError('Password must be at least 6 characters.');
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      setLoading(true);
      setError(null);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setLoading(false);
        setStep('success');
        // We'll pass the phone to the next page via state or just let them enter it again if needed
        // But the CompleteProfile page already expects it in state
      } catch (err: any) {
        console.error('Firebase Auth Error:', err);
        setLoading(false);
        
        let message = 'Failed to create account. Please try again.';
        if (err.code === 'auth/email-already-in-use') message = 'This email is already registered.';
        if (err.code === 'auth/invalid-email') message = 'Invalid email format.';
        if (err.code === 'auth/weak-password') message = 'Password is too weak.';
        if (err.message) message = err.message;
        
        setError(message);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Let's start with your email</h2>
              <p className="text-slate-500">We'll use this to send you important updates.</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1E3A8A] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        );
      case 'password':
        return (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <button 
                onClick={() => setStep('email')}
                className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#1E3A8A] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Email
              </button>
              <h2 className="text-2xl font-black text-slate-900">Create a password</h2>
              <p className="text-slate-500">Make sure it's at least 6 characters long.</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#1E3A8A] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        );
      case 'phone':
        return (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <button 
                onClick={() => setStep('password')}
                className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#1E3A8A] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Password
              </button>
              <h2 className="text-2xl font-black text-slate-900">What's your phone number?</h2>
              <p className="text-slate-500">Customers will use this to contact you.</p>
            </div>
            <form onSubmit={handleRegistration} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <div className="flex items-center">
                  <span className="absolute left-12 text-slate-900 font-bold">+212</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="6 00 00 00 00"
                    className="w-full pl-24 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-[#1E3A8A] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </motion.div>
        );
      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Account Created!</h2>
              <p className="text-slate-500">Welcome to M3ALLEM. Your account has been successfully created.</p>
            </div>
            <button
              onClick={() => navigate('/complete-profile', { state: { email, phone: `+212${phone.replace(/\s/g, '')}` } })}
              className="w-full bg-[#1E3A8A] text-white py-4 rounded-2xl font-black text-lg hover:shadow-lg transition-all"
            >
              Complete Your Profile
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-20">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-12 group">
          <div className="w-10 h-10 bg-[#1E3A8A] rounded-xl flex items-center justify-center group-hover:bg-[#F59E0B] transition-colors">
            <span className="text-white font-black text-xl">M</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">M3ALLEM</span>
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="flex h-1.5 bg-slate-100">
            <motion.div 
              className="bg-[#F59E0B]"
              initial={{ width: "0%" }}
              animate={{ 
                width: step === 'email' ? '25%' : 
                       step === 'password' ? '50%' : 
                       step === 'phone' ? '75%' : '100%' 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-10">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Already have an account? <Link to="/auth" className="font-bold text-[#1E3A8A] hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

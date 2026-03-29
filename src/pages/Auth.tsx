import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Phone, MapPin, Camera, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Logo } from '../components/Logo';

export const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isPro = searchParams.get('type') === 'pro';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyMessage, setShowVerifyMessage] = useState(false);
  const navigate = useNavigate();

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowVerifyMessage(false);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setShowVerifyMessage(true);
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.warn('Sign In Attempt Info:', err.code || err.message);
      let message = 'Failed to sign in. Please check your credentials.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Email or password is incorrect';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This account has been disabled. Please contact support.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-20">
      <div className="max-w-xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Link to="/">
            <Logo className="scale-125" />
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E3A8A] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <h2 className="text-3xl font-black mb-2 relative">
              {isPro ? 'Join as a Professional' : 'Welcome Back'}
            </h2>
            <p className="text-white/70 relative">
              {isPro 
                ? 'Start growing your business with BREKOUL today.' 
                : 'Sign in to manage your reviews and bookings.'}
            </p>
          </div>

          <div className="p-10">
            {isPro ? (
              /* Multi-step Pro Registration */
              /* Note: Pro registration is now handled in /register for consistency */
              <div className="text-center space-y-6">
                <p className="text-slate-600">We've updated our registration process for professionals.</p>
                <Link 
                  to="/register"
                  className="w-full bg-[#1E3A8A] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all inline-block"
                >
                  Go to Registration <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              /* Simple Customer Login */
              showVerifyMessage ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className="w-20 h-20 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900">Verify your email</h2>
                    <p className="text-slate-500">
                      We have sent you a verification email to <span className="font-bold text-slate-900">{formData.email}</span>. Please verify it and log in.
                    </p>
                  </div>
                  <button onClick={() => setShowVerifyMessage(false)} className="btn-primary w-full py-4 text-lg">
                    Login
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}
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
                      placeholder="your@email.com" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Password</label>
                    <button type="button" className="text-xs font-bold text-[#1E3A8A] hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full bg-[#1E3A8A] text-white py-5 rounded-2xl font-black text-lg hover:shadow-lg transition-all",
                    loading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    Don't have an account? <Link to="/register" className="font-bold text-[#1E3A8A] hover:underline">Create one</Link>
                  </p>
                </div>
              </form>
            )
          )}
        </div>
      </div>

        <div className="mt-8 text-center">
          <Link 
            to={isPro ? "/auth" : "/auth?type=pro"} 
            className="text-sm font-bold text-slate-500 hover:text-[#1E3A8A] transition-colors"
          >
            {isPro ? "Looking for a handyman? Sign in as Customer" : "Are you a professional? Join as Brekoul"}
          </Link>
        </div>
      </div>
    </div>
  );
};

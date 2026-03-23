import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock, User, Calendar, MapPin, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { Logo } from '../components/Logo';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

type Step = 'signup' | 'phone' | 'otp' | 'profile' | 'success';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export const Register: React.FC = () => {
  const [step, setStep] = useState<Step>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    otp: ['', '', '', '', '', ''],
    dob: '',
    gender: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the user immediately to check if email is available
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setStep('phone');
    } catch (err: any) {
      console.error('Signup Error:', err);
      let message = 'Failed to start registration. Please try again.';
      if (err.code === 'auth/email-already-in-use' || err.message?.includes('email-already-in-use')) {
        message = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'The email address is badly formatted.';
      } else if (err.code === 'auth/invalid-credential') {
        message = 'Invalid registration details. Please check your email and password.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone) {
      // In a real app with "remove captcha" requirement, we might use a different service
      // or a simulated OTP for the UI flow if Firebase Phone Auth is not desired due to reCAPTCHA.
      // For this UI-focused request, we'll move to the OTP entry step.
      setStep('otp');
      setError(null);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp }));

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp.every(v => v !== '')) {
      setStep('profile');
      setError(null);
    }
  };

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found. Please start over.');
      }
      const uid = user.uid;

      // 2. Consolidate Data for API/Firestore
      const consolidatedData = {
        uid,
        fullName: formData.fullName,
        email: formData.email,
        phone: `+212${formData.phone.replace(/\s/g, '')}`,
        dob: formData.dob,
        gender: formData.gender,
        city: formData.city,
        createdAt: serverTimestamp(),
        role: 'professional', // Default role
        isVerified: false
      };

      console.log('Final Registration Data:', consolidatedData);

      // 3. Save to Firestore (Atomic Batch)
      const batch = writeBatch(db);
      
      // Public Profile
      const publicRef = doc(db, 'professionals_public', uid);
      batch.set(publicRef, {
        uid,
        fullName: consolidatedData.fullName,
        city: consolidatedData.city,
        whatsapp_number: consolidatedData.phone,
        createdAt: consolidatedData.createdAt,
        role: consolidatedData.role,
        isVerified: consolidatedData.isVerified,
        speciality: 'General', // Placeholder for later update
        price: 0 // Placeholder
      });

      // Private Data
      const privateRef = doc(db, 'professionals_private', uid);
      batch.set(privateRef, {
        email: consolidatedData.email,
        dob: consolidatedData.dob,
        gender: consolidatedData.gender,
      });

      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'batch_commit_registration');
      }
      
      setLoading(false);
      setStep('success');
    } catch (err: any) {
      console.error('Registration Error:', err);
      setLoading(false);
      setError(err.message || 'Failed to complete registration. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'signup':
        return (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Create your account</h2>
              <p className="text-slate-500">Join the Brekoul community today.</p>
            </div>
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium flex flex-col gap-2">
                  <span>{error}</span>
                  {error.includes('already registered') && (
                    <Link to="/auth" className="text-[#1E3A8A] underline font-bold">
                      Sign In here
                    </Link>
                  )}
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className={cn("btn-primary w-full py-4 text-lg flex items-center justify-center gap-2", loading && "opacity-70")}
              >
                {loading ? "Checking..." : "Continue"} <ArrowRight className="w-5 h-5" />
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
              <button onClick={() => setStep('signup')} className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#1E3A8A] transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-black text-slate-900">Phone Verification</h2>
              <p className="text-slate-500">Enter your phone number to receive a code.</p>
            </div>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <div className="flex items-center">
                  <span className="absolute left-12 text-slate-900 font-bold">+212</span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="6 00 00 00 00"
                    className="w-full pl-24 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                Send Code <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        );
      case 'otp':
        return (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <button onClick={() => setStep('phone')} className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#1E3A8A] transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Change Number
              </button>
              <h2 className="text-2xl font-black text-slate-900">Verify Code</h2>
              <p className="text-slate-500">Enter the 6-digit code sent to your phone.</p>
            </div>
            <form onSubmit={handleOtpVerify} className="space-y-8">
              <div className="flex justify-between gap-2">
                {formData.otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#F59E0B] focus:bg-white transition-all outline-none"
                  />
                ))}
              </div>
              <div className="space-y-4">
                <button 
                  type="submit" 
                  disabled={formData.otp.some(v => v === '')}
                  className={cn("btn-accent w-full py-4 text-lg flex items-center justify-center gap-2", formData.otp.some(v => v === '') && "opacity-70")}
                >
                  Verify <ShieldCheck className="w-5 h-5" />
                </button>
                <p className="text-center text-sm text-slate-500">
                  Didn't receive the code? <button type="button" className="font-bold text-[#1E3A8A] hover:underline">Resend</button>
                </p>
              </div>
            </form>
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Complete Profile</h2>
              <p className="text-slate-500">Just a few more details to get started.</p>
            </div>
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#1E3A8A] focus:bg-white transition-all outline-none appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">City</label>
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
                    <option value="Marrakech">Marrakech</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Tangier">Tangier</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Fes">Fes</option>
                  </select>
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
                className={cn("btn-accent w-full py-4 text-lg flex items-center justify-center gap-2", loading && "opacity-70")}
              >
                {loading ? "Creating Account..." : "Complete Registration"}
                {!loading && <ShieldCheck className="w-5 h-5" />}
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
              <h2 className="text-3xl font-black text-slate-900">Welcome!</h2>
              <p className="text-slate-500">Your account has been successfully created. You can now start using Brekoul.</p>
            </div>
            <button onClick={() => navigate('/')} className="btn-primary w-full py-4 text-lg">
              Go to Dashboard
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-20">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-12">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="flex h-1.5 bg-slate-100">
            <motion.div 
              className="bg-[#F59E0B]"
              initial={{ width: "0%" }}
              animate={{ 
                width: step === 'signup' ? '20%' : 
                       step === 'phone' ? '40%' : 
                       step === 'otp' ? '60%' : 
                       step === 'profile' ? '80%' : '100%' 
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type Step = 'email' | 'phone' | 'otp' | 'success';

export const Register: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep('phone');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: `+212${phone}` }),
        });
        
        if (!response.ok) throw new Error('Failed to send OTP');
        
        setLoading(false);
        setStep('otp');
      } catch (err) {
        console.error(err);
        setLoading(false);
        alert('Failed to send OTP. Please try again.');
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            target: email || `+212${phone}`, 
            otp: otpCode 
          }),
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Invalid OTP');
        
        setLoading(false);
        setStep('success');
      } catch (err: any) {
        console.error(err);
        setLoading(false);
        alert(err.message || 'Verification failed. Please try again.');
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
                onClick={() => setStep('email')}
                className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#1E3A8A] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Email
              </button>
              <h2 className="text-2xl font-black text-slate-900">What's your phone number?</h2>
              <p className="text-slate-500">We'll send a verification code to this number.</p>
            </div>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-[#1E3A8A] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
                {!loading && <ArrowRight className="w-5 h-5" />}
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
              <button 
                onClick={() => setStep('phone')}
                className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#1E3A8A] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Change Number
              </button>
              <h2 className="text-2xl font-black text-slate-900">Verify your number</h2>
              <p className="text-slate-500">Enter the 6-digit code sent to <span className="font-bold text-slate-900">+212 {phone}</span></p>
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <span className="font-bold">Developer Note:</span> Since real SMS sending requires a paid service, the OTP has been logged to the <span className="font-bold">server console</span>. Please check the logs to find your code.
              </div>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
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
                  disabled={loading || otp.some(v => v === '')}
                  className={cn(
                    "w-full bg-[#F59E0B] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]",
                    (loading || otp.some(v => v === '')) && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {loading ? "Verifying..." : "Verify & Create Account"}
                  {!loading && <ShieldCheck className="w-5 h-5" />}
                </button>
                <p className="text-center text-sm text-slate-500">
                  Didn't receive the code? <button type="button" className="font-bold text-[#1E3A8A] hover:underline">Resend</button>
                </p>
              </div>
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
              <p className="text-slate-500">Welcome to M3ALLEM. Your account has been successfully verified.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#1E3A8A] text-white py-4 rounded-2xl font-black text-lg hover:shadow-lg transition-all"
            >
              Go to Dashboard
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
                       step === 'phone' ? '50%' : 
                       step === 'otp' ? '75%' : '100%' 
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

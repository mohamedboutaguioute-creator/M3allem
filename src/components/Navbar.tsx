import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { translations } from '../locales/ar';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();
  const t = translations.common;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded-xl flex items-center justify-center group-hover:bg-[#F59E0B] transition-colors">
              <span className="text-[#F59E0B] font-black text-xl">M</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900"><span className="text-[#F59E0B]">M</span>{t.appName.slice(1)}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/directory" className="text-sm font-bold text-slate-600 hover:text-[#1E3A8A] transition-colors">{t.findPro}</Link>
            {!user && (
              <Link to="/auth?type=pro" className="text-sm font-bold text-slate-600 hover:text-[#1E3A8A] transition-colors">{t.joinAsPro}</Link>
            )}
            <div className="h-4 w-px bg-slate-200" />
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 transition-all"
              >
                <User className="w-4 h-4" />
                {t.signIn}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 animate-in slide-in-from-top duration-200">
          <Link to="/directory" className="block text-lg font-bold text-slate-900" onClick={() => setIsOpen(false)}>{t.findPro}</Link>
          {!user && (
            <Link to="/auth?type=pro" className="block text-lg font-bold text-slate-900" onClick={() => setIsOpen(false)}>{t.joinAsPro}</Link>
          )}
          {user ? (
            <>
              <Link to="/dashboard" className="block w-full text-center bg-[#1E3A8A] text-white py-3 rounded-xl font-bold" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <button onClick={handleSignOut} className="block w-full text-center text-red-500 py-3 font-bold">Sign Out</button>
            </>
          ) : (
            <Link to="/auth" className="block w-full text-center bg-[#1E3A8A] text-white py-3 rounded-xl font-bold" onClick={() => setIsOpen(false)}>{t.signIn}</Link>
          )}
        </div>
      )}
    </nav>
  );
};

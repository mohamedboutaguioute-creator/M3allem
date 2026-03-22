import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import { translations } from '../locales/ar';

export const Footer: React.FC = () => {
  const t = translations.footer;
  const cats = translations.categories;
  const common = translations.common;

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">M</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-white">{common.appName}</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              {t.aboutText}
            </p>
            <div className="flex gap-4 justify-end">
              <a href="#" className="hover:text-[#F59E0B] transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-[#F59E0B] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-[#F59E0B] transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t.services}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/directory?cat=Electricity" className="hover:text-white transition-colors">{cats.Electricity}</Link></li>
              <li><Link to="/directory?cat=Plumbing" className="hover:text-white transition-colors">{cats.Plumbing}</Link></li>
              <li><Link to="/directory?cat=Construction" className="hover:text-white transition-colors">{cats.Construction}</Link></li>
              <li><Link to="/directory?cat=Painting" className="hover:text-white transition-colors">{cats.Painting}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t.company}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">{t.aboutUs}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t.contact}</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">{t.terms}</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">{t.privacy}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t.contactUs}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 justify-end">support@m3allem.ma <Mail className="w-4 h-4" /></li>
              <li className="flex items-center gap-3 justify-end">+212 522 00 00 00 <Phone className="w-4 h-4" /></li>
              <li className="mt-6">
                <p className="font-bold text-white mb-2">{t.newsletter}</p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder={t.emailPlaceholder} 
                    className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-[#F59E0B] text-right"
                  />
                  <button className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap">{t.join}</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} {common.appName}. {t.rightsReserved}</p>
        </div>
      </div>
    </footer>
  );
};

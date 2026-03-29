import React from 'react';
import ProfileHeader from '../components/ProfileHeader';

const ProfileDemo = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <ProfileHeader />
      
      {/* Additional content to fill the page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6">نبذة مهنية</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                خبير كهربائي بخبرة تزيد عن 10 سنوات في التركيبات الكهربائية المنزلية والصناعية. متخصص في أنظمة الطاقة الذكية وصيانة اللوحات الكهربائية المعقدة. حاصل على شهادات معتمدة في السلامة المهنية.
              </p>
            </section>
          </div>
          
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-4">المهارات</h2>
              <div className="flex flex-wrap gap-2">
                {['تركيبات منزلية', 'صيانة صناعية', 'أنظمة ذكية', 'طاقة شمسية'].map(skill => (
                  <span key={skill} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-2xl font-bold text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDemo;

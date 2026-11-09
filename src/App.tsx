/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Building2, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { KycVerificationModal } from './components/KycVerificationModal';
import { CustomerPortal } from './components/CustomerPortal';
import { MyActiveRental } from './components/MyActiveRental';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OFFICIAL_WHATSAPP_NUMBER } from './services/supabase';

const AppContent: React.FC = () => {
  const { currentPath, navigateTo, currentUser, openAuthModal } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1F2937]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router based on Smart Role Auth */}
      <div className="flex-1">
        {currentPath === '/admin' ? (
          <AdminDashboard />
        ) : currentPath === '/my-rentals' ? (
          <MyActiveRental />
        ) : (
          <CustomerPortal />
        )}
      </div>

      {/* Saharan Luxury Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand & Sahara Quote */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm tracking-wide">عقارات أدرار</span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed">
                المنصة المتخصصة في كراء الشقق والمنازل الفاخرة بولاية أدرار، موجهة للموظفين والإطارات والشركات والعائلات.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>عقود كراء موثقة وتجهيزات صحراوية كاملة</span>
              </div>
            </div>

            {/* Col 2: Municipalities in Adrar */}
            <div>
              <h4 className="font-bold text-white text-xs mb-3">بلديات ولاية أدرار المغطاة</h4>
              <ul className="space-y-1.5 text-stone-400">
                <li>أدرار وسط (حي 140 مسكن، ساحة الشهداء)</li>
                <li>تيميمون (واحة قورارة، القصور التراثية)</li>
                <li>رقان (المركز والمجمع الإداري)</li>
                <li>فنوغيل وتسابيت</li>
                <li>زاوية كنتة وأولف</li>
              </ul>
            </div>

            {/* Col 3: Quick Navigation */}
            <div>
              <h4 className="font-bold text-white text-xs mb-3">روابط البوابة</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigateTo('/app')}
                    className="hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    تصفح الشقق المتاحة للكراء
                  </button>
                </li>
                {currentUser && (
                  <li>
                    <button
                      onClick={() => navigateTo('/my-rentals')}
                      className="hover:text-amber-300 transition-colors cursor-pointer text-emerald-400 font-semibold"
                    >
                      شقتي الحالية (عقد الكراء)
                    </button>
                  </li>
                )}
                {currentUser?.role === 'admin' ? (
                  <li>
                    <button
                      onClick={() => navigateTo('/admin')}
                      className="hover:text-amber-300 transition-colors cursor-pointer text-amber-200"
                    >
                      لوحة تحكم الإدارة (/admin)
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      onClick={() => openAuthModal('تسجيل الدخول إلى حسابك')}
                      className="hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      دخول المشرفين والمستأجرين
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Col 4: Contact & Landlord Desk */}
            <div>
              <h4 className="font-bold text-white text-xs mb-3">المقر والتواصل بأدرار</h4>
              <div className="space-y-2 text-stone-400">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                  <span>شارع الاستقلال، مقابل مقر ولاية أدرار</span>
                </p>
                <p className="flex items-center gap-2 font-mono tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+213 696980328</span>
                </p>
                <p className="flex items-center gap-2 font-mono">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>contact@adrar-immo.dz</span>
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B9%D8%B1%D8%B6%20%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%20%D9%84%D9%84%D9%83%D8%B1%D8%A7%D8%A1%20%D8%A8%D9%85%D9%86%D8%B5%D8%A9%20%D8%A3%D8%AF%D8%B1%D8%A7%D8%B1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all"
                  >
                    <span>تواصل مباشر مع الإدارة عبر واتساب</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-stone-500">
            <p>© 2026 منصة كراء العقارات بولاية أدرار - جميع الحقوق محفوظة.</p>
            <p className="flex items-center gap-1">
              <span>سكن الواحات الفاخر · ولاية أدرار</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Global Auth Modal */}
      <AuthModal />

      {/* KYC Verification Modal */}
      <KycVerificationModal />

      {/* Global Notification Toast */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

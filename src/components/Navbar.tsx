import React from 'react';
import {
  Building2,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentPath,
    navigateTo,
    logout,
    openAuthModal,
    openKycModal,
  } = useAuth();

  const isAdmin = currentUser?.role === 'admin';
  const isGuest = !currentUser;
  const kycStatus = currentUser?.kyc_status || (currentUser?.is_active ? 'verified' : 'unverified');

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          {/* Brand Logo */}
          <button
            onClick={() => navigateTo('/app')}
            className="flex items-center gap-2.5 text-right text-stone-900 group whitespace-nowrap shrink-0 focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1E4D38] text-white flex items-center justify-center shadow-xs group-hover:bg-[#C85A32] transition-colors">
              <Building2 className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1E4D38] group-hover:text-[#C85A32] transition-colors block leading-tight">
                عقارات أدرار
              </span>
              <span className="text-[11px] text-stone-500 font-medium">سكن الواحات الفاخر</span>
            </div>
          </button>

          {/* Navigation Links (Strict Role-Based) */}
          <nav className="flex items-center gap-5 text-sm font-medium text-stone-700">
            {/* Always visible for all: "تصفح الشقق" */}
            <button
              onClick={() => navigateTo('/app')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPath === '/app'
                  ? 'text-[#C85A32] font-bold border-b-2 border-[#C85A32] pb-1'
                  : 'hover:text-[#C85A32]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>تصفح الشقق</span>
            </button>

            {/* "شقتي الحالية (عقد الكراء)" ONLY for logged-in users (Client / Tenant / Admin) */}
            {!isGuest && (
              <button
                onClick={() => navigateTo('/my-rentals')}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentPath === '/my-rentals'
                    ? 'text-[#1E4D38] font-bold border-b-2 border-[#1E4D38] pb-1'
                    : 'hover:text-[#1E4D38]'
                }`}
              >
                <KeyRound className="w-4 h-4 text-[#1E4D38]" />
                <span>شقتي الحالية (عقد الكراء)</span>
              </button>
            )}

            {/* "لوحة تحكم الإدارة (/admin)" ONLY for ADMIN */}
            {isAdmin && (
              <button
                onClick={() => navigateTo('/admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentPath === '/admin'
                    ? 'bg-[#1E4D38] text-white shadow-xs'
                    : 'bg-emerald-50 text-[#1E4D38] hover:bg-emerald-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>لوحة تحكم الإدارة</span>
              </button>
            )}
          </nav>

          {/* Action Zone: Guest vs Logged-In User */}
          <div className="flex items-center gap-3 shrink-0">
            {isGuest ? (
              /* Case A: Guest Button */
              <button
                type="button"
                onClick={() => openAuthModal('تسجيل الدخول إلى حسابك أو إنشاء حساب جديد لتصفح وحجز الشقق')}
                className="py-2.5 px-5 text-xs sm:text-sm font-bold text-white bg-[#C85A32] hover:bg-[#B24E2A] rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>تسجيل الدخول / حساب جديد</span>
              </button>
            ) : (
              /* Case B & C: Logged-in User Profile */
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
                  <div className="w-7 h-7 rounded-full bg-[#1E4D38] text-white font-bold flex items-center justify-center text-xs">
                    {currentUser.full_name ? currentUser.full_name.charAt(0) : 'م'}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-stone-900 leading-tight truncate max-w-[130px]">
                        {currentUser.full_name}
                      </p>
                      {/* KYC Status Badge for regular users */}
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={openKycModal}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-transform hover:scale-105 ${
                            kycStatus === 'verified'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : kycStatus === 'pending' || kycStatus === 'pending_review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : kycStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                          }`}
                          title="انقر لعرض وتوثيق الهوية (KYC)"
                        >
                          {kycStatus === 'verified'
                            ? 'حساب موثق ومفعل ✓'
                            : kycStatus === 'pending' || kycStatus === 'pending_review'
                            ? 'قيد المراجعة ⏳'
                            : kycStatus === 'rejected'
                            ? 'مرفوض ✕'
                            : 'غير مفعل ⚠️'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-0.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-0.5 text-[#1E4D38] font-bold">
                          <ShieldCheck className="w-3 h-3 text-[#1E4D38]" />
                          <span>مشرف (Admin · رتبة 1)</span>
                        </span>
                      ) : (
                        <span className="font-mono tabular-nums">{currentUser.phone || currentUser.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unverified / Pending Banner for Logged-in non-admin */}
      {!isGuest && !isAdmin && kycStatus !== 'verified' && (
        <div
          className={`py-2.5 px-4 text-xs font-medium border-t transition-colors ${
            kycStatus === 'pending' || kycStatus === 'pending_review'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : kycStatus === 'rejected'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-amber-50/90 border-amber-200 text-amber-900'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  kycStatus === 'pending' || kycStatus === 'pending_review'
                    ? 'bg-amber-500 animate-ping'
                    : kycStatus === 'rejected'
                    ? 'bg-rose-500'
                    : 'bg-[#C85A32]'
                }`}
              />
              <span className="leading-relaxed">
                {kycStatus === 'pending' || kycStatus === 'pending_review'
                  ? 'وثائقك قيد المراجعة من طرف الإدارة حالياً. ستتلقى إشعاراً فور التفعيل (عادة خلال دقائق إلى ساعات).'
                  : kycStatus === 'rejected'
                  ? `تم رفض وثيقة الهوية: ${currentUser.kyc_rejection_reason || 'الصورة غير واضحة أو منتهية الصلاحية'}. يرجى إعادة رفع صورة واضحة للبطاقة.`
                  : 'حسابك غير مفعل بعد. يرجى رفع بطاقة التعريف الوطنية لتتمكن من كراء الشقق وتأكيد حجزك.'}
              </span>
            </div>
            <button
              onClick={openKycModal}
              className="px-3.5 py-1.5 bg-[#1E4D38] hover:bg-[#153728] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              {kycStatus === 'pending' || kycStatus === 'pending_review'
                ? 'متابعة الطلب'
                : kycStatus === 'rejected'
                ? 'إعادة الرفع الآن'
                : 'رفع بطاقة الهوية'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

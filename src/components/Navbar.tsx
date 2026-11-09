import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Moon,
  Phone,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../services/translations';

interface NavbarProps {
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAbout, onOpenContact }) => {
  const {
    currentUser,
    currentPath,
    navigateTo,
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    logout,
    openAuthModal,
    activeTenantLease,
  } = useAuth();

  const t = useTranslation(language);
  const isAdmin = currentUser?.role === 'admin';
  const isTenant = currentUser && !isAdmin;

  return (
    <header className="sticky top-0 z-40 bg-[#0A1424]/95 dark:bg-[#060D18]/95 backdrop-blur-md border-b border-[#1A2942] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Right Section: Brand Emblem & Typography (Matches MacBook Mockup) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('/app')}
              className="flex items-center gap-3 text-right group focus:outline-none cursor-pointer"
            >
              {/* Logo Emblem from attachment */}
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white p-0.5 border border-[#C5A059]/40 shadow-md group-hover:border-[#C5A059] transition-all shrink-0">
                <img
                  src="/images/zayd_logo.jpeg"
                  alt="ZAYD Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Subtitle */}
              <div className="leading-tight">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-[#DFBF7A] transition-colors block">
                  {t.brandName}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#C5A059] tracking-wider block font-sans">
                  {t.brandSub}
                </span>
              </div>
            </button>
          </div>

          {/* Center Section: Navigation Links (Matches MacBook Mockup) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-200">
            {/* الرئيسية (with gold active indicator) */}
            <button
              onClick={() => navigateTo('/app')}
              className={`relative py-2 transition-colors cursor-pointer ${
                currentPath === '/app'
                  ? 'text-[#DFBF7A] font-bold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>{t.navHome}</span>
              {currentPath === '/app' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C5A059] to-[#DFBF7A] rounded-full" />
              )}
            </button>

            {/* العقارات */}
            <button
              onClick={() => {
                navigateTo('/app');
                const el = document.getElementById('listings-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-2 text-stone-300 hover:text-[#DFBF7A] transition-colors cursor-pointer"
            >
              {t.navProperties}
            </button>

            {/* عن الوكالة */}
            <button
              onClick={onOpenAbout}
              className="py-2 text-stone-300 hover:text-[#DFBF7A] transition-colors cursor-pointer"
            >
              {t.navAbout}
            </button>

            {/* اتصل بنا */}
            <button
              onClick={onOpenContact}
              className="py-2 text-stone-300 hover:text-[#DFBF7A] transition-colors cursor-pointer"
            >
              {t.navContact}
            </button>

            {/* عقدي الحالي (for logged-in tenants) */}
            {isTenant && activeTenantLease && (
              <button
                onClick={() => navigateTo('/my-rentals')}
                className={`py-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentPath === '/my-rentals'
                    ? 'text-emerald-400 font-bold'
                    : 'text-emerald-300/80 hover:text-emerald-300'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{t.myActiveLease}</span>
              </button>
            )}

            {/* لوحة تحكم الإدارة (strictly for admin) */}
            {isAdmin && (
              <button
                onClick={() => navigateTo('/admin')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentPath === '/admin'
                    ? 'bg-[#C5A059] text-stone-950 shadow-md font-black'
                    : 'bg-[#C5A059]/20 text-[#DFBF7A] hover:bg-[#C5A059]/30 border border-[#C5A059]/40'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t.adminDashboard}</span>
              </button>
            )}
          </nav>

          {/* Left Section: Controls & Auth (Matches MacBook Mockup) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* AR / FR Pill Toggle */}
            <button
              onClick={toggleLanguage}
              className="py-1 px-2.5 rounded-full bg-[#101D33] hover:bg-[#14233C] text-[#DFBF7A] border border-[#C5A059]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="تغيير اللغة / Changer de langue"
            >
              {language === 'ar' ? 'FR' : 'عربي'}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full bg-[#101D33] hover:bg-[#14233C] text-stone-300 hover:text-[#DFBF7A] border border-[#1A2942] transition-all cursor-pointer"
              title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#DFBF7A]" />
              ) : (
                <Moon className="w-4 h-4 text-stone-300" />
              )}
            </button>

            {/* Login / User Status */}
            {!currentUser ? (
              <button
                onClick={() => openAuthModal()}
                className="py-2 px-3.5 sm:px-4.5 rounded-xl border border-[#C5A059] hover:bg-[#C5A059] text-[#DFBF7A] hover:text-stone-950 text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer group"
              >
                <Phone className="w-3.5 h-3.5 text-[#C5A059] group-hover:text-stone-950" />
                <span className="whitespace-nowrap">{t.loginWithPhone}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#101D33] px-3 py-1.5 rounded-xl border border-[#1A2942] text-xs">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isAdmin ? 'bg-[#C5A059] text-stone-950' : 'bg-[#14233C] text-stone-200'
                    }`}
                  >
                    {isAdmin ? '★' : currentUser.full_name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="font-bold text-white leading-tight truncate max-w-[110px]">
                      {currentUser.full_name}
                    </p>
                    <span className="text-[10px] text-[#C5A059]">
                      {isAdmin ? 'مشرف وكالة زيد' : currentUser.phone}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

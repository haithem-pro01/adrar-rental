import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isValidAlgerianPhone } from '../services/supabase';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    closeAuthModal,
    authModalPrompt,
    login,
    register,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const phoneIsValid = phone ? isValidAlgerianPhone(phone) : false;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim() || !password.trim()) {
      setFormError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setFormError(res.error || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('يرجى كتابة الاسم الكامل');
      return;
    }

    if (!isValidAlgerianPhone(phone)) {
      setFormError('رقم الهاتف الجزائري غير صحيح. يجب أن يبدأ بـ 05 أو 06 أو 07 أو +213 ويتكون من 10 أرقام (مثال: 0661234567).');
      return;
    }

    const res = await register({
      fullName,
      email,
      password,
      phone,
    });

    if (!res.success) {
      setFormError(res.error || 'فشل إنشاء الحساب.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1E4D38] text-amber-200 mx-auto flex items-center justify-center mb-3 shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            {mode === 'login' ? 'تسجيل الدخول إلى حسابك' : 'إنشاء حساب جديد'}
          </h2>

          {/* Contextual prompt message (e.g. when visitor clicks rent) */}
          {authModalPrompt ? (
            <p className="mt-2 text-xs text-[#C85A32] font-semibold bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200">
              {authModalPrompt}
            </p>
          ) : (
            <p className="text-xs text-stone-500 mt-1">
              منصة كراء العقارات بولاية أدرار
            </p>
          )}
        </div>

        {/* Animated Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#1E4D38] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFormError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#C85A32] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Form Error */}
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{formError}</span>
          </div>
        )}

        {/* Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            {/* Quick helper for Admin Access */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1E4D38] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  حساب المشرف (لوحة تحكم الإدارة):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('haithembenzerga@gmail.com');
                    setPassword('123456');
                    setFormError(null);
                  }}
                  className="text-[#C85A32] hover:underline font-bold cursor-pointer"
                >
                  تعبئة تلقائية
                </button>
              </div>
              <p className="text-stone-500 font-mono text-[10px]" dir="ltr">
                haithembenzerga@gmail.com (أو admin@adrar-immo.dz)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-3 bg-[#1E4D38] hover:bg-[#153828] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'جاري التحقق...' : 'دخول'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: عبد القادر الجزائري"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                رقم الهاتف الجزائري (مطلوب لحجز الشقة)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  dir="ltr"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0661234567 أو +213555123456"
                  className={`w-full pr-9 pl-9 py-2.5 rounded-xl border ${
                    phone
                      ? phoneIsValid
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-rose-400 bg-rose-50/20'
                      : 'border-stone-200'
                  } focus:outline-none focus:border-[#C85A32] tabular-nums`}
                />
                {phone && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {phoneIsValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-rose-500 font-bold">غير صالح</span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                صيغة جزائرية: 05, 06, 07 متبوعة بـ 8 أرقام
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'تأكيد التسجيل'}
            </button>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>بياناتك محمية وموثقة عبر Supabase</span>
        </div>
      </div>
    </div>
  );
};

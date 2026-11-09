import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  History,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Star,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService, OFFICIAL_WHATSAPP_NUMBER } from '../services/supabase';
import { Lease } from '../types';

export const MyActiveRental: React.FC = () => {
  const { currentUser, navigateTo, showNotification } = useAuth();
  const [activeLease, setActiveLease] = useState<Lease | null>(null);
  const [endedLeases, setEndedLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state for ended lease
  const [reviewModalLease, setReviewModalLease] = useState<Lease | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadLeases = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const allLeases = await dbService.getLeases();
      const userLeases = allLeases.filter((l) => l.tenant_id === currentUser.id);

      const active = userLeases.find((l) => l.status === 'active' || l.status === 'expiring_soon') || null;
      const ended = userLeases.filter((l) => l.status === 'ended');

      setActiveLease(active);
      setEndedLeases(ended);
    } catch (err) {
      console.warn('Error loading tenant leases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeases();
  }, [currentUser]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalLease || !currentUser) return;

    if (!comment.trim() || comment.trim().length < 5) {
      setReviewError('يرجى كتابة تعليق لا يقل عن 5 أحرف يوضح تجربتك في الشقة');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);

    const res = await dbService.submitReview({
      apartment_id: reviewModalLease.apartment_id,
      tenant_id: currentUser.id,
      tenant_name: currentUser.full_name,
      rating,
      comment: comment.trim(),
      lease_id: reviewModalLease.id,
    });

    if (res.success) {
      showNotification('شكراً لك! تم نشر تقييمك الموثق للشقة بنجاح.', 'success');
      setReviewModalLease(null);
      setComment('');
    } else {
      setReviewError(res.error || 'تعذر إرسال التقييم.');
    }
    setIsSubmittingReview(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="h-64 bg-stone-200/60 rounded-3xl animate-pulse" />
      </div>
    );
  }

  // If user has no active and no ended lease
  if (!activeLease && endedLeases.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C85A32] mx-auto flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            ليس لديك أي شقة مستأجرة حالياً
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed mb-6">
            يمكنك تصفح الشقق المتاحة بولاية أدرار وحجز الشقة المناسبة لاحتياجاتك عبر واتساب ليتم تسجيل وتوثيق عقد الكراء لك من طرف الإدارة.
          </p>
          <button
            onClick={() => navigateTo('/app')}
            className="py-3 px-6 bg-[#1E4D38] hover:bg-[#153828] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            تصفح الشقق المتاحة الآن
          </button>
        </div>
      </div>
    );
  }

  // Calculate days remaining for active lease
  let daysLeft = 0;
  let isExpiringSoon = false;
  if (activeLease) {
    const endDate = new Date(activeLease.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isExpiringSoon = daysLeft > 0 && daysLeft <= 30;
  }

  const handleContactLandlordWhatsApp = () => {
    if (!activeLease) return;
    const msg = `السلام عليكم ورحمة الله، أنا المستأجر ${activeLease.tenant_name} بخصوص شقتي المستأجرة [${activeLease.apartment_title}] كود [${activeLease.apartment_code}]. أود الاستفسار حول عقد الكراء وتفاصيل الدفع.`;
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* 1. Active Rental Section */}
      {activeLease ? (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          {/* Banner */}
          <div className="bg-[#1E4D38] text-white p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-300">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-400 text-stone-900">
                    عقد كراء نشط
                  </span>
                  <span className="text-xs text-white/80 font-mono tabular-nums">
                    عقد رقم: #{activeLease.id.slice(-6)}
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-1">
                  شقتي الحالية المستأجرة
                </h2>
              </div>
            </div>

            <div>
              {isExpiringSoon ? (
                <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-300/40 text-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>العقد ينتهي قريباً (متبقي {daysLeft} يوماً)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-300/40 text-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>العقد سارٍ بانتظام</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Apartment Info */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                <img
                  src={activeLease.apartment_image || '/src/assets/images/apartment_adrar_modern_1_1794234918725.jpg'}
                  alt={activeLease.apartment_title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-[#C85A32] bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  {activeLease.apartment_code}
                </span>
                <h3 className="font-bold text-stone-900 text-base mt-1.5 line-clamp-2">
                  {activeLease.apartment_title}
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>بلدية {activeLease.apartment_municipality}، ولاية أدرار</span>
                </p>
              </div>
            </div>

            {/* Contract Key Metrics */}
            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-stone-200 grid grid-cols-2 gap-3 text-right">
              <div>
                <span className="text-[11px] font-medium text-stone-500 block">نوع العقد</span>
                <span className="text-sm font-bold text-stone-900">
                  {activeLease.lease_type === 'monthly' ? 'كراء شهري' : 'كراء سنوي'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-stone-500 block">بدل الإيجار</span>
                <span className="text-sm font-bold text-[#1E4D38] tabular-nums">
                  {activeLease.rent_amount.toLocaleString('fr-DZ')} دج
                  <span className="text-[10px] text-stone-400 mr-1">
                    / {activeLease.lease_type === 'monthly' ? 'شهر' : 'سنة'}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-stone-500 block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>بداية الكراء</span>
                </span>
                <span className="text-xs font-semibold text-stone-800 tabular-nums">
                  {activeLease.start_date}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-stone-500 block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>نهاية الكراء</span>
                </span>
                <span className="text-xs font-semibold text-stone-800 tabular-nums">
                  {activeLease.end_date}
                </span>
              </div>
            </div>

            {/* Landlord Contact Action */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-stone-700">
                تواصل مع إدارة المنصة:
              </p>
              <div className="text-xs text-stone-600 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-[#1E4D38]" />
                <span>+213 696980328</span>
              </div>

              <button
                onClick={handleContactLandlordWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>واتساب الإدارة</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Ended Leases Section (Eligible to add Reviews & Stars) */}
      {endedLeases.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-[#C85A32]" />
            <h3 className="text-lg font-bold text-stone-900">
              عقود الكراء السابقة المكتملة (مؤهلة للتقييم)
            </h3>
          </div>
          <p className="text-xs text-stone-500 mb-6">
            بما أنك أتممت فترة كراء هذه الشقق وانتهت عقودك، يحق لك الآن إضافة تقييمك ومشاركة تجربتك للآخرين!
          </p>

          <div className="space-y-4">
            {endedLeases.map((endedLease) => (
              <div
                key={endedLease.id}
                className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                    <img
                      src={endedLease.apartment_image || '/src/assets/images/apartment_adrar_modern_1_1794234918725.jpg'}
                      alt={endedLease.apartment_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 font-mono">
                      {endedLease.apartment_code} · عقد منتهٍ ({endedLease.end_date})
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {endedLease.apartment_title}
                    </h4>
                    <span className="text-xs text-emerald-700 font-semibold">
                      عقد {endedLease.lease_type === 'monthly' ? 'شهري' : 'سنوي'} مكتمل
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReviewModalLease(endedLease);
                    setReviewError(null);
                  }}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-stone-900" />
                  <span>تقييم هذه الشقة الآن (نجوم ورأي)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Submission Modal for Ended Lease */}
      {reviewModalLease && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setReviewModalLease(null)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                تقييم الشقة المستأجرة سابقاً
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                [{reviewModalLease.apartment_code}] {reviewModalLease.apartment_title}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {reviewError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Star selector */}
              <div>
                <label className="block font-bold text-stone-700 mb-2 text-center">
                  اختر تقييمك العام (من 1 إلى 5 نجوم):
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-amber-700 mt-1 tabular-nums">
                  {rating === 5
                    ? 'ممتازة جداً (5 نجوم)'
                    : rating === 4
                    ? 'جيدة جداً (4 نجوم)'
                    : rating === 3
                    ? 'متوسطة (3 نجوم)'
                    : rating === 2
                    ? 'تحتاج تحسين (نجمتان)'
                    : 'سيئة (نجمة واحدة)'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  اكتب رأيك الصريح والموضوعي حول الشقة:
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="كيف كانت تجربة السكن؟ حالة خزان الماء والتكييف، الهدوء، المعاملة مع الإدارة عند التسليم..."
                  className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32] text-xs leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalLease(null)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-3 bg-[#1E4D38] hover:bg-[#153828] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingReview ? 'جاري الإرسال...' : 'تأكيد ونشر التقييم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

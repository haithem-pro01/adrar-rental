import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/supabase';
import { Apartment, Review } from '../types';

interface ApartmentReviewsSectionProps {
  apartment: Apartment;
}

export const ApartmentReviewsSection: React.FC<ApartmentReviewsSectionProps> = ({
  apartment,
}) => {
  const { currentUser, openAuthModal, showNotification } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review eligibility state
  const [eligibility, setEligibility] = useState<{
    canReview: boolean;
    reason?: string;
    leaseId?: string;
  }>({ canReview: false });

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadReviewsAndEligibility = async () => {
    setIsLoading(true);
    try {
      const fetchedReviews = await dbService.getApartmentReviews(apartment.id);
      setReviews(fetchedReviews);

      if (currentUser) {
        const elig = await dbService.canUserReviewApartment(currentUser.id, apartment.id);
        setEligibility(elig);
      } else {
        setEligibility({
          canReview: false,
          reason: 'يجب تسجيل الدخول بحساب المستأجر للتحقق من أهليتك لتقييم الشقة.',
        });
      }
    } catch (err) {
      console.warn('Reviews load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsAndEligibility();
  }, [apartment.id, currentUser]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('يرجى تسجيل الدخول بحسابك أولاً لإضافة التقييم');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setSubmitError('يرجى كتابة تعليق لا يقل عن 5 أحرف يوضح تجربتك في الشقة');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const res = await dbService.submitReview({
      apartment_id: apartment.id,
      tenant_id: currentUser.id,
      tenant_name: currentUser.full_name,
      rating,
      comment: comment.trim(),
      lease_id: eligibility.leaseId,
    });

    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setComment('');
      setEligibility({
        canReview: false,
        reason: 'تم تسجيل تقييمك الموثق بنجاح. شكراً لمشاركتك تجربتك!',
      });
      showNotification('شكراً لك! تم نشر تقييمك الموثق للشقة بنجاح.', 'success');
    } else {
      setSubmitError(res.error || 'تعذر إرسال التقييم.');
    }
    setIsSubmitting(false);
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="pt-6 border-t border-stone-200">
      {/* Header and Average Rating */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>تقييمات وآراء المستأجرين السابقين الموثقين</span>
            </h4>
            <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
              {reviews.length} تقييم
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            نظام تقييمات موثق: يسمح فقط للمستأجرين الذين أتموا عقودهم السابقة بمشاركة آرائهم بكل شفافية.
          </p>
        </div>

        {averageRating && (
          <div className="flex items-center gap-2 bg-[#FDFBF7] border border-amber-200/90 px-3.5 py-1.5 rounded-2xl shadow-2xs">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(averageRating))
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-black text-stone-900 tabular-nums">
              {averageRating}
            </span>
            <span className="text-xs text-stone-400">/ 5</span>
          </div>
        )}
      </div>

      {/* Review Submission Area / Eligibility Gate */}
      <div className="mb-8 p-5 rounded-2xl border border-stone-200 bg-stone-50/60">
        {eligibility.canReview ? (
          /* Eligible Form */
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div>
                <span className="text-xs font-bold text-[#1E4D38] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>أنت مؤهل لتقييم هذه الشقة (بصفتك مستأجراً سابقاً انتهى عقدك)</span>
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  رأيك يهم باقي الباحثين عن سكن بولاية أدرار!
                </p>
              </div>

              {/* Interactive Stars Selector */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-stone-700 ml-2">تقييمك:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    aria-label={`${star} نجوم`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-700 mr-2 tabular-nums">
                  ({rating} من 5 نجوم)
                </span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                تعليقك وتجربتك في الشقة (العزل الحراري، خزان الماء، التكييف، الحي):
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تعليقك بموضوعية حول فترة إقامتك في الشقة..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#C85A32] bg-white leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-5 bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'جاري النشر...' : 'نشر التقييم الموثق'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Ineligible / Explanatory Notice */
          <div className="flex items-start gap-3 text-xs text-stone-600">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-stone-900 text-xs mb-1">
                من يحق له إضافة تقييم لهذه الشقة؟
              </h5>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {eligibility.reason ||
                  'وفقاً لسياسة المنصة، إضافة التقييمات محصورة فقط بالمستأجرين الذين أتموا مدة كراء هذه الشقة وانتهى عقد إيجارهم لضمان عدم وجود تقييمات مضللة أو غير حقيقية.'}
              </p>
              {!currentUser && (
                <button
                  onClick={() => openAuthModal('سجل دخولك بحساب المستأجر لإضافة تقييم')}
                  className="mt-2 text-xs font-bold text-[#C85A32] hover:underline cursor-pointer"
                >
                  تسجيل الدخول للتحقق من أهليتك للتقييم ←
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-20 bg-stone-100 rounded-xl animate-pulse" />
            <div className="h-20 bg-stone-100 rounded-xl animate-pulse" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-2xl border border-stone-200">
            <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-stone-600">
              لم تتم إضافة أي تقييمات لهذه الشقة حتى الآن
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              ستظهر هنا تقييمات المستأجرين بعد انتهاء فترة عقودهم الأولى.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-xs font-bold">
                    {rev.tenant_name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 text-xs block">
                      {rev.tenant_name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>مستأجر سابق موثق (عقد منتهٍ)</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 tabular-nums">
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString('fr-DZ') : ''}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed pt-1">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

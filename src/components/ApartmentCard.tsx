import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  Home,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Star,
  Wind,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService, OFFICIAL_WHATSAPP_NUMBER } from '../services/supabase';
import { Apartment } from '../types';

interface ApartmentCardProps {
  apartment: Apartment;
  onSelect: (apartment: Apartment) => void;
}

export const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, onSelect }) => {
  const { currentUser, openAuthModal, openKycModal, showNotification } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    dbService.getApartmentReviews(apartment.id).then((revs) => {
      if (isMounted) {
        setReviewsCount(revs.length);
        if (revs.length > 0) {
          const avg = (revs.reduce((a, b) => a + b.rating, 0) / revs.length).toFixed(1);
          setAvgRating(avg);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [apartment.id]);

  const rawImages = apartment.images && apartment.images.length > 0
    ? apartment.images
    : ['/images/apartment_adrar_modern_1_1794234918725.jpg'];

  const images = rawImages.map((img) => img.replace('/src/assets/images/', '/images/'));

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Strictly enforced Guest vs Logged-In User Booking Flow + KYC Verification:
  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. If user is NOT logged in: Prompt to sign in / register first!
    if (!currentUser) {
      openAuthModal(
        `يرجى تسجيل الدخول أو إنشاء حساب للمتابعة وحجز الشقة [${apartment.title}] كود [${apartment.code}]`,
        apartment
      );
      return;
    }

    // 2. If user is logged in but KYC status is NOT verified (and not admin):
    const kycStatus = currentUser.kyc_status || (currentUser.is_active ? 'verified' : 'unverified');
    if (currentUser.role !== 'admin' && kycStatus !== 'verified') {
      showNotification(
        kycStatus === 'pending' || kycStatus === 'pending_review'
          ? 'وثائقك قيد المراجعة حالياً من طرف الإدارة. سيتم إتاحة حجز الشقق فور التفعيل.'
          : 'يجب تفعيل حسابك برفع بطاقة التعريف أولاً لتتمكن من إرسال طلب الكراء.',
        'warning'
      );
      openKycModal();
      return;
    }

    // 2. If logged in: Open WhatsApp directly to +213 696980328 with official details
    const displayPrice =
      apartment.rental_type === 'monthly'
        ? `${apartment.monthly_price.toLocaleString('fr-DZ')} دج (شهري)`
        : apartment.rental_type === 'yearly'
        ? `${apartment.yearly_price.toLocaleString('fr-DZ')} دج (سنوي)`
        : `${apartment.monthly_price.toLocaleString('fr-DZ')} دج شهرياً / ${apartment.yearly_price.toLocaleString('fr-DZ')} دج سنوياً`;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://adrar-immo.dz';
    const apartmentLink = `${currentUrl}#${apartment.code}`;

    const textMessage = `السلام عليكم ورحمة الله، أنا ${currentUser.full_name} (رقم الهاتف: ${currentUser.phone})، مهتم بكراء الشقة [${apartment.title}] كود [${apartment.code}] المعروضة بسعر ${displayPrice} في ${apartment.municipality}. رابط الشقة: ${apartmentLink}`;

    const waUrl = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const isAvailable = apartment.status === 'available';

  return (
    <div
      onClick={() => onSelect(apartment)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/90 hover:border-stone-300 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Image Slider */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={images[currentImageIndex]}
          alt={apartment.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1E4D38]/95 text-white shadow-xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>متاحة الآن</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C85A32]/95 text-white shadow-xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-amber-200" />
              <span>مؤجرة حالياً</span>
            </span>
          )}
        </div>

        {/* Municipality & Code */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs text-white/95 font-medium bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
          <MapPin className="w-3.5 h-3.5 text-amber-300" />
          <span>{apartment.municipality}</span>
          <span className="opacity-40">|</span>
          <span className="tabular-nums font-mono text-[11px] text-amber-200">{apartment.code}</span>
        </div>

        {/* Slider Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              aria-label="الصورة التالية"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Price on Bottom of Image */}
        <div className="absolute bottom-3 right-3 z-10 text-white">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black tabular-nums tracking-tight text-white drop-shadow-xs">
              {apartment.rental_type === 'yearly'
                ? apartment.yearly_price.toLocaleString('fr-DZ')
                : apartment.monthly_price.toLocaleString('fr-DZ')}
            </span>
            <span className="text-xs font-bold text-amber-200">
              دج / {apartment.rental_type === 'yearly' ? 'سنة' : 'شهر'}
            </span>
          </div>
          {apartment.rental_type === 'both' && (
            <p className="text-[10px] text-stone-200">
              أو {apartment.yearly_price.toLocaleString('fr-DZ')} دج سنوياً
            </p>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-[#C85A32] transition-colors flex-1">
              {apartment.title}
            </h3>
            {avgRating && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/90 shrink-0 shadow-2xs">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="tabular-nums">{avgRating}</span>
                <span className="text-stone-400 font-normal text-[10px]">({reviewsCount})</span>
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {apartment.description}
          </p>

          {/* Clean Specs Typography */}
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium">{apartment.rooms} غرف</span>
            </div>
            <span className="text-stone-300">·</span>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium tabular-nums">{apartment.area} م²</span>
            </div>
            <span className="text-stone-300">·</span>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium">{apartment.floor}</span>
            </div>
          </div>

          {/* Saharan Amenities */}
          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-stone-500">
            <span className="flex items-center gap-1 text-emerald-800">
              <Droplets className="w-3 h-3 text-[#1E4D38]" />
              <span>خزان ماء مستقل</span>
            </span>
            <span className="text-stone-300">·</span>
            <span className="flex items-center gap-1 text-amber-800">
              <Wind className="w-3 h-3 text-[#C85A32]" />
              <span>تكييف صحراوي</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleBookingClick}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1E4D38] hover:bg-[#163a2a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title={currentUser ? 'حجز مباشر عبر واتساب' : 'يرجى تسجيل الدخول أولاً للحجز'}
          >
            <MessageCircle className="w-4 h-4 text-emerald-300" />
            <span>طلب الكراء (واتساب)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(apartment)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>عرض التفاصيل</span>
          </button>
        </div>
      </div>
    </div>
  );
};

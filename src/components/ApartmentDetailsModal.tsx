import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Home,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  ShieldCheck,
  Wind,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OFFICIAL_WHATSAPP_NUMBER } from '../services/supabase';
import { Apartment } from '../types';
import { ApartmentReviewsSection } from './ApartmentReviewsSection';

interface ApartmentDetailsModalProps {
  apartment: Apartment | null;
  onClose: () => void;
}

export const ApartmentDetailsModal: React.FC<ApartmentDetailsModalProps> = ({
  apartment,
  onClose,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  if (!apartment) return null;

  const rawImages = apartment.images && apartment.images.length > 0
    ? apartment.images
    : ['/images/apartment_adrar_modern_1_1794234918725.jpg'];

  const images = rawImages.map((img) => img.replace('/src/assets/images/', '/images/'));

  const handleBooking = () => {
    // 1. If not logged in, prompt to log in first!
    if (!currentUser) {
      onClose();
      openAuthModal(
        `يرجى تسجيل الدخول أو إنشاء حساب للمتابعة وحجز الشقة [${apartment.title}] كود [${apartment.code}]`,
        apartment
      );
      return;
    }

    // 2. If logged in, open official WhatsApp with user details
    const displayPrice =
      apartment.rental_type === 'monthly'
        ? `${apartment.monthly_price.toLocaleString('fr-DZ')} دج شهرياً`
        : apartment.rental_type === 'yearly'
        ? `${apartment.yearly_price.toLocaleString('fr-DZ')} دج سنوياً`
        : `${apartment.monthly_price.toLocaleString('fr-DZ')} دج (شهري) / ${apartment.yearly_price.toLocaleString('fr-DZ')} دج (سنوي)`;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://adrar-immo.dz';
    const apartmentLink = `${currentUrl}#${apartment.code}`;

    const textMessage = `السلام عليكم ورحمة الله، أنا ${currentUser.full_name} (رقم الهاتف: ${currentUser.phone})، مهتم بكراء الشقة [${apartment.title}] كود [${apartment.code}] المعروضة بسعر ${displayPrice} في ${apartment.municipality}. رابط الشقة: ${apartmentLink}`;

    const waUrl = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const isAvailable = apartment.status === 'available';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Showcase Image */}
        <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-stone-900 overflow-hidden">
          <img
            src={images[activeImgIndex]}
            alt={apartment.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImgIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Code & Municipality */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="bg-[#1E4D38] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
              {apartment.municipality}
            </span>
            <span className="bg-white/90 text-stone-900 font-mono text-xs font-bold px-3 py-1 rounded-full shadow-xs">
              {apartment.code}
            </span>
          </div>

          {/* Title & Price */}
          <div className="absolute bottom-4 right-4 left-4 z-10 text-white flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold drop-shadow-md leading-tight">
                {apartment.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{apartment.address}</span>
              </p>
            </div>

            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
              <span className="text-2xl font-black tabular-nums text-amber-300">
                {apartment.rental_type === 'yearly'
                  ? apartment.yearly_price.toLocaleString('fr-DZ')
                  : apartment.monthly_price.toLocaleString('fr-DZ')}
              </span>
              <span className="text-xs font-bold text-white mr-1.5">
                دج / {apartment.rental_type === 'yearly' ? 'سنة' : 'شهر'}
              </span>
            </div>
          </div>
        </div>

        {/* Thumbnail Bar */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 bg-stone-100 overflow-x-auto border-b border-stone-200">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  idx === activeImgIndex ? 'border-[#C85A32] ring-2 ring-[#C85A32]/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Body Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-stone-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center shrink-0">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">عدد الغرف</span>
                <span className="text-sm font-bold text-stone-900">{apartment.rooms} غرف</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1E4D38] flex items-center justify-center shrink-0">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">المساحة الإجمالية</span>
                <span className="text-sm font-bold text-stone-900 tabular-nums">{apartment.area} م²</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">الطابق</span>
                <span className="text-sm font-bold text-stone-900">{apartment.floor}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">التكييف الصحراوي</span>
                <span className="text-sm font-bold text-stone-900">متوفر ومجهز</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-2">وصف الشقة والموقع:</h4>
            <p className="text-sm text-stone-600 leading-relaxed bg-[#FDFBF7] p-4 rounded-xl border border-stone-200">
              {apartment.description}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#1E4D38]" />
              <span>المرافق والتجهيزات المتوفرة (خاصة بالمناخ الصحراوي بأدرار):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {apartment.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 font-medium"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#1E4D38] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stars & Reviews Section (Strictly restricted to tenants with ended leases) */}
          <ApartmentReviewsSection apartment={apartment} />

          {/* Footer Action */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1E4D38]/10 text-[#1E4D38] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-stone-500 block">واتساب الإدارة المباشر:</span>
                <p className="text-xs font-mono font-bold text-stone-800 tabular-nums">+213 696980328</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBooking}
              disabled={!isAvailable}
              className="py-3 px-6 bg-[#1E4D38] hover:bg-[#153828] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>
                {!isAvailable
                  ? 'الشقة مؤجرة حالياً'
                  : currentUser
                  ? 'طلب الكراء عبر واتساب الآن'
                  : 'تسجيل الدخول لطلب الكراء'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

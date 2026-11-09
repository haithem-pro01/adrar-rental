import React from 'react';
import {
  Bath,
  Bed,
  Eye,
  Home,
  MapPin,
  Maximize2,
  MessageCircle,
  Sofa,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/supabase';
import { useTranslation } from '../services/translations';
import { Listing, RentPeriod } from '../types';

interface PropertyCardProps {
  listing: Listing;
  period: RentPeriod;
  onSelect: (listing: Listing) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  listing,
  period,
  onSelect,
}) => {
  const { language, currentUser } = useAuth();
  const t = useTranslation(language);

  // Compute active price based on period
  let displayPrice = listing.price_month;
  let priceSuffix = t.perMonth;
  if (period === 'night') {
    displayPrice = listing.price_night || Math.round(listing.price_month / 3);
    priceSuffix = t.perDay;
  } else if (period === 'year') {
    displayPrice = listing.price_year || listing.price_month * 11;
    priceSuffix = t.perYear;
  }

  const isAvailable = listing.status === 'available';
  const title = language === 'fr' ? listing.title_fr : listing.title_ar;

  const handleWhatsAppBooking = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = dbService.formatWhatsAppUrl(listing, period, currentUser);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group relative bg-[#101D33] dark:bg-[#101D33] border border-[#1C2C47] hover:border-[#C5A059]/60 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Top Image Showcase */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#0A1424]">
        <img
          src={listing.image_url || '/images/apartment_adrar_modern_1_1794234918725.jpg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Ambient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101D33] via-transparent to-black/30 pointer-events-none" />

        {/* Floating Gold Price Badge (Matches MacBook Mockup Exactly) */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFBF7A] text-stone-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-1">
            <span className="tabular-nums font-mono">{displayPrice.toLocaleString('fr-DZ')}</span>
            <span className="text-[11px] font-sans">{priceSuffix}</span>
          </div>
        </div>

        {/* Floating Neighborhood & Ref Code (Top Left) */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-stone-200 border border-white/10">
          <MapPin className="w-3 h-3 text-[#DFBF7A]" />
          <span>{listing.neighborhood}</span>
          <span className="text-white/30">|</span>
          <span className="font-mono text-[#DFBF7A] text-[10px]">{listing.ref_code}</span>
        </div>

        {/* Status Indicator (Bottom Left of Image) */}
        <div className="absolute bottom-3 left-3 z-10">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white shadow-xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{t.available}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white shadow-xs">
              <span>{t.rented}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-white">
        <div>
          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[#DFBF7A] transition-colors line-clamp-1 leading-snug">
            {title}
          </h3>

          {/* Horizontal Geometric Specs Row (Matches MacBook Mockup: 🛏️ 3 غرف | 🛁 2 حمامات | 🛋️ 1 صالون | 📐 120 م²) */}
          <div className="mt-3.5 pt-3 border-t border-[#1C2C47] flex items-center justify-between text-xs text-stone-300 font-medium">
            <div className="flex items-center gap-1" title={t.rooms}>
              <Bed className="w-3.5 h-3.5 text-[#DFBF7A]" />
              <span className="tabular-nums font-mono">{listing.bedrooms}</span>
              <span className="text-[11px] text-stone-400">{t.rooms}</span>
            </div>

            <span className="text-stone-600">|</span>

            <div className="flex items-center gap-1" title={t.bathrooms}>
              <Bath className="w-3.5 h-3.5 text-[#DFBF7A]" />
              <span className="tabular-nums font-mono">{listing.bathrooms}</span>
              <span className="text-[11px] text-stone-400">{t.bathrooms}</span>
            </div>

            <span className="text-stone-600">|</span>

            <div className="flex items-center gap-1" title={t.livingRooms}>
              <Sofa className="w-3.5 h-3.5 text-[#DFBF7A]" />
              <span className="tabular-nums font-mono">{listing.living_rooms || 1}</span>
              <span className="text-[11px] text-stone-400">{t.livingRooms}</span>
            </div>

            <span className="text-stone-600">|</span>

            <div className="flex items-center gap-1" title={t.areaUnit}>
              <Maximize2 className="w-3.5 h-3.5 text-[#DFBF7A]" />
              <span className="tabular-nums font-mono">{listing.area_m2}</span>
              <span className="text-[11px] text-stone-400">{t.areaUnit}</span>
            </div>
          </div>
        </div>

        {/* Full-width Emerald WhatsApp Action Button (Matches MacBook Mockup: 💬 احجز عبر واتساب) */}
        <div className="mt-4 pt-3 border-t border-[#1C2C47]">
          <button
            type="button"
            onClick={handleWhatsAppBooking}
            className="w-full py-3 px-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer group/btn"
          >
            <MessageCircle className="w-4 h-4 text-emerald-100 group-hover/btn:scale-110 transition-transform" />
            <span>{t.bookViaWhatsApp}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

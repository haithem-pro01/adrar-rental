import React from 'react';
import { ChevronDown, Filter, MapPin, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADRAR_NEIGHBORHOODS } from '../services/supabase';
import { useTranslation } from '../services/translations';
import { AdrarNeighborhood, RentPeriod } from '../types';

interface HeroSectionProps {
  selectedPeriod: RentPeriod;
  onSelectPeriod: (period: RentPeriod) => void;
  selectedNeighborhood: string;
  onSelectNeighborhood: (neighborhood: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedPeriod,
  onSelectPeriod,
  selectedNeighborhood,
  onSelectNeighborhood,
  searchQuery,
  onSearchChange,
}) => {
  const { language } = useAuth();
  const t = useTranslation(language);

  return (
    <section className="relative overflow-hidden bg-[#060D18] text-white pt-12 pb-20 sm:pt-16 sm:pb-24">
      {/* Background Hero Villa Image with Luxury Obsidian Navy Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_adrar_luxury_1794234917435.jpg"
          alt="Luxury Villa in Adrar"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1424]/85 via-[#060D18]/90 to-[#060D18]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101D33]/90 border border-[#C5A059]/40 text-[#DFBF7A] text-xs font-semibold mb-6 shadow-md backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>وكالة زَيــد العقارية — أرقى عقارات ولاية أدرار</span>
        </div>

        {/* Master Heading (Matches MacBook Mockup Exactly) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-snug">
          {t.heroTitle}
        </h1>
        <p className="mt-4 text-xs sm:text-sm text-stone-300 max-w-2xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Floating Luxury Search Box with Gold Accent Tabs (Exact Match to Mockup) */}
        <div className="mt-10 max-w-3xl mx-auto">
          {/* Period Tabs */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => onSelectPeriod('night')}
              className={`py-2 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                selectedPeriod === 'night'
                  ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBF7A] text-stone-950 font-black scale-102 ring-2 ring-[#DFBF7A]/40'
                  : 'bg-[#101D33]/80 hover:bg-[#14233C] text-stone-300 border border-[#1A2942]'
              }`}
            >
              {t.rentDaily}
            </button>

            <button
              type="button"
              onClick={() => onSelectPeriod('month')}
              className={`py-2 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                selectedPeriod === 'month'
                  ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBF7A] text-stone-950 font-black scale-102 ring-2 ring-[#DFBF7A]/40'
                  : 'bg-[#101D33]/80 hover:bg-[#14233C] text-stone-300 border border-[#1A2942]'
              }`}
            >
              {t.rentMonthly}
            </button>

            <button
              type="button"
              onClick={() => onSelectPeriod('year')}
              className={`py-2 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                selectedPeriod === 'year'
                  ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBF7A] text-stone-950 font-black scale-102 ring-2 ring-[#DFBF7A]/40'
                  : 'bg-[#101D33]/80 hover:bg-[#14233C] text-stone-300 border border-[#1A2942]'
              }`}
            >
              {t.rentYearly}
            </button>
          </div>

          {/* Search Bar (Rounded White Container with Dropdown & Filter Icon) */}
          <div className="bg-white rounded-3xl p-2 sm:p-2.5 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2">
            
            {/* Neighborhood Dropdown (Adrar Centre) */}
            <div className="relative w-full sm:w-1/2">
              <MapPin className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C5A059] pointer-events-none" />
              <select
                value={selectedNeighborhood}
                onChange={(e) => onSelectNeighborhood(e.target.value)}
                className="w-full pr-10 pl-4 py-3 text-xs sm:text-sm rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200 focus:outline-none focus:border-[#C5A059] appearance-none font-bold cursor-pointer"
              >
                <option value="all">{t.allNeighborhoods}</option>
                {ADRAR_NEIGHBORHOODS.map((nh) => (
                  <option key={nh} value={nh}>
                    {nh}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>

            {/* Keyword / Code Search */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pr-10 pl-4 py-3 text-xs sm:text-sm rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200 focus:outline-none focus:border-[#C5A059] font-medium"
              />
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('listings-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-[#0A1424] hover:bg-[#101D33] text-[#DFBF7A] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-[#C5A059]/40 transition-all cursor-pointer shrink-0"
            >
              <Filter className="w-4 h-4 text-[#C5A059]" />
              <span>{t.filterButton}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

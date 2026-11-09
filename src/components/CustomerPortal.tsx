import React, { useEffect, useState } from 'react';
import {
  Building2,
  ChevronDown,
  Home,
  KeyRound,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/supabase';
import { Apartment, Lease, Municipality, RentalType } from '../types';
import { ApartmentCard } from './ApartmentCard';
import { ApartmentDetailsModal } from './ApartmentDetailsModal';

const ADRAR_MUNICIPALITIES: { label: string; value: string }[] = [
  { label: 'الكل', value: 'الكل' },
  { label: 'أدرار (المركز)', value: 'أدرار' },
  { label: 'تيميمون (الواحة الحمراء)', value: 'تيميمون' },
  { label: 'رقان', value: 'رقان' },
  { label: 'فنوغيل', value: 'فنوغيل' },
  { label: 'تسابيت', value: 'تسابيت' },
  { label: 'زاوية كنتة', value: 'زاوية كنتة' },
  { label: 'أولف', value: 'أولف' },
];

export const CustomerPortal: React.FC = () => {
  const { currentUser, navigateTo } = useAuth();

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [activeLease, setActiveLease] = useState<Lease | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('الكل');
  const [rentalDurationFilter, setRentalDurationFilter] = useState<RentalType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected apartment for full details modal
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const apts = await dbService.getApartments();
        setApartments(apts);

        if (currentUser) {
          const lease = await dbService.getTenantActiveLease(currentUser.id);
          setActiveLease(lease);
        } else {
          setActiveLease(null);
        }
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Filtering
  const filteredApartments = apartments.filter((apt) => {
    if (apt.status === 'hidden') return false;

    if (selectedMunicipality !== 'الكل' && apt.municipality !== selectedMunicipality) {
      return false;
    }

    if (rentalDurationFilter !== 'all') {
      if (apt.rental_type !== rentalDurationFilter && apt.rental_type !== 'both') {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        apt.title.toLowerCase().includes(q) ||
        apt.code.toLowerCase().includes(q) ||
        apt.address.toLowerCase().includes(q) ||
        apt.municipality.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-16">
      {/* Saharan Luxury Hero Banner */}
      <section className="relative overflow-hidden bg-[#1E4D38] text-white">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/hero_adrar_luxury_1794234917435.jpg"
            alt="Adrar Saharan Oasis"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#1E4D38] via-[#1E4D38]/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-amber-200 text-xs font-semibold mb-4 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>المنصة الرسمية الأولى لكراء العقارات الفاخرة بولاية أدرار</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              سكن الواحات الفاخر في قلب الصحراء الكبرى
            </h1>
            <p className="mt-3 text-sm sm:text-base text-stone-200 leading-relaxed font-medium">
              شقق وفلل ومنازل مفروشة للكراء الشهري والسنوي في أدرار، تيميمون، رقان وفنوغيل.
              تجهيزات كاملة متكيفة مع المناخ الصحراوي، وحجز مباشر عبر واتساب في ثوانٍ.
            </p>
          </div>

          {/* Quick Search & Filter Strip */}
          <div className="mt-8 bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-stone-200 text-stone-900 max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Keyword / Code Search */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالبلدية، الحي، أو كود الشقة (مثال: ADR-1042)..."
                  className="w-full pr-9 pl-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32] bg-stone-50/50"
                />
              </div>

              {/* Municipality Select */}
              <div className="sm:col-span-4 relative">
                <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#1E4D38]" />
                <select
                  value={selectedMunicipality}
                  onChange={(e) => setSelectedMunicipality(e.target.value)}
                  className="w-full pr-9 pl-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32] bg-stone-50/50 appearance-none font-medium cursor-pointer"
                >
                  {ADRAR_MUNICIPALITIES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              </div>

              {/* Rental Duration Filter */}
              <div className="sm:col-span-3">
                <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRentalDurationFilter(rentalDurationFilter === 'monthly' ? 'all' : 'monthly')}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      rentalDurationFilter === 'monthly'
                        ? 'bg-[#1E4D38] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    كراء شهري
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentalDurationFilter(rentalDurationFilter === 'yearly' ? 'all' : 'yearly')}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      rentalDurationFilter === 'yearly'
                        ? 'bg-[#C85A32] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    كراء سنوي
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Active Rental Banner for Logged-In Tenants */}
        {currentUser && activeLease && (
          <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E4D38] text-amber-200 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1E4D38] block">
                  عقد كراء نشط مسجل باسمك
                </span>
                <p className="text-sm font-bold text-stone-900">
                  {activeLease.apartment_title} ({activeLease.apartment_code})
                </p>
                <span className="text-xs text-stone-500">
                  ساري حتى {activeLease.end_date} · {activeLease.rent_amount.toLocaleString('fr-DZ')} دج
                </span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('/my-rentals')}
              className="py-2 px-4 bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              عرض تفاصيل عقدي الحالي
            </button>
          </div>
        )}

        {/* Municipality Filter Pills */}
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700">بلديات أدرار:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {ADRAR_MUNICIPALITIES.map((mun) => (
                <button
                  key={mun.value}
                  onClick={() => setSelectedMunicipality(mun.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedMunicipality === mun.value
                      ? 'bg-amber-100/90 text-[#C85A32] font-bold border border-amber-300'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {mun.label}
                </button>
              ))}
            </div>
          </div>

          {(selectedMunicipality !== 'الكل' || rentalDurationFilter !== 'all' || searchQuery.trim()) && (
            <button
              onClick={() => {
                setSelectedMunicipality('الكل');
                setRentalDurationFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#C85A32] hover:underline font-semibold whitespace-nowrap cursor-pointer"
            >
              إلغاء الفلاتر
            </button>
          )}
        </div>

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-stone-900">
            {selectedMunicipality === 'الكل'
              ? `الشقق المتاحة للكراء بولاية أدرار (${filteredApartments.length})`
              : `الشقق المعروضة في بلدية ${selectedMunicipality} (${filteredApartments.length})`}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            تجهيزات صحراوية كاملة (مكيف صحراوي، خزان ماء 2000L، ألياف بصرية)
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs h-96 animate-pulse"
              >
                <div className="bg-stone-200 h-48 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-8 bg-stone-100 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredApartments.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              لا توجد شقق مطابقة للبحث حالياً
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              جرّب تغيير البلدية أو إلغاء فلاتر الكراء للاطلاع على كافة العقارات المتاحة.
            </p>
            <button
              onClick={() => {
                setSelectedMunicipality('الكل');
                setRentalDurationFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              إظهار كافة الشقق
            </button>
          </div>
        ) : (
          /* Apartments Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApartments.map((apartment) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                onSelect={(apt) => setSelectedApartment(apt)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Apartment Details Modal */}
      <ApartmentDetailsModal
        apartment={selectedApartment}
        onClose={() => setSelectedApartment(null)}
      />
    </div>
  );
};

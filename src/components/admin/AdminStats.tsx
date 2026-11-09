import React from 'react';
import {
  Banknote,
  Building2,
  CheckCircle2,
  KeyRound,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Apartment, Lease, UserProfile } from '../../types';

interface AdminStatsProps {
  apartments: Apartment[];
  tenants: UserProfile[];
  leases: Lease[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  apartments,
  tenants,
  leases,
}) => {
  const totalProperties = apartments.length;
  const availableProperties = apartments.filter((a) => a.status === 'available').length;
  const rentedProperties = apartments.filter((a) => a.status === 'rented').length;
  const activeTenants = tenants.filter((t) => t.is_active && t.role === 'tenant').length;

  // Estimated Revenue calculation based on active leases
  const activeLeases = leases.filter((l) => l.status === 'active' || l.status === 'expiring_soon');
  const estimatedMonthlyRevenue = activeLeases.reduce((acc, curr) => {
    if (curr.lease_type === 'monthly') return acc + curr.rent_amount;
    return acc + Math.round(curr.rent_amount / 12);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* 1. Total Properties */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500">إجمالي العقارات</span>
          <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-stone-900 tabular-nums">
            {totalProperties}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">شقة مسجلة في أدرار</span>
        </div>
      </div>

      {/* 2. Available */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-700">شقق متاحة للكراء</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1E4D38] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-[#1E4D38] tabular-nums">
            {availableProperties}
          </div>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">جاهزة للتأجير الفوري</span>
        </div>
      </div>

      {/* 3. Rented */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#C85A32]">شقق مؤجرة حالياً</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#C85A32] flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-[#C85A32] tabular-nums">
            {rentedProperties}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">تحت عقود إيجارية نشطة</span>
        </div>
      </div>

      {/* 4. Active Tenants */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500">المستأجرين المفعّلين</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-stone-900 tabular-nums">
            {activeTenants}
          </div>
          <span className="text-[11px] text-blue-600/80 mt-1 block">حسابات نشطة ومحققة</span>
        </div>
      </div>

      {/* 5. Estimated Revenue */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500">العائد التقديري الشهري</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Banknote className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xl font-black text-[#1E4D38] tabular-nums">
            {estimatedMonthlyRevenue.toLocaleString('fr-DZ')} <span className="text-xs font-bold">دج</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>محسوب من العقود الجارية</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck,
  Plus,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { dbService } from '../../services/supabase';
import { Apartment, Lease, UserProfile } from '../../types';

interface LeaseManagementProps {
  leases: Lease[];
  apartments: Apartment[];
  tenants: UserProfile[];
  preSelectedTenant?: UserProfile | null;
  onRefresh: () => void;
  onNotification: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}

export const LeaseManagement: React.FC<LeaseManagementProps> = ({
  leases,
  apartments,
  tenants,
  preSelectedTenant,
  onRefresh,
  onNotification,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState(preSelectedTenant?.id || '');
  const [leaseType, setLeaseType] = useState<'monthly' | 'yearly'>('monthly');
  const [rentAmount, setRentAmount] = useState<number>(50000);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2027-10-31');
  const [notes, setNotes] = useState('عقد كراء موثق مع تسديد شهري منتظم.');

  // Open modal with preselected options
  const openNewLeaseModal = () => {
    // Pick first available apartment if any
    const available = apartments.find((a) => a.status === 'available');
    if (available) {
      setSelectedApartmentId(available.id);
      setRentAmount(available.monthly_price);
    } else if (apartments.length > 0) {
      setSelectedApartmentId(apartments[0].id);
      setRentAmount(apartments[0].monthly_price);
    }

    if (preSelectedTenant) {
      setSelectedTenantId(preSelectedTenant.id);
    } else if (tenants.length > 0) {
      setSelectedTenantId(tenants[0].id);
    }

    setIsModalOpen(true);
  };

  const handleApartmentChange = (aptId: string) => {
    setSelectedApartmentId(aptId);
    const apt = apartments.find((a) => a.id === aptId);
    if (apt) {
      if (leaseType === 'yearly') {
        setRentAmount(apt.yearly_price);
      } else {
        setRentAmount(apt.monthly_price);
      }
    }
  };

  const handleLeaseTypeChange = (type: 'monthly' | 'yearly') => {
    setLeaseType(type);
    const apt = apartments.find((a) => a.id === selectedApartmentId);
    if (apt) {
      setRentAmount(type === 'yearly' ? apt.yearly_price : apt.monthly_price);
    }
    // Update default end date (1 month vs 1 year)
    if (type === 'monthly') {
      setEndDate('2026-12-01');
    } else {
      setEndDate('2027-10-31');
    }
  };

  // Critical requirement: When assigned, property status automatically switches to "مؤجرة"
  const handleSaveLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApartmentId || !selectedTenantId) {
      onNotification('يرجى اختيار الشقة والمستأجر', 'warning');
      return;
    }

    try {
      const chosenTenant = tenants.find((t) => t.id === selectedTenantId);
      const chosenApartment = apartments.find((a) => a.id === selectedApartmentId);

      if (!chosenTenant || !chosenApartment) {
        onNotification('يرجى اختيار الشقة والمستأجر', 'warning');
        return;
      }

      await dbService.createLease({
        apartment_id: selectedApartmentId,
        tenant_id: selectedTenantId,
        tenant_name: chosenTenant.full_name,
        tenant_phone: chosenTenant.phone,
        apartment_title: chosenApartment.title,
        apartment_code: chosenApartment.code,
        apartment_municipality: chosenApartment.municipality,
        apartment_image: chosenApartment.images?.[0],
        lease_type: leaseType,
        rent_amount: Number(rentAmount),
        start_date: startDate,
        end_date: endDate,
        notes,
      });

      onNotification(
        'تم تسجيل وتعيين عقد الكراء بنجاح! تم تحويل حالة الشقة تلقائياً إلى [مؤجرة].',
        'success'
      );
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      onNotification('فشل إنشاء عقد الكراء', 'error');
    }
  };

  const handleEndLease = async (leaseId: string) => {
    if (confirm('هل ترغب في إنهاء هذا العقد وإعادة الشقة إلى الحالة "متاحة"؟')) {
      await dbService.endLease(leaseId);
      onNotification('تم إنهاء العقد وإرجاع الشقة لقائمة المتاح.', 'success');
      onRefresh();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">إدارة عقود الكراء والتعيين</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            ربط الشقق بالمستأجرين وتوليد العقود والتحويل التلقائي للحالة إلى "مؤجرة"
          </p>
        </div>

        <button
          onClick={openNewLeaseModal}
          className="flex items-center gap-2 py-2.5 px-4 bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء وتعيين عقد كراء جديد</span>
        </button>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
              <tr>
                <th className="py-3 px-4">رقم العقد</th>
                <th className="py-3 px-4">الشقة المستأجرة</th>
                <th className="py-3 px-4">المستأجر</th>
                <th className="py-3 px-4">نوع وسعر الكراء</th>
                <th className="py-3 px-4">مدة وسريان العقد</th>
                <th className="py-3 px-4">حالة العقد</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {leases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    لا توجد عقود كراء مسجلة حتى الآن.
                  </td>
                </tr>
              ) : (
                leases.map((lease) => {
                  const isExpiringSoon = lease.status === 'expiring_soon';
                  const isEnded = lease.status === 'ended';

                  return (
                    <tr key={lease.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-600">
                        #{lease.id.slice(-6)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{lease.apartment_title}</div>
                        <span className="text-[10px] text-[#C85A32] font-mono font-bold">
                          {lease.apartment_code} · بلدية {lease.apartment_municipality}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{lease.tenant_name}</div>
                        <span className="text-[10px] text-stone-500 font-mono tabular-nums">
                          {lease.tenant_phone}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1E4D38] tabular-nums">
                          {lease.rent_amount.toLocaleString('fr-DZ')} دج
                        </div>
                        <span className="text-[10px] text-stone-500">
                          {lease.lease_type === 'monthly' ? 'دفع شهري' : 'دفع سنوي'}
                        </span>
                      </td>

                      <td className="py-3 px-4 tabular-nums">
                        <div className="text-stone-800 font-medium">من {lease.start_date}</div>
                        <div className="text-stone-500 text-[10px]">إلى {lease.end_date}</div>
                      </td>

                      <td className="py-3 px-4">
                        {isEnded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-600">
                            منتهي
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-900">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>ينتهي قريباً</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>نشط وسارٍ</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {!isEnded ? (
                          <button
                            onClick={() => handleEndLease(lease.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors"
                            title="إنهاء العقد وإتاحة الشقة مجدداً"
                          >
                            إنهاء العقد
                          </button>
                        ) : (
                          <span className="text-stone-400 text-[11px]">مكتمل</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lease Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
              <div className="flex items-center gap-2 text-[#1E4D38]">
                <FileCheck className="w-5 h-5" />
                <h3 className="font-bold text-base text-stone-900">
                  تعيين شقة لمستأجر وإنشاء عقد كراء
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLease} className="space-y-4 text-xs">
              {/* Select Apartment */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  اختر الشقة المراد تأجيرها *
                </label>
                <select
                  required
                  value={selectedApartmentId}
                  onChange={(e) => handleApartmentChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                >
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      [{apt.code}] {apt.title} ({apt.municipality}) - {apt.status === 'available' ? '✓ متاحة' : 'مؤجرة حالياً'}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#C85A32] font-semibold mt-1 block">
                  ملاحظة: فور حفظ العقد، ستتحول حالة هذه الشقة تلقائياً إلى "مؤجرة".
                </span>
              </div>

              {/* Select Tenant */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  اختر المستأجر المعتمد *
                </label>
                <select
                  required
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.full_name} ({tenant.phone}) - {tenant.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lease Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleLeaseTypeChange('monthly')}
                  className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                    leaseType === 'monthly'
                      ? 'border-[#1E4D38] bg-[#1E4D38]/10 text-[#1E4D38]'
                      : 'border-stone-200 bg-stone-50 text-stone-600'
                  }`}
                >
                  كراء شهري (Monthly)
                </button>
                <button
                  type="button"
                  onClick={() => handleLeaseTypeChange('yearly')}
                  className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                    leaseType === 'yearly'
                      ? 'border-[#C85A32] bg-[#C85A32]/10 text-[#C85A32]'
                      : 'border-stone-200 bg-stone-50 text-stone-600'
                  }`}
                >
                  كراء سنوي (Yearly)
                </button>
              </div>

              {/* Agreed Rent */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  مبلغ الإيجار المتفق عليه (دج) *
                </label>
                <input
                  type="number"
                  required
                  value={rentAmount}
                  onChange={(e) => setRentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-200 tabular-nums"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">تاريخ بداية العقد</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">تاريخ نهاية العقد</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 tabular-nums"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">شروط وملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#1E4D38] hover:bg-[#153828] text-white font-bold rounded-xl shadow-xs"
                >
                  تأكيد وتعيين العقد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

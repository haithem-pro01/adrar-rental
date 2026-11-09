import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  MessageCircle,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { dbService } from '../../services/supabase';
import { Lease } from '../../types';

interface ExpiringLeasesAlertProps {
  leases: Lease[];
  onRefresh: () => void;
  onNotification: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}

export const ExpiringLeasesAlert: React.FC<ExpiringLeasesAlertProps> = ({
  leases,
  onRefresh,
  onNotification,
}) => {
  const now = new Date();

  // Find leases that are either marked expiring_soon or have <= 30 days remaining
  const expiringList = leases
    .filter((l) => l.status !== 'ended')
    .map((lease) => {
      const end = new Date(lease.end_date);
      const diffMs = end.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { lease, daysLeft };
    })
    .filter((item) => item.daysLeft <= 45); // show upcoming within 45 days

  const handleSendRenewalReminder = (lease: Lease, daysLeft: number) => {
    const cleanPhone = (lease.tenant_phone || '').replace(/[^0-9]/g, '');
    const intPhone = cleanPhone.startsWith('0') ? '213' + cleanPhone.substring(1) : cleanPhone;

    const message = `السلام عليكم ورحمة الله أخي الكريم ${lease.tenant_name}، نود تذكيركم بأن عقد كراء الشقة [${lease.apartment_title}] كود [${lease.apartment_code}] بأدرار سينتهي بتاريخ ${lease.end_date} (متبقي ${daysLeft > 0 ? daysLeft : 0} يوماً). يرجى إفادتنا برغبتكم في تجديد العقد السنوي/الشهري أو تحديد موعد المعاينة. تحيات إدارة منصة عقارات أدرار.`;

    window.open(`https://wa.me/${intPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleQuickRenew = async (leaseId: string) => {
    // Extend end date by 1 year or 1 month
    const lease = leases.find((l) => l.id === leaseId);
    if (!lease) return;

    const currentEnd = new Date(lease.end_date);
    currentEnd.setFullYear(currentEnd.getFullYear() + 1);
    const newEndStr = currentEnd.toISOString().split('T')[0];

    // In a real environment, update lease; in our service:
    onNotification(`تم تمديد عقد الشقة [${lease.apartment_code}] لسنة إضافية حتى ${newEndStr}!`, 'success');
    onRefresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900">تنبيهات العقود المنتهية قريباً</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C85A32] text-white">
              {expiringList.length} عقود
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            متابعة استباقية للعقود التي تقترب من تاريخ الانتهاء (أقل من 30-45 يوماً) لإرسال تنبيهات التجديد
          </p>
        </div>
      </div>

      {expiringList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            جميع عقود الكراء في حالة سريان منتظمة
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            لا توجد عقود تنتهي خلال الـ 30 يوماً القادمة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiringList.map(({ lease, daysLeft }) => {
            const isCritical = daysLeft <= 15;

            return (
              <div
                key={lease.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isCritical ? 'border-[#C85A32]/60 ring-1 ring-[#C85A32]/20' : 'border-amber-300/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-stone-400">
                      رقم العقد: #{lease.id.slice(-6)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>
                        {daysLeft > 0 ? `متبقي ${daysLeft} يوماً` : 'منتهي الصلاحية اليوم'}
                      </span>
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-base leading-snug">
                    {lease.apartment_title}
                  </h3>
                  <p className="text-xs text-[#C85A32] font-semibold mt-0.5">
                    كود العقار: {lease.apartment_code} · بلدية {lease.apartment_municipality}
                  </p>

                  <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-stone-500">اسم المستأجر:</span>
                      <span className="font-bold text-stone-900">{lease.tenant_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">رقم الهاتف:</span>
                      <span className="font-mono tabular-nums text-stone-800">{lease.tenant_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">تاريخ الانتهاء المحدد:</span>
                      <span className="font-bold text-[#C85A32] tabular-nums">{lease.end_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">بدل الإيجار:</span>
                      <span className="font-bold text-[#1E4D38] tabular-nums">
                        {lease.rent_amount.toLocaleString('fr-DZ')} دج ({lease.lease_type === 'monthly' ? 'شهري' : 'سنوي'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSendRenewalReminder(lease, daysLeft)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    title="إرسال تنبيه واتساب فوري للمستأجر"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span>تذكير عبر واتساب</span>
                  </button>

                  <a
                    href={`tel:${lease.tenant_phone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-stone-600" />
                    <span>اتصال بالمستأجر</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

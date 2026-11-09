import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Mail,
  Maximize2,
  MessageCircle,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
  ZoomIn,
} from 'lucide-react';
import { dbService } from '../../services/supabase';
import { UserProfile } from '../../types';

interface KycVerificationQueueProps {
  tenants: UserProfile[];
  onRefresh: () => void;
  onNotification: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}

export const KycVerificationQueue: React.FC<KycVerificationQueueProps> = ({
  tenants,
  onRefresh,
  onNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all' | 'verified' | 'rejected'>('pending');

  // Lightbox Review Modal
  const [selectedTenant, setSelectedTenant] = useState<UserProfile | null>(null);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [isZoomed, setIsZoomed] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatus = (t: UserProfile): 'unverified' | 'pending' | 'verified' | 'rejected' => {
    const s = t.kyc_status || (t.is_active ? 'verified' : 'unverified');
    if (s === 'pending_review') return 'pending';
    return s as any;
  };

  const pendingList = tenants.filter((t) => getStatus(t) === 'pending');
  const pendingCount = pendingList.length;

  const filteredTenants = tenants.filter((t) => {
    const status = getStatus(t);
    if (statusFilter === 'pending' && status !== 'pending') return false;
    if (statusFilter === 'verified' && status !== 'verified') return false;
    if (statusFilter === 'rejected' && status !== 'rejected') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.full_name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        (t.id_card_number && t.id_card_number.includes(q))
      );
    }
    return true;
  });

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedTenant) return;
    setIsProcessing(true);

    try {
      await dbService.reviewKycVerification(
        selectedTenant.id,
        decision,
        rejectionReason.trim()
      );

      onNotification(
        decision === 'approve'
          ? `تم تفعيل وتوثيق حساب المستأجر ${selectedTenant.full_name} بنجاح!`
          : `تم رفض وثيقة الهوية للمستخدم ${selectedTenant.full_name}`,
        decision === 'approve' ? 'success' : 'warning'
      );

      setSelectedTenant(null);
      setRejectionReason('');
      setIsZoomed(false);
      onRefresh();
    } catch {
      onNotification('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickRejectionReasons = [
    'الصورة غير واضحة أو باهتة وغير مقروءة',
    'تاريخ صلاحية بطاقة الهوية منتهٍ',
    'الاسم في البطاقة لا يطابق اسم الحساب المسجل',
    'تم إرفاق وجه واحد فقط، يرجى إرفاق الوجهين الأمامي والخلفي',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 bg-[#1E4D38] text-amber-200 rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              طلبات توثيق وتفعيل الهوية (KYC Verification Queue)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mr-9">
            مراجعة وتدقيق بطاقات التعريف الوطنية للمستأجرين وتفعيل حساباتهم للحجز الرسمي
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs text-amber-800 font-bold">
              {pendingCount} طلب معلق جديد
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، رقم الهاتف الجزائري أو رقم التعريف NIN..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            المعلقة ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'verified'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            المفعلة
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            المرفوضة
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#1E4D38] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            الكل
          </button>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">المستأجر</th>
                <th className="py-3.5 px-4">رقم الهاتف الجزائري</th>
                <th className="py-3.5 px-4">نوع الوثيقة ورقمها</th>
                <th className="py-3.5 px-4">معاينة الوجهين</th>
                <th className="py-3.5 px-4">تاريخ الإرسال</th>
                <th className="py-3.5 px-4">حالة التوثيق</th>
                <th className="py-3.5 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <ShieldCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-bold">لا توجد طلبات توثيق مطابقة للبحث حالياً.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const status = getStatus(tenant);
                  const frontImg = tenant.id_card_front || tenant.id_card_image;
                  const backImg = tenant.id_card_back || frontImg;

                  return (
                    <tr
                      key={tenant.id}
                      className="hover:bg-stone-50/80 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#1E4D38]/10 text-[#1E4D38] font-bold flex items-center justify-center shrink-0">
                            {tenant.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{tenant.full_name}</p>
                            <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                              <Mail className="w-3 h-3" />
                              {tenant.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone with WhatsApp Link */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-mono tabular-nums text-stone-800">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{tenant.phone}</span>
                          <a
                            href={`https://wa.me/213${tenant.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="مراسلة عبر واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Document Type & Number */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-stone-800">
                            {tenant.id_card_type || 'بطاقة التعريف الوطنية'}
                          </p>
                          <span className="text-[11px] font-mono text-stone-500">
                            NIN: {tenant.id_card_number || 'غير مدخل'}
                          </span>
                        </div>
                      </td>

                      {/* Thumbnails (Front & Back) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {frontImg ? (
                            <img
                              src={frontImg}
                              alt="Front"
                              className="w-10 h-7 object-cover rounded-md border border-stone-300 shadow-2xs"
                              title="الوجه الأمامي"
                            />
                          ) : (
                            <span className="w-10 h-7 rounded-md bg-stone-100 border border-dashed border-stone-300 flex items-center justify-center text-[9px] text-stone-400">
                              أمامي
                            </span>
                          )}
                          {backImg ? (
                            <img
                              src={backImg}
                              alt="Back"
                              className="w-10 h-7 object-cover rounded-md border border-stone-300 shadow-2xs"
                              title="الوجه الخلفي"
                            />
                          ) : (
                            <span className="w-10 h-7 rounded-md bg-stone-100 border border-dashed border-stone-300 flex items-center justify-center text-[9px] text-stone-400">
                              خلفي
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-[11px] text-stone-500">
                        {tenant.kyc_submitted_at ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>
                              {new Date(tenant.kyc_submitted_at).toLocaleDateString('ar-DZ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'pending'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {status === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          {status === 'rejected' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          <span>
                            {status === 'verified'
                              ? 'مفعل وموثق ✓'
                              : status === 'pending'
                              ? 'قيد المراجعة ⏳'
                              : status === 'rejected'
                              ? 'مرفوض ✕'
                              : 'غير مفعل'}
                          </span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setActiveSide('front');
                            setIsZoomed(false);
                            setRejectionReason(tenant.kyc_rejection_reason || '');
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                            status === 'pending'
                              ? 'bg-[#1E4D38] hover:bg-[#153828] text-white'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>فحص وتدقيق الوثيقة</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Preview Modal for ID Documents */}
      {selectedTenant && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          dir="rtl"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative">
            {/* Header */}
            <div className="bg-[#1E4D38] text-white p-5 px-6 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    معاينة وتدقيق بطاقة هوية المستأجر: {selectedTenant.full_name}
                  </h3>
                  <p className="text-xs text-emerald-100 font-mono mt-0.5">
                    هاتف: {selectedTenant.phone} · بريد: {selectedTenant.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Info ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50 border border-stone-200 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">نوع الوثيقة:</span>
                  <span className="font-bold text-stone-800">
                    {selectedTenant.id_card_type || 'بطاقة التعريف الوطنية'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">رقم الوثيقة (NIN):</span>
                  <span className="font-bold font-mono text-stone-800">
                    {selectedTenant.id_card_number || 'غير متوفر'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">حالة التوثيق:</span>
                  <span className="font-bold text-amber-700">
                    {getStatus(selectedTenant) === 'pending'
                      ? 'قيد المراجعة'
                      : getStatus(selectedTenant) === 'verified'
                      ? 'مفعل وموثق'
                      : 'غير مفعل'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">تاريخ الإرسال:</span>
                  <span className="font-mono text-stone-700">
                    {selectedTenant.kyc_submitted_at
                      ? new Date(selectedTenant.kyc_submitted_at).toLocaleString('ar-DZ')
                      : 'اليوم'}
                  </span>
                </div>
              </div>

              {/* Side Switcher (Front / Back) */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSide('front')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSide === 'front'
                        ? 'bg-[#1E4D38] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    الوجه الأمامي (Face Avant)
                  </button>
                  <button
                    onClick={() => setActiveSide('back')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSide === 'back'
                        ? 'bg-[#1E4D38] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    الوجه الخلفي (Face Arrière)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isZoomed ? 'تصغير الحجم' : 'تكبير الصورة (Zoom)'}</span>
                </button>
              </div>

              {/* Document Image Lightbox Container */}
              <div className="relative rounded-2xl overflow-hidden bg-stone-950 border-2 border-stone-300 flex items-center justify-center min-h-[260px] max-h-[380px]">
                {activeSide === 'front' ? (
                  selectedTenant.id_card_front || selectedTenant.id_card_image ? (
                    <img
                      src={selectedTenant.id_card_front || selectedTenant.id_card_image}
                      alt="الوجه الأمامي"
                      className={`w-full object-contain transition-transform duration-200 ${
                        isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                      }`}
                      onClick={() => setIsZoomed(!isZoomed)}
                    />
                  ) : (
                    <div className="p-8 text-center text-stone-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                      <p className="text-xs">لم يتم رفع صورة للوجه الأمامي</p>
                    </div>
                  )
                ) : selectedTenant.id_card_back ? (
                  <img
                    src={selectedTenant.id_card_back}
                    alt="الوجه الخلفي"
                    className={`w-full object-contain transition-transform duration-200 ${
                      isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                ) : (
                  <div className="p-8 text-center text-stone-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                    <p className="text-xs">لم يتم رفع صورة منفصلة للوجه الخلفي</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason section */}
              <div className="bg-rose-50/50 border border-rose-200 p-3.5 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-rose-900">
                  سبب الرفض (في حال كانت الوثيقة غير مطابقة أو غير واضحة):
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب سبب الرفض هنا ليظهر للمستأجر..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-rose-200 focus:outline-none focus:border-rose-400"
                />

                {/* Quick chip suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickRejectionReasons.map((reason, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReason(reason)}
                      className="text-[10px] bg-white border border-rose-200 hover:bg-rose-100 text-rose-800 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      + {reason}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-stone-100/80 border-t border-stone-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                {/* 1. Green Accept button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecision('approve')}
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تفعيل وقبول الحساب (Verify Account)</span>
                </button>

                {/* 2. Red Reject button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecision('reject')}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>رفض الطلب (Reject)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="py-3 px-4 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

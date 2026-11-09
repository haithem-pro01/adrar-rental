import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
  UserX,
  X,
} from 'lucide-react';
import { dbService, supabase } from '../../services/supabase';
import { Lease, UserProfile, UserRole } from '../../types';

interface TenantManagementProps {
  tenants: UserProfile[];
  leases: Lease[];
  onRefresh: () => void;
  onNotification: (msg: string, type?: 'success' | 'warning' | 'error') => void;
  onAssignLeaseToTenant: (tenant: UserProfile) => void;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  leases,
  onRefresh,
  onNotification,
  onAssignLeaseToTenant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');

  // ID Card Review Modal
  const [selectedKycTenant, setSelectedKycTenant] = useState<UserProfile | null>(null);
  const [lightboxSide, setLightboxSide] = useState<'front' | 'back'>('front');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('tenant');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingKycCount = tenants.filter((t) => {
    const s = t.kyc_status || (t.is_active ? 'verified' : 'unverified');
    return s === 'pending' || s === 'pending_review';
  }).length;

  const handleToggleActivation = async (tenant: UserProfile) => {
    const newStatus = !tenant.is_active;
    await dbService.updateProfileRoleAndStatus(tenant.id, {
      is_active: newStatus,
      // If activating a client, upgrade them to verified tenant
      role: newStatus && tenant.role === 'client' ? 'tenant' : tenant.role,
    });

    onNotification(
      newStatus
        ? `تم تفعيل حساب المستأجر ${tenant.full_name} بنجاح!`
        : `تم تعطيل حساب ${tenant.full_name}`,
      'success'
    );
    onRefresh();
  };

  const handleKycDecision = async (tenant: UserProfile, decision: 'approve' | 'reject') => {
    setIsReviewing(true);
    try {
      await dbService.reviewKycVerification(tenant.id, decision, rejectionReason);
      onNotification(
        decision === 'approve'
          ? `تم تفعيل وتوثيق حساب ${tenant.full_name} بنجاح!`
          : `تم رفض وثيقة الهوية الخاصة بـ ${tenant.full_name}`,
        decision === 'approve' ? 'success' : 'warning'
      );
      setSelectedKycTenant(null);
      setRejectionReason('');
      onRefresh();
    } catch (err: any) {
      onNotification('حدث خطأ أثناء معالجة الطلب', 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRoleChange = async (tenant: UserProfile, r: 'admin' | 'tenant' | 'client') => {
    await dbService.updateProfileRoleAndStatus(tenant.id, { role: r });
    onNotification(`تم تغيير رتبة ${tenant.full_name} إلى: ${r}`, 'success');
    onRefresh();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      onNotification('يرجى ملء الاسم الكامل والبريد الإلكتروني', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = newEmail.trim().toLowerCase();
      const cleanPhone = newPhone.trim() || '0696980328';
      const validAuthEmail =
        cleanEmail.includes('@') && cleanEmail.includes('.')
          ? cleanEmail
          : `${cleanEmail.replace(/[^a-zA-Z0-9]/g, '') || 'user'}@adrar-immo.dz`;

      // 1. Supabase Auth signup
      let authUserId: string | null = null;
      try {
        const { data: authData } = await supabase.auth.signUp({
          email: validAuthEmail,
          password: 'Password123!',
          options: {
            data: {
              full_name: newName.trim(),
              phone: cleanPhone,
              role: newRole,
              role_code: newRole === 'admin' ? 1 : 0,
              kyc_status: newRole === 'admin' ? 'verified' : 'unverified',
            },
          },
        });
        if (authData?.user) {
          authUserId = authData.user.id;
        }
      } catch (err) {
        console.warn('Supabase auth signup issue:', err);
      }

      // 2. Save profile
      const newProf: UserProfile = {
        id: authUserId || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        full_name: newName.trim(),
        phone: cleanPhone,
        role: newRole,
        role_code: newRole === 'admin' ? 1 : 0,
        is_active: newRole === 'admin',
        kyc_status: newRole === 'admin' ? 'verified' : 'unverified',
        created_at: new Date().toISOString(),
      };

      await dbService.saveProfile(newProf);

      onNotification(`تم إضافة الحساب [${newProf.full_name}] بنجاح وحفظه في النظام!`, 'success');
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      onRefresh();
    } catch (err: any) {
      onNotification(err?.message || 'حدث خطأ أثناء إضافة الحساب', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = tenants.filter((t) => {
    const rawStatus = t.kyc_status || (t.is_active ? 'verified' : 'unverified');
    const status = rawStatus === 'pending_review' ? 'pending' : rawStatus;
    if (roleFilter !== 'all' && t.role !== roleFilter) return false;
    if (kycFilter !== 'all') {
      const target = kycFilter === 'pending_review' ? 'pending' : kycFilter;
      if (status !== target) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.full_name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">إدارة المستأجرين والعملاء</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            متابعة الحسابات المسجلة، تفعيل المستأجرين، وعرض عقود الكراء المرتبطة بهم
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingKycCount > 0 && (
            <button
              onClick={() => {
                setKycFilter('pending');
                setRoleFilter('all');
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold rounded-xl animate-pulse cursor-pointer hover:bg-amber-100 transition-colors"
              title="تصفية الحسابات التي تنتظر مراجعة بطاقة الهوية"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingKycCount} طلب توثيق بانتظار المراجعة</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستأجر / حساب جديد</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">إجمالي الحسابات:</span>
            <span className="text-sm font-bold text-[#1E4D38] tabular-nums bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {tenants.length} حساب
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، البريد أو رقم الهاتف..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl border border-stone-200 bg-white text-stone-700 font-medium"
        >
          <option value="all">كل الرتب</option>
          <option value="tenant">المستأجرين (Tenants · رتبة 0)</option>
          <option value="client">العملاء (Clients · رتبة 0)</option>
          <option value="admin">المشرفين (Admins · رتبة 1)</option>
        </select>

        {/* KYC Status Filter */}
        <select
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl border border-stone-200 bg-white text-stone-700 font-medium"
        >
          <option value="all">كل حالات التوثيق (KYC)</option>
          <option value="pending">قيد المراجعة ⏳</option>
          <option value="unverified">غير مفعل (لم يرفع بطاقة) ⚠️</option>
          <option value="verified">مفعل وموثق ✅</option>
          <option value="rejected">مرفوض 🚫</option>
        </select>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
              <tr>
                <th className="py-3 px-4">المستخدم</th>
                <th className="py-3 px-4">رقم الهاتف الجزائري</th>
                <th className="py-3 px-4">الرتبة</th>
                <th className="py-3 px-4">توثيق الهوية (KYC)</th>
                <th className="py-3 px-4">حالة الحساب</th>
                <th className="py-3 px-4">العقد النشط</th>
                <th className="py-3 px-4 text-center">الإجراءات والتعيين</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    لا يوجد مستخدمين مطابقين للبحث.
                  </td>
                </tr>
              ) : (
                filtered.map((tenant) => {
                  const activeLease = leases.find(
                    (l) => l.tenant_id === tenant.id && (l.status === 'active' || l.status === 'expiring_soon')
                  );
                  const status = tenant.kyc_status || (tenant.is_active ? 'verified' : 'unverified');

                  return (
                    <tr key={tenant.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1E4D38]/10 text-[#1E4D38] font-bold flex items-center justify-center shrink-0">
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

                      {/* Algerian Phone */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-stone-800 font-mono tabular-nums">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{tenant.phone}</span>
                        </div>
                      </td>

                      {/* Role with Role 1 (Admin) and Role 0 (Customers) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              tenant.role === 'admin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {tenant.role === 'admin' ? 'رتبة 1' : 'رتبة 0'}
                          </span>
                          <select
                            value={tenant.role}
                            onChange={(e) => handleRoleChange(tenant, e.target.value as 'admin' | 'tenant' | 'client')}
                            className="py-1 px-2 text-[11px] font-bold rounded-lg border border-stone-200 bg-stone-50 text-stone-800"
                          >
                            <option value="admin">مشرف (Role 1)</option>
                            <option value="tenant">مستأجر (Role 0)</option>
                            <option value="client">عميل (Role 0)</option>
                          </select>
                        </div>
                      </td>

                      {/* KYC Status & ID Document Inspection */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'pending_review'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {status === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {status === 'pending_review' && <Clock className="w-3 h-3 text-amber-600" />}
                            {status === 'rejected' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                            <span>
                              {status === 'verified'
                                ? 'مفعل وموثق'
                                : status === 'pending_review'
                                ? 'قيد المراجعة'
                                : status === 'rejected'
                                ? 'مرفوض'
                                : 'غير مفعل'}
                            </span>
                          </span>

                          {(tenant.id_card_image || status === 'pending_review') && (
                            <button
                              onClick={() => {
                                setSelectedKycTenant(tenant);
                                setRejectionReason(tenant.kyc_rejection_reason || '');
                              }}
                              className="text-[10px] text-[#1E4D38] hover:text-[#C85A32] font-semibold flex items-center gap-1 underline cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>فحص وثيقة الهوية</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Active Status & Activate Button as required */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActivation(tenant)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            tenant.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="انقر لتفعيل أو إلغاء تفعيل حساب المستأجر"
                        >
                          {tenant.is_active ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>مفعّل</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5 text-stone-400" />
                              <span>تفعيل الحساب</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Active Lease badge */}
                      <td className="py-3 px-4">
                        {activeLease ? (
                          <div className="bg-amber-50 border border-amber-200/80 p-2 rounded-xl text-[11px]">
                            <span className="font-bold text-stone-900 block truncate max-w-[140px]">
                              {activeLease.apartment_title}
                            </span>
                            <span className="text-[#C85A32] font-semibold">
                              {activeLease.lease_type === 'monthly' ? 'شهري' : 'سنوي'} · {activeLease.rent_amount.toLocaleString('fr-DZ')} دج
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400">لا يوجد عقد جاري</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onAssignLeaseToTenant(tenant)}
                            className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-[#1E4D38] hover:bg-[#153828] text-white text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                            title="تعيين شقة لهذا المستأجر"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>تعيين شقة</span>
                          </button>

                          <a
                            href={`https://wa.me/213${tenant.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="مراسلة المستأجر عبر واتساب"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Review Lightbox Modal */}
      {selectedKycTenant && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            <button
              onClick={() => setSelectedKycTenant(null)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h3 className="text-lg font-bold text-stone-900">
                  مراجعة وثيقة الهوية (KYC)
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                التحقق من بيانات المستأجر لتفعيل حسابه وإتاحته للحجز والعقود
              </p>
            </div>

            {/* Tenant details */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs mb-4">
              <div>
                <span className="text-stone-400 block text-[10px]">الاسم الكامل:</span>
                <span className="font-bold text-stone-800">{selectedKycTenant.full_name}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">رقم الهاتف الجزائري:</span>
                <span className="font-bold text-stone-800 font-mono">{selectedKycTenant.phone}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">نوع الوثيقة:</span>
                <span className="font-semibold text-stone-700">
                  {selectedKycTenant.id_card_type || 'بطاقة التعريف الوطنية البيومترية'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">رقم الوثيقة (NIN):</span>
                <span className="font-mono font-semibold text-stone-700">
                  {selectedKycTenant.id_card_number || 'غير مدخل'}
                </span>
              </div>
            </div>

            {/* Side Switcher (Front / Back) */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setLightboxSide('front')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  lightboxSide === 'front'
                    ? 'bg-[#1E4D38] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                الوجه الأمامي (Face Avant)
              </button>
              <button
                type="button"
                onClick={() => setLightboxSide('back')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  lightboxSide === 'back'
                    ? 'bg-[#1E4D38] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                الوجه الخلفي (Face Arrière)
              </button>
            </div>

            {/* Document Image Lightbox */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              <div className="border-2 border-stone-200 rounded-2xl overflow-hidden bg-stone-900/5">
                {lightboxSide === 'front' ? (
                  selectedKycTenant.id_card_front || selectedKycTenant.id_card_image ? (
                    <img
                      src={selectedKycTenant.id_card_front || selectedKycTenant.id_card_image}
                      alt="الوجه الأمامي"
                      className="w-full h-64 object-contain bg-black/90"
                    />
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-stone-400">
                      <FileText className="w-10 h-10 mb-2 text-stone-300" />
                      <p className="text-xs">المستخدم لم يقم برفع صورة الوجه الأمامي</p>
                    </div>
                  )
                ) : selectedKycTenant.id_card_back ? (
                  <img
                    src={selectedKycTenant.id_card_back}
                    alt="الوجه الخلفي"
                    className="w-full h-64 object-contain bg-black/90"
                  />
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-stone-400">
                    <FileText className="w-10 h-10 mb-2 text-stone-300" />
                    <p className="text-xs">لم يتم رفع صورة منفصلة للوجه الخلفي</p>
                  </div>
                )}
              </div>

              {/* Rejection reason box */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  سبب الرفض (في حال عدم وضوح أو صحة الوثيقة):
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: الصورة غير واضحة، يرجى إعادة رفع صورة واضحة للوجهين..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                disabled={isReviewing}
                onClick={() => handleKycDecision(selectedKycTenant, 'approve')}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تفعيل الحساب وقبول الهوية (مفعل)</span>
              </button>

              <button
                type="button"
                disabled={isReviewing}
                onClick={() => handleKycDecision(selectedKycTenant, 'reject')}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>رفض الوثيقة (مرفوض)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedKycTenant(null)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 text-[#C85A32] mx-auto flex items-center justify-center mb-2">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">إضافة مستأجر / حساب جديد</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                إنشاء وتوثيق الحساب في قاعدة بيانات Supabase
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: يوسف بن عيسى"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">البريد الإلكتروني / اسم المستخدم</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="youssef@gmail.com أو youssef01"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">رقم الهاتف الجزائري</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0661234567"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32] font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">الرتبة في المنصة</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="tenant">مستأجر (Tenant)</option>
                  <option value="client">عميل عادي (Client)</option>
                  <option value="admin">مشرف (Admin)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تأكيد الإضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

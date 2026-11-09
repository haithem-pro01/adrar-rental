import React, { useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
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

  // Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('tenant');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        is_active: true,
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
    if (roleFilter !== 'all' && t.role !== roleFilter) return false;
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
          <option value="tenant">المستأجرين (Tenants)</option>
          <option value="client">العملاء (Clients)</option>
          <option value="admin">المشرفين (Admins)</option>
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
                <th className="py-3 px-4">الرتبة في المنصة</th>
                <th className="py-3 px-4">حالة الحساب</th>
                <th className="py-3 px-4">العقد النشط</th>
                <th className="py-3 px-4 text-center">الإجراءات والتعيين</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    لا يوجد مستخدمين مطابقين للبحث.
                  </td>
                </tr>
              ) : (
                filtered.map((tenant) => {
                  const activeLease = leases.find(
                    (l) => l.tenant_id === tenant.id && (l.status === 'active' || l.status === 'expiring_soon')
                  );

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

                      {/* Role */}
                      <td className="py-3 px-4">
                        <select
                          value={tenant.role}
                          onChange={(e) => handleRoleChange(tenant, e.target.value as 'admin' | 'tenant' | 'client')}
                          className="py-1 px-2 text-[11px] font-bold rounded-lg border border-stone-200 bg-stone-50 text-stone-800"
                        >
                          <option value="admin">مشرف (Admin)</option>
                          <option value="tenant">مستأجر (Tenant)</option>
                          <option value="client">عميل (Client)</option>
                        </select>
                      </td>

                      {/* Active Status & Activate Button as required */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActivation(tenant)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
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
                            className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-[#1E4D38] hover:bg-[#153828] text-white text-[11px] font-bold transition-colors shadow-2xs"
                            title="تعيين شقة لهذا المستأجر"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>تعيين شقة</span>
                          </button>

                          <a
                            href={`https://wa.me/213${tenant.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
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

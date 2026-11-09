import React, { useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { dbService } from '../../services/supabase';
import { Lease, UserProfile } from '../../types';

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

  const handleRoleChange = async (tenant: UserProfile, newRole: 'admin' | 'tenant' | 'client') => {
    await dbService.updateProfileRoleAndStatus(tenant.id, { role: newRole });
    onNotification(`تم تغيير رتبة ${tenant.full_name} إلى: ${newRole}`, 'success');
    onRefresh();
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">إجمالي الحسابات:</span>
          <span className="text-sm font-bold text-[#1E4D38] tabular-nums bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {tenants.length} حساب
          </span>
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
          className="py-2 px-3 text-xs rounded-xl border border-stone-200 bg-white text-stone-700"
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
    </div>
  );
};

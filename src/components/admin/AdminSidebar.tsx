import React from 'react';
import {
  AlertTriangle,
  Building2,
  FileCheck2,
  Home,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AdminTab = 'overview' | 'properties' | 'tenants' | 'leases' | 'expirations';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  expiringCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  expiringCount,
}) => {
  const { navigateTo, logout, currentUser } = useAuth();

  return (
    <aside className="w-full lg:w-64 bg-white border-l border-stone-200 p-4 lg:min-h-screen flex flex-col justify-between shrink-0">
      <div>
        {/* Admin Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-stone-200">
          <div className="w-10 h-10 rounded-xl bg-[#1E4D38] text-amber-200 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-stone-900 text-sm leading-tight">
              لوحة الإدارة العقارية
            </h1>
            <span className="text-[11px] text-stone-500 font-medium">ولاية أدرار</span>
          </div>
        </div>

        {/* Current Admin User Badge */}
        <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
          <span className="text-stone-400 block text-[10px]">المسؤول الحالي:</span>
          <p className="font-bold text-stone-900 truncate">{currentUser?.full_name}</p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">صلاحية مشرف كاملة (Admin)</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-6 space-y-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-[#1E4D38] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>الإحصائيات ونظرة عامة</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'properties'
                ? 'bg-[#1E4D38] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4" />
              <span>إدارة الشقق (CRUD)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'tenants'
                ? 'bg-[#1E4D38] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>المستأجرين والعملاء</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('leases')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'leases'
                ? 'bg-[#1E4D38] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-4 h-4" />
              <span>عقود الكراء والتعيين</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('expirations')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'expirations'
                ? 'bg-[#C85A32] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>العقود المنتهية قريباً</span>
            </div>
            {expiringCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#C85A32] text-[10px] font-black flex items-center justify-center">
                {expiringCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-4 border-t border-stone-200 space-y-2">
        <button
          onClick={() => navigateTo('/app')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1E4D38] hover:bg-emerald-50 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>العودة لبوابة العملاء (/app)</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

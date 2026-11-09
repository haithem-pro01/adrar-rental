import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/supabase';
import { Apartment, Lease, UserProfile } from '../../types';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminStats } from './AdminStats';
import { ExpiringLeasesAlert } from './ExpiringLeasesAlert';
import { KycVerificationQueue } from './KycVerificationQueue';
import { LeaseManagement } from './LeaseManagement';
import { PropertyManagement } from './PropertyManagement';
import { TenantManagement } from './TenantManagement';

export const AdminDashboard: React.FC = () => {
  const { currentUser, navigateTo, showNotification } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Strict role security guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 text-center shadow-lg">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">منطقة محمية - الدخول للمشرفين فقط</h2>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            هذه المنطقة مخصصة لإدارة منصة عقارات أدرار ومتابعة العقود وطلبات التوثيق. يرجى تسجيل الدخول بحساب مسؤول (Admin) للمتابعة.
          </p>
          <button
            onClick={() => navigateTo('/app')}
            className="w-full py-3 bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            العودة إلى الصفحة الرئيسية وتصفح الشقق
          </button>
        </div>
      </div>
    );
  }

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<UserProfile[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pre-selected tenant when clicking "تعيين شقة" from Tenant Management
  const [preSelectedTenant, setPreSelectedTenant] = useState<UserProfile | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [aptsData, tenantsData, leasesData] = await Promise.all([
        dbService.getApartments(),
        dbService.getAllProfiles(),
        dbService.getLeases(),
      ]);
      setApartments(aptsData);
      setTenants(tenantsData);
      setLeases(leasesData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignLeaseToTenant = (tenant: UserProfile) => {
    setPreSelectedTenant(tenant);
    setActiveTab('leases');
  };

  // Calculate upcoming expiring leases count (less than 45 days)
  const now = new Date();
  const expiringCount = leases.filter((l) => {
    if (l.status === 'ended') return false;
    const end = new Date(l.end_date);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 45;
  }).length;

  // Calculate pending KYC verification requests
  const pendingKycCount = tenants.filter((t) => {
    const s = t.kyc_status || (t.is_active ? 'verified' : 'unverified');
    return s === 'pending' || s === 'pending_review';
  }).length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expiringCount={expiringCount}
        pendingKycCount={pendingKycCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-28 bg-stone-200/60 rounded-2xl animate-pulse" />
            <div className="h-64 bg-stone-200/60 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* Always show top stats in Overview or top bar */}
            {activeTab === 'overview' && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                    نظرة عامة على العقارات ومداخيل الكراء بولاية أدرار
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    لوحة المتابعة المركزية للشقق والفلل وعقود المستأجرين في أدرار وتيميمون ورقان
                  </p>
                </div>

                <AdminStats
                  apartments={apartments}
                  tenants={tenants}
                  leases={leases}
                />

                {/* Quick Shortcuts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* KYC Queue Shortcut */}
                  <div
                    onClick={() => setActiveTab('kyc_queue')}
                    className={`p-5 bg-white rounded-2xl border shadow-2xs hover:border-amber-500 cursor-pointer transition-all group ${
                      pendingKycCount > 0
                        ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                        : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-700 block">
                        توثيق الهوية (KYC)
                      </span>
                      {pendingKycCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                          {pendingKycCount} طلب جديد
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                      طلبات توثيق وتفعيل الهوية
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      فحص صور البطاقات (الوجهين) وقبول الحسابات أو رفضها
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('properties')}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-[#1E4D38] cursor-pointer transition-all group"
                  >
                    <span className="text-xs font-bold text-[#1E4D38] block mb-1">
                      إدارة العقارات والشقق
                    </span>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-[#1E4D38] transition-colors">
                      إضافة شقة جديدة أو تغيير الحالة
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      تعديل الأسعار والمواصفات ورفع الصور المضغوطة
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('tenants')}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-[#C85A32] cursor-pointer transition-all group"
                  >
                    <span className="text-xs font-bold text-[#C85A32] block mb-1">
                      سجل المستأجرين والعملاء
                    </span>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-[#C85A32] transition-colors">
                      سجل العملاء والمستأجرين
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      متابعة الحسابات المسجلة وتعيين الشقق
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('expirations')}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-600 cursor-pointer transition-all group"
                  >
                    <span className="text-xs font-bold text-amber-700 block mb-1">
                      التنبيهات الاستباقية
                    </span>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                      العقود المنتهية قريباً ({expiringCount})
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      إرسال تذكيرات تجديد فورية للمستأجرين عبر واتساب
                    </p>
                  </div>
                </div>

                {/* Latest Properties Table Preview */}
                <PropertyManagement
                  apartments={apartments.slice(0, 5)}
                  onRefresh={loadData}
                  onNotification={showNotification}
                />
              </>
            )}

            {activeTab === 'kyc_queue' && (
              <KycVerificationQueue
                tenants={tenants}
                onRefresh={loadData}
                onNotification={showNotification}
              />
            )}

            {activeTab === 'properties' && (
              <PropertyManagement
                apartments={apartments}
                onRefresh={loadData}
                onNotification={showNotification}
              />
            )}

            {activeTab === 'tenants' && (
              <TenantManagement
                tenants={tenants}
                leases={leases}
                onRefresh={loadData}
                onNotification={showNotification}
                onAssignLeaseToTenant={handleAssignLeaseToTenant}
              />
            )}

            {activeTab === 'leases' && (
              <LeaseManagement
                leases={leases}
                apartments={apartments}
                tenants={tenants}
                preSelectedTenant={preSelectedTenant}
                onRefresh={loadData}
                onNotification={showNotification}
              />
            )}

            {activeTab === 'expirations' && (
              <ExpiringLeasesAlert
                leases={leases}
                onRefresh={loadData}
                onNotification={showNotification}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

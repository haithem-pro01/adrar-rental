import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  dbService,
  isAdminPhoneNumber,
  isValidAlgerianPhone,
  normalizeAlgerianPhone,
  supabase,
} from '../services/supabase';
import { Language, Lease, Listing, ThemeMode, UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  currentPath: string; // '/app' | '/admin' | '/my-rentals'
  navigateTo: (path: string) => void;
  // Language & Theme
  language: Language;
  toggleLanguage: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  // Notification Toast
  notification: { message: string; type: 'success' | 'warning' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'warning' | 'error') => void;
  clearNotification: () => void;
  // Phone Auth
  loginWithPhone: (data: {
    fullName: string;
    phone: string;
    pin: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Auth Modal
  authModalOpen: boolean;
  openAuthModal: (promptMessage?: string, targetListing?: Listing) => void;
  closeAuthModal: () => void;
  authModalPrompt: string;
  pendingListing: Listing | null;
  // Active tenant lease
  activeTenantLease: Lease | null;
  refreshTenantLease: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'zayd_user_auth_session';
const STORAGE_KEY_LANG = 'zayd_user_language';
const STORAGE_KEY_THEME = 'zayd_user_theme';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>('/app');
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState('');
  const [pendingListing, setPendingListing] = useState<Listing | null>(null);
  const [activeTenantLease, setActiveTenantLease] = useState<Lease | null>(null);

  // Initialize Language, Theme and Session from LocalStorage & Supabase
  useEffect(() => {
    // 1. Language
    const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language;
    if (savedLang === 'fr' || savedLang === 'ar') {
      setLanguage(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }

    // 2. Theme (Default Dark Luxury Obsidian Navy #060D18)
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // 3. User Session
    const initSession = async () => {
      setIsLoading(true);
      try {
        const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
        if (savedAuth) {
          const user: UserProfile = JSON.parse(savedAuth);
          if (user && user.phone) {
            // Re-verify admin status dynamically
            const isAdmin = isAdminPhoneNumber(user.phone);
            user.role = isAdmin ? 'admin' : user.role || 'tenant';
            user.role_code = isAdmin ? 1 : 0;
            setCurrentUser(user);

            // Fetch active lease for this phone
            const lease = await dbService.getTenantActiveLease(user.phone);
            setActiveTenantLease(lease);

            if (user.role === 'admin' && window.location.pathname.includes('admin')) {
              setCurrentPath('/admin');
            }
          }
        }
      } catch (err) {
        console.warn('Session init note:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Listen for storage events (e.g. admin updates lease in another tab or action)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zayd_live_leases' && currentUser?.phone) {
        dbService.getTenantActiveLease(currentUser.phone).then(setActiveTenantLease);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodic subtle polling to ensure tenant always has live status
  useEffect(() => {
    if (!currentUser?.phone) return;
    const interval = setInterval(async () => {
      const lease = await dbService.getTenantActiveLease(currentUser.phone);
      setActiveTenantLease(lease);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const toggleLanguage = () => {
    const nextLang: Language = language === 'ar' ? 'fr' : 'ar';
    setLanguage(nextLang);
    localStorage.setItem(STORAGE_KEY_LANG, nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const showNotification = (
    message: string,
    type: 'success' | 'warning' | 'error' = 'success'
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  const navigateTo = (path: string) => {
    if (path === '/admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        showNotification(
          language === 'ar'
            ? 'الوصول إلى لوحة الإدارة محصور بالمشرفين المعتمدين.'
            : 'Accès réservé exclusivement aux administrateurs autorisés.',
          'warning'
        );
        setCurrentPath('/app');
        return;
      }
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthModal = (promptMessage = '', targetListing?: Listing) => {
    setAuthModalPrompt(promptMessage);
    if (targetListing) setPendingListing(targetListing);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalPrompt('');
    setPendingListing(null);
  };

  // Phone-Only Authentication
  const loginWithPhone = async (data: {
    fullName: string;
    phone: string;
    pin: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.fullName.trim()) {
      return {
        success: false,
        error: language === 'ar' ? 'يرجى إدخال الاسم واللقب' : 'Veuillez saisir votre nom et prénom',
      };
    }

    const cleanPhone = data.phone.trim().replace(/[\s-]/g, '');
    if (!isValidAlgerianPhone(cleanPhone)) {
      return {
        success: false,
        error:
          language === 'ar'
            ? 'رقم الهاتف الجزائري غير صحيح. يجب أن يبدأ بـ 05 أو 06 أو 07 متبوعاً بـ 8 أرقام.'
            : 'Numéro algérien invalide. Il doit commencer par 05, 06 ou 07 suivi de 8 chiffres.',
      };
    }

    if (!data.pin || data.pin.length < 4) {
      return {
        success: false,
        error:
          language === 'ar'
            ? 'الرمز السري (PIN) يجب أن يتكون من 4 أرقام على الأقل'
            : 'Le code PIN doit comporter au moins 4 chiffres.',
      };
    }

    setIsLoading(true);
    try {
      const isAdmin = isAdminPhoneNumber(cleanPhone);
      const userProfile: UserProfile = {
        id: `usr-${cleanPhone}`,
        full_name: data.fullName.trim(),
        phone: cleanPhone,
        role: isAdmin ? 'admin' : 'tenant',
        role_code: isAdmin ? 1 : 0,
        pin: data.pin,
        created_at: new Date().toISOString(),
      };

      // Save to Supabase and Cache
      await dbService.saveProfile(userProfile);

      setCurrentUser(userProfile);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userProfile));

      // Fetch active lease
      const lease = await dbService.getTenantActiveLease(cleanPhone);
      setActiveTenantLease(lease);

      closeAuthModal();

      if (isAdmin) {
        showNotification(
          language === 'ar'
            ? `مرحباً بك ${userProfile.full_name} في لوحة تحكم وكالة زيد!`
            : `Bienvenue ${userProfile.full_name} au panneau d'administration ZAYD !`,
          'success'
        );
        navigateTo('/admin');
      } else {
        showNotification(
          language === 'ar'
            ? `أهلاً بك ${userProfile.full_name} في وكالة زيد العقارية`
            : `Bienvenue ${userProfile.full_name} chez ZAYD Agence Immobilière`,
          'success'
        );
        navigateTo('/app');
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err?.message || 'حدث خطأ أثناء تسجيل الدخول',
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTenantLease(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setCurrentPath('/app');
    showNotification(
      language === 'ar'
        ? 'تم تسجيل الخروج بنجاح. نتمنى لكم يوماً سعيداً في أدرار!'
        : 'Déconnexion réussie. À très bientôt à Adrar !',
      'success'
    );
  };

  const refreshTenantLease = async () => {
    if (!currentUser?.phone) return;
    const lease = await dbService.getTenantActiveLease(currentUser.phone);
    setActiveTenantLease(lease);
  };

  const refreshCurrentUser = async () => {
    if (!currentUser?.phone) return;
    const profiles = await dbService.getProfiles();
    const updated = profiles.find(
      (p) => normalizeAlgerianPhone(p.phone) === normalizeAlgerianPhone(currentUser.phone)
    );
    if (updated) {
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
    }
    await refreshTenantLease();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        currentPath,
        navigateTo,
        language,
        toggleLanguage,
        theme,
        toggleTheme,
        notification,
        showNotification,
        clearNotification,
        loginWithPhone,
        logout,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalPrompt,
        pendingListing,
        activeTenantLease,
        refreshTenantLease,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

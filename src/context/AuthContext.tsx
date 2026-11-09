import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbService, isValidAlgerianPhone, supabase } from '../services/supabase';
import { Apartment, UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  currentPath: string; // '/app' | '/admin' | '/my-rentals'
  navigateTo: (path: string) => void;
  notification: { message: string; type: 'success' | 'warning' | 'error' } | null;
  clearNotification: () => void;
  showNotification: (message: string, type?: 'success' | 'warning' | 'error') => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Auth Modal trigger for guests trying to book
  authModalOpen: boolean;
  openAuthModal: (promptMessage?: string, targetApartment?: Apartment) => void;
  closeAuthModal: () => void;
  authModalPrompt: string;
  pendingApartment: Apartment | null;
  clearPendingApartment: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>('/app');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);

  // Guest booking interceptor modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState('');
  const [pendingApartment, setPendingApartment] = useState<Apartment | null>(null);

  const openAuthModal = (
    promptMessage = 'يرجى تسجيل الدخول أو إنشاء حساب للمتابعة وحجز الشقة',
    targetApartment?: Apartment
  ) => {
    setAuthModalPrompt(promptMessage);
    if (targetApartment) {
      setPendingApartment(targetApartment);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalPrompt('');
  };

  const clearPendingApartment = () => setPendingApartment(null);

  const showNotification = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  // Check current Supabase session on initial load
  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && session?.user) {
          const profile = await dbService.getProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
            if (profile.role === 'admin' && window.location.pathname.includes('admin')) {
              setCurrentPath('/admin');
            } else {
              setCurrentPath('/app');
            }
          } else {
            // Create user profile in profiles table if missing
            const metadata = session.user.user_metadata || {};
            const newProf: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: metadata.full_name || 'مستخدم المنصة',
              phone: metadata.phone || '',
              role: (metadata.role as UserRole) || 'client',
              is_active: true,
              created_at: new Date().toISOString(),
            };
            await supabase.from('profiles').upsert(newProf);
            setCurrentUser(newProf);
            setCurrentPath('/app');
          }
        } else {
          // GUEST by default!
          setCurrentUser(null);
          setCurrentPath('/app');
        }
      } catch (err) {
        console.warn('Session init:', err);
        setCurrentUser(null);
        setCurrentPath('/app');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await dbService.getProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentPath('/app');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const navigateTo = (path: string) => {
    // STRICT SECURITY GUARD for /admin:
    if (path === '/admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        showNotification('عذراً، الوصول إلى لوحة تحكم الإدارة مخصص للمشرفين والمسؤولين فقط.', 'warning');
        setCurrentPath('/app');
        return;
      }
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ADMIN_EMAILS = ['admin@adrar-immo.dz', 'admin@adrar.dz', 'haithembenzerga@gmail.com'];

  const isAdminEmail = (email: string) => {
    const clean = email.trim().toLowerCase();
    return ADMIN_EMAILS.includes(clean) || clean.startsWith('admin@');
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const shouldBeAdmin = isAdminEmail(cleanEmail);

      let authUser: any = null;

      // Try signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (!error && data?.user) {
        authUser = data.user;
      } else if (shouldBeAdmin) {
        // If it's an admin email that hasn't been signed up yet in this Supabase project,
        // automatically register it so the admin can log in seamlessly
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              full_name: 'مشرف المنصة (الإدارة)',
              phone: '0696980328',
              role: 'admin',
            },
          },
        });

        if (!signUpError && signUpData?.user) {
          authUser = signUpData.user;
        } else {
          // If already exists with different password
          setIsLoading(false);
          return {
            success: false,
            error: error?.message || 'كلمة المرور غير صحيحة لحساب المشرف.',
          };
        }
      } else {
        setIsLoading(false);
        return {
          success: false,
          error: error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        };
      }

      // Fetch or sync profile from `profiles` table
      let userProfile: UserProfile | null = null;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          userProfile = profile as UserProfile;
        }
      } catch (e) {
        console.warn('Profile read:', e);
      }

      if (!userProfile) {
        userProfile = {
          id: authUser.id,
          email: cleanEmail,
          full_name: authUser.user_metadata?.full_name || (shouldBeAdmin ? 'مشرف المنصة' : 'مستخدم المنصة'),
          phone: authUser.user_metadata?.phone || '0696980328',
          role: shouldBeAdmin ? 'admin' : ((authUser.user_metadata?.role as UserRole) || 'client'),
          is_active: true,
          created_at: new Date().toISOString(),
        };
        await supabase.from('profiles').upsert(userProfile);
      } else if (shouldBeAdmin && userProfile.role !== 'admin') {
        // Elevate to admin
        userProfile.role = 'admin';
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', userProfile.id);
      }

      setCurrentUser(userProfile);
      closeAuthModal();
      showNotification(`أهلاً بك يا ${userProfile.full_name} في منصة عقارات أدرار`, 'success');

      // STRICT REDIRECT LOGIC:
      if (userProfile.role === 'admin') {
        navigateTo('/admin');
      } else {
        navigateTo('/app');
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'فشل تسجيل الدخول. يرجى المحاولة لاحقاً.' };
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.fullName.trim()) {
      return { success: false, error: 'يرجى إدخال الاسم الكامل.' };
    }
    if (!data.email.trim() || !data.email.includes('@')) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صالح.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' };
    }
    if (!isValidAlgerianPhone(data.phone)) {
      return {
        success: false,
        error: 'رقم الهاتف الجزائري غير صحيح. يجب أن يبدأ بـ 05 أو 06 أو 07 أو +213 ويتكون من 10 أرقام (مثال: 0661234567).',
      };
    }

    setIsLoading(true);
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanPhone = data.phone.trim();
      const assignedRole: UserRole = isAdminEmail(cleanEmail) ? 'admin' : 'client';

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            phone: cleanPhone,
            role: assignedRole,
          },
        },
      });

      if (authError || !authData.user) {
        setIsLoading(false);
        return { success: false, error: authError?.message || 'فشل إنشاء الحساب.' };
      }

      const newProfile: UserProfile = {
        id: authData.user.id,
        email: cleanEmail,
        full_name: data.fullName.trim(),
        phone: cleanPhone,
        role: assignedRole,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      // Save into public.profiles
      await supabase.from('profiles').upsert(newProfile);

      setCurrentUser(newProfile);
      closeAuthModal();
      showNotification(`تم إنشاء الحساب بنجاح! مرحباً بك يا ${newProfile.full_name}`, 'success');

      if (assignedRole === 'admin') {
        navigateTo('/admin');
      } else {
        navigateTo('/app');
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'حدث خطأ أثناء إنشاء الحساب.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    setCurrentUser(null);
    setCurrentPath('/app');
    showNotification('تم تسجيل الخروج بنجاح. نراك قريباً في أدرار!', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        currentPath,
        navigateTo,
        notification,
        clearNotification,
        showNotification,
        login,
        register,
        logout,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalPrompt,
        pendingApartment,
        clearPendingApartment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

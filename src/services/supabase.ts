import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Apartment, ApartmentStatus, Lease, Municipality, RentalType, Review, UserProfile, UserRole } from '../types';

export const OFFICIAL_WHATSAPP_NUMBER = '213696980328'; // +213 696980328

export const AlgerianPhoneRegex = /^(0|\+213)[567][0-9]{8}$/;

export function isValidAlgerianPhone(phone: string): boolean {
  return AlgerianPhoneRegex.test(phone.trim().replace(/\s+/g, ''));
}

// Safely read Supabase environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://afqwgpcbvissovuirihh.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ibFkMQumiCub8zrJJetT8Q_MAHOhtgf';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Seed data for initial Adrar listings if remote DB is empty
const INITIAL_ADRAR_LISTINGS: Apartment[] = [
  {
    id: 'apt-adr-1',
    code: 'ADR-1042',
    title: 'شقة فاخرة بإطلالة واحات النخيل - وسط مدينة أدرار',
    description: 'شقة مفروشة عصرية واسعة F4 مع صالون صحراوي فسيح، نوافذ عازلة للحرارة، مطبخ إيطالي مجهز بالكامل، خزان ماء سعة 2500 لتر، ونظام تكييف متطور.',
    municipality: 'أدرار',
    address: 'حي 140 مسكن، قرب ساحة الشهداء، أدرار وسط',
    rental_type: 'both',
    monthly_price: 55000,
    yearly_price: 600000,
    rooms: 4,
    bathrooms: 2,
    area: 145,
    floor: 'الطابق الثاني',
    amenities: [
      'مكيفات صحراوية وهوائية',
      'خزان ماء 2500 لتر مع مضخة',
      'أنترنت ألياف بصرية فائقة السرعة',
      'مطبخ مجهز بالكامل',
      'موقف سيارات محروس',
      'شرفة واسعة مطلة',
    ],
    images: [
      '/images/apartment_adrar_modern_1_1794234918725.jpg',
      '/images/hero_adrar_luxury_1794234917435.jpg',
      '/images/apartment_reggane_suite_1794234919330.jpg',
    ],
    status: 'available',
    created_at: new Date().toISOString(),
  },
  {
    id: 'apt-adr-2',
    code: 'ADR-2088',
    title: 'إقامة الواحة الحمراء - قصر تيميمون التراثي الفاخر',
    description: 'تحفة معمارية بطراز القصور الصحراوية بقورارة تيميمون، شرفة ملكية مطلة مباشرة على غابات النخيل والكثبان الذهبية، أثاث راقٍ وجلسات أندلسية أصيلة.',
    municipality: 'تيميمون',
    address: 'طريق القصور، قبالة واحة النخيل، تيميمون',
    rental_type: 'both',
    monthly_price: 75000,
    yearly_price: 820000,
    rooms: 5,
    bathrooms: 2,
    area: 190,
    floor: 'فيلا أرضية بطابق علوي',
    amenities: [
      'تراس بانورامي على الواحة',
      'مكيفات حديثة في كل الغرف',
      'بئر ارتوازي وخزان ماء خاص',
      'حديقة داخلية بنخيل مثمر',
      'صالون تقليدي مفروش بالزرابي الصحراوية',
    ],
    images: [
      '/images/apartment_timimoun_palmeraie_1794234919292.jpg',
      '/images/hero_adrar_luxury_1794234917435.jpg',
    ],
    status: 'available',
    created_at: new Date().toISOString(),
  },
  {
    id: 'apt-adr-3',
    code: 'ADR-3105',
    title: 'شقة راقية مؤثثة F3 - وسط بلدية رقان',
    description: 'شقة حديثة البناء في موقع استراتيجي هادئ برقان، قريبة من كافة الإدارات، مجهزة بأحدث أدوات الراحة وعوازل حرارية ممتازة مناسبة لمهندسي وإطارات الشركات.',
    municipality: 'رقان',
    address: 'حي النصر الجديد، بجانب المجمع الإداري، رقان',
    rental_type: 'monthly',
    monthly_price: 42000,
    yearly_price: 480000,
    rooms: 3,
    bathrooms: 1,
    area: 110,
    floor: 'الطابق الأول',
    amenities: [
      'مكيفات سبليت قوية التبريد',
      'خزان ماء 2000 لتر',
      'أثاث جديد لم يستعمل',
      'تلفاز ذكي 55 بوصة مع اشتراك إنترنت',
    ],
    images: [
      '/images/apartment_reggane_suite_1794234919330.jpg',
      '/images/apartment_adrar_modern_1_1794234918725.jpg',
    ],
    status: 'available',
    created_at: new Date().toISOString(),
  },
  {
    id: 'apt-adr-4',
    code: 'ADR-4190',
    title: 'دوبلكس سياحي راقٍ ببلدية فنوغيل الهادئة',
    description: 'دوبلكس حديث بطابع معماري جنوبي أصيل، فناء مشمس، مساحات مفتوحة، مثالي للعائلات الكبيرة والباحثين عن الهدوء والسكينة على بعد 15 دقيقة من أدرار.',
    municipality: 'فنوغيل',
    address: 'المدخل الشمالي لبلدية فنوغيل، قرب قصر بوعلي',
    rental_type: 'yearly',
    monthly_price: 48000,
    yearly_price: 520000,
    rooms: 4,
    bathrooms: 2,
    area: 160,
    floor: 'دوبلكس (أرضي + أول)',
    amenities: [
      'عزل حراري مزدوج',
      'خزان ماء 3000 لتر أرضي وعلوي',
      'مطبخ ريفي صحراوي واسع',
      'فناء داخلي مشجر',
    ],
    images: [
      '/images/hero_adrar_luxury_1794234917435.jpg',
      '/images/apartment_timimoun_palmeraie_1794234919292.jpg',
    ],
    status: 'available',
    created_at: new Date().toISOString(),
  },
  {
    id: 'apt-adr-5',
    code: 'ADR-5221',
    title: 'شقة استوديو فاخرة للموظفين والإطارات - تسابيت',
    description: 'استوديو مودرن F2 مفروش بأناقة عالية، مثالي للإطارات وأساتذة الجامعة والموظفين المنتدبين، تجهيز كهربائي كامل ونظام تهوية صحراوي اقتصادي.',
    municipality: 'تسابيت',
    address: 'الشارع الرئيسي، حي المستقبل، بلدية تسابيت',
    rental_type: 'monthly',
    monthly_price: 32000,
    yearly_price: 350000,
    rooms: 2,
    bathrooms: 1,
    area: 75,
    floor: 'الطابق الأرضي',
    amenities: [
      'مكيف تبريد وتدفئة',
      'خزان ماء مستقل',
      'ثلاجة وغسالة وميكروويف',
      'إنترنت لا سلكي 4G مجاني',
    ],
    images: [
      '/images/apartment_adrar_modern_1_1794234918725.jpg',
      '/images/apartment_reggane_suite_1794234919330.jpg',
    ],
    status: 'available',
    created_at: new Date().toISOString(),
  },
  {
    id: 'apt-adr-6',
    code: 'ADR-6310',
    title: 'فيلا عائلية شاسعة مع حديقة نخيل - زاوية كنتة',
    description: 'فيلا فخمة متكاملة بطراز معماري أصيل بزاوية كنتة التاريخية، صالونات ضيوف متعددة، غرف نوم رحبة، خزان ماء ضخم وبئر ماء عذب، مثالية للسكن السنوي طويل الأمد.',
    municipality: 'زاوية كنتة',
    address: 'حي القصبة العتيقة، زاوية كنتة',
    rental_type: 'yearly',
    monthly_price: 65000,
    yearly_price: 720000,
    rooms: 6,
    bathrooms: 3,
    area: 250,
    floor: 'طابقين مستقلين',
    amenities: [
      'حديقة ونخيل مثمر',
      'بئر ماء عذب + خزان 5000 لتر',
      'مكيفات مركزية',
      'مرآب يتسع لثلاث سيارات',
    ],
    images: [
      '/images/hero_adrar_luxury_1794234917435.jpg',
      '/images/apartment_timimoun_palmeraie_1794234919292.jpg',
    ],
    status: 'available',
    created_at: new Date().toISOString(),
  },
];

// Seed verified initial tenants and users for Adrar platform
const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'rental@adrar01',
    full_name: 'مدير المنصة (rental@adrar01)',
    phone: '0696980328',
    role: 'admin',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-admin-2',
    email: 'haithembenzerga@gmail.com',
    full_name: 'هيثم بن زرقة (المشرف العام)',
    phone: '0696980328',
    role: 'admin',
    is_active: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-past-1',
    email: 'souleymane.touati@yahoo.fr',
    full_name: 'سليمان التواتي (مهندس منتدب)',
    phone: '0661234567',
    role: 'tenant',
    is_active: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-past-2',
    email: 'noureddine.belkheir@gmail.com',
    full_name: 'نور الدين بلخضر',
    phone: '0550123456',
    role: 'tenant',
    is_active: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-client-1',
    email: 'karim.laroussi@gmail.com',
    full_name: 'كريم لعروسي (عميل مهتم بالكراء)',
    phone: '0770987654',
    role: 'client',
    is_active: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Local store fallback keys
const STORAGE_KEY_LISTINGS = 'adrar_live_listings';
const STORAGE_KEY_LEASES = 'adrar_live_leases';
const STORAGE_KEY_PROFILES = 'adrar_live_profiles';

export const dbService = {
  // --- PROFILES ---
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data as UserProfile;
      }
    } catch (err) {
      console.warn('Supabase getProfile error:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (stored) {
        const list: UserProfile[] = JSON.parse(stored);
        const found = list.find((p) => p.id === userId);
        if (found) return found;
      }
    }

    return null;
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    let list: UserProfile[] = [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        list = data as UserProfile[];
      }
    } catch (err) {
      console.warn('Supabase getAllProfiles error:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      let localList: UserProfile[] = stored ? JSON.parse(stored) : INITIAL_PROFILES;
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(INITIAL_PROFILES));
      }

      // Merge remote list with local cache so accounts NEVER disappear
      const map = new Map<string, UserProfile>();
      list.forEach((p) => map.set(p.email.toLowerCase(), p));
      localList.forEach((p) => {
        if (!map.has(p.email.toLowerCase())) {
          map.set(p.email.toLowerCase(), p);
        }
      });
      list = Array.from(map.values());
    }

    if (list.length === 0) {
      list = INITIAL_PROFILES;
    }

    return list;
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await supabase.from('profiles').upsert(profile);
    } catch (err) {
      console.warn('Supabase saveProfile error:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      let profiles: UserProfile[] = stored ? JSON.parse(stored) : [...INITIAL_PROFILES];
      const idx = profiles.findIndex(
        (p) => p.email.toLowerCase() === profile.email.toLowerCase() || p.id === profile.id
      );
      if (idx !== -1) {
        profiles[idx] = { ...profiles[idx], ...profile };
      } else {
        profiles.unshift(profile);
      }
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    }
  },

  async updateProfileRoleAndStatus(
    userId: string,
    updates: Partial<Pick<UserProfile, 'role' | 'is_active' | 'phone' | 'full_name'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) console.warn('Supabase updateProfile error:', error);
    } catch (err) {
      console.warn('Supabase updateProfile error:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (stored) {
        const profiles: UserProfile[] = JSON.parse(stored);
        const idx = profiles.findIndex((p) => p.id === userId);
        if (idx !== -1) {
          profiles[idx] = { ...profiles[idx], ...updates };
          localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
        }
      }
    }

    return true;
  },

  // --- APARTMENTS / LISTINGS ---
  async getApartments(filters?: {
    municipality?: string;
    rentalType?: RentalType | 'all';
    status?: ApartmentStatus | 'all';
    search?: string;
  }): Promise<Apartment[]> {
    let list: Apartment[] = [];

    // Attempt to load from Supabase listings_public or apartments
    try {
      let query = supabase.from('listings_public').select('*');
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        list = data as Apartment[];
      } else {
        // Fallback to 'apartments' table if listings_public was not created
        const { data: aptData, error: aptErr } = await supabase
          .from('apartments')
          .select('*')
          .order('created_at', { ascending: false });
        if (!aptErr && aptData && aptData.length > 0) {
          list = aptData as Apartment[];
        }
      }
    } catch (err) {
      console.warn('Supabase listings fetch error:', err);
    }

    if (list.length === 0) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_LISTINGS);
        if (stored) {
          list = JSON.parse(stored);
        } else {
          list = INITIAL_ADRAR_LISTINGS;
          localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(INITIAL_ADRAR_LISTINGS));
        }
      } else {
        list = INITIAL_ADRAR_LISTINGS;
      }
    }

    // Apply filters
    if (filters) {
      if (filters.municipality && filters.municipality !== 'الكل') {
        list = list.filter((a) => a.municipality === filters.municipality);
      }
      if (filters.rentalType && filters.rentalType !== 'all') {
        list = list.filter((a) => a.rental_type === filters.rentalType || a.rental_type === 'both');
      }
      if (filters.status && filters.status !== 'all') {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.code.toLowerCase().includes(q) ||
            a.address.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q)
        );
      }
    }

    return list;
  },

  async addApartment(apartment: Omit<Apartment, 'id' | 'created_at'>): Promise<Apartment> {
    const newApt: Apartment = {
      ...apartment,
      id: `apt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('listings').insert([newApt]);
      await supabase.from('apartments').insert([newApt]);
    } catch (err) {
      console.warn('Supabase addApartment error:', err);
    }

    // Update local cache
    const current: Apartment[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_LISTINGS) || JSON.stringify(INITIAL_ADRAR_LISTINGS)
    );
    current.unshift(newApt);
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(current));
    return newApt;
  },

  async updateApartment(id: string, updates: Partial<Apartment>): Promise<boolean> {
    try {
      await supabase.from('listings').update(updates).eq('id', id);
      await supabase.from('apartments').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateApartment error:', err);
    }

    const current: Apartment[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_LISTINGS) || JSON.stringify(INITIAL_ADRAR_LISTINGS)
    );
    const idx = current.findIndex((a) => a.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(current));
      return true;
    }
    return false;
  },

  async deleteApartment(id: string): Promise<boolean> {
    try {
      await supabase.from('listings').delete().eq('id', id);
      await supabase.from('apartments').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteApartment error:', err);
    }

    const current: Apartment[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_LISTINGS) || JSON.stringify(INITIAL_ADRAR_LISTINGS)
    );
    const filtered = current.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(filtered));
    return true;
  },

  async setApartmentStatus(id: string, status: ApartmentStatus): Promise<boolean> {
    return this.updateApartment(id, { status });
  },

  // --- LEASES ---
  async getLeases(): Promise<Lease[]> {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Lease[];
      }
    } catch (err) {
      console.warn('Supabase getLeases error:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_LEASES);
      if (stored) return JSON.parse(stored);
    }
    return [];
  },

  async getTenantActiveLease(tenantId: string): Promise<Lease | null> {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('status', ['active', 'expiring_soon'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return data as Lease;
      }
    } catch (err) {
      console.warn('Supabase getTenantActiveLease error:', err);
    }

    const leases = await this.getLeases();
    return leases.find((l) => l.tenant_id === tenantId && (l.status === 'active' || l.status === 'expiring_soon')) || null;
  },

  async createLease(leaseData: {
    apartment_id: string;
    tenant_id: string;
    tenant_name: string;
    tenant_phone: string;
    apartment_title: string;
    apartment_code: string;
    apartment_municipality: Municipality;
    apartment_image?: string;
    lease_type: 'monthly' | 'yearly';
    rent_amount: number;
    start_date: string;
    end_date: string;
    notes?: string;
  }): Promise<Lease> {
    const newLease: Lease = {
      id: `lease-${Date.now()}`,
      apartment_id: leaseData.apartment_id,
      tenant_id: leaseData.tenant_id,
      tenant_name: leaseData.tenant_name,
      tenant_phone: leaseData.tenant_phone,
      apartment_title: leaseData.apartment_title,
      apartment_code: leaseData.apartment_code,
      apartment_municipality: leaseData.apartment_municipality,
      apartment_image: leaseData.apartment_image,
      lease_type: leaseData.lease_type,
      rent_amount: leaseData.rent_amount,
      start_date: leaseData.start_date,
      end_date: leaseData.end_date,
      status: 'active',
      notes: leaseData.notes || '',
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('leases').insert([newLease]);
      await supabase.from('apartments').update({ status: 'rented' }).eq('id', leaseData.apartment_id);
      await supabase.from('listings').update({ status: 'rented' }).eq('id', leaseData.apartment_id);
    } catch (err) {
      console.warn('Supabase lease insert error:', err);
    }

    // Update local cache
    const leases = await this.getLeases();
    leases.unshift(newLease);
    localStorage.setItem(STORAGE_KEY_LEASES, JSON.stringify(leases));

    // Update apartment status to rented
    await this.setApartmentStatus(leaseData.apartment_id, 'rented');

    return newLease;
  },

  async endLease(leaseId: string): Promise<boolean> {
    const leases = await this.getLeases();
    const target = leases.find((l) => l.id === leaseId);
    if (!target) return false;

    try {
      await supabase.from('leases').update({ status: 'ended' }).eq('id', leaseId);
      await supabase.from('apartments').update({ status: 'available' }).eq('id', target.apartment_id);
      await supabase.from('listings').update({ status: 'available' }).eq('id', target.apartment_id);
    } catch (err) {
      console.warn('Supabase endLease error:', err);
    }

    target.status = 'ended';
    localStorage.setItem(STORAGE_KEY_LEASES, JSON.stringify(leases));
    await this.setApartmentStatus(target.apartment_id, 'available');
    return true;
  },

  // --- REVIEWS & RATINGS (STRICT: ONLY FOR TENANTS WITH ENDED LEASES) ---
  async getApartmentReviews(apartmentId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('apartment_id', apartmentId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Review[];
      }
    } catch (err) {
      console.warn('Supabase getApartmentReviews error:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adrar_live_reviews');
      if (stored) {
        const allReviews: Review[] = JSON.parse(stored);
        return allReviews.filter((r) => r.apartment_id === apartmentId);
      } else {
        // Seed initial verified reviews for completed leases
        const seedReviews: Review[] = [
          {
            id: 'rev-1',
            apartment_id: 'apt-adr-1',
            tenant_id: 'user-past-1',
            tenant_name: 'سليمان التواتي (مهندس منتدب)',
            rating: 5,
            comment: 'شقة ممتازة جداً ونظام التكييف الصحراوي مع خزان الماء سعة 2500L أنقذنا طوال فصل الصيف بأدرار. الجيران محترمون للغاية وموقع حي 140 مسكن هادئ وقريب من كل المرافق.',
            lease_id: 'lease-past-1',
            created_at: '2026-01-20T10:00:00Z',
          },
          {
            id: 'rev-2',
            apartment_id: 'apt-adr-1',
            tenant_id: 'user-past-2',
            tenant_name: 'نور الدين بلخضر',
            rating: 5,
            comment: 'أتممت كراء سنة كاملة في هذه الشقة. النظافة والعزل الحراري والتجهيزات ممتازة والإدارة متعاونة وسريعة في الرد.',
            lease_id: 'lease-past-2',
            created_at: '2026-02-14T14:30:00Z',
          },
          {
            id: 'rev-3',
            apartment_id: 'apt-adr-2',
            tenant_id: 'user-past-3',
            tenant_name: 'محمد بوعبد الله',
            rating: 5,
            comment: 'تحفة معمارية حقيقية في تيميمون! الإطلالة على الواحة ساحرة والشرفة العلوية لا تضاهى. تجربة كراء فريدة أنصح بها بشدة.',
            lease_id: 'lease-past-3',
            created_at: '2026-03-01T11:20:00Z',
          },
        ];
        localStorage.setItem('adrar_live_reviews', JSON.stringify(seedReviews));
        return seedReviews.filter((r) => r.apartment_id === apartmentId);
      }
    }
    return [];
  },

  async canUserReviewApartment(
    userId: string,
    apartmentId: string
  ): Promise<{ canReview: boolean; reason?: string; leaseId?: string }> {
    if (!userId) {
      return {
        canReview: false,
        reason: 'يجب تسجيل الدخول بحساب المستأجر أولاً لإضافة التقييم.',
      };
    }

    // 1. Check if user already reviewed this apartment
    const existingReviews = await this.getApartmentReviews(apartmentId);
    const alreadyReviewed = existingReviews.some((r) => r.tenant_id === userId);
    if (alreadyReviewed) {
      return {
        canReview: false,
        reason: 'لقد قمت بإضافة تقييم موثق لهذه الشقة مسبقاً. شكراً لمشاركتك تجربتك!',
      };
    }

    // 2. Strict Rule: Check if user has an ENDED lease for this apartment
    const leases = await this.getLeases();
    const userLeasesForApartment = leases.filter(
      (l) => l.tenant_id === userId && l.apartment_id === apartmentId
    );

    if (userLeasesForApartment.length === 0) {
      return {
        canReview: false,
        reason: 'خاصية التقييم محصورة فقط بالمستأجرين الذين استأجروا هذه الشقة وانتهى عقد إيجارهم لضمان أقصى درجات المصداقية.',
      };
    }

    const endedLease = userLeasesForApartment.find((l) => l.status === 'ended');
    if (!endedLease) {
      return {
        canReview: false,
        reason: 'عقد كراء هذه الشقة لا يزال سارياً حالياً. ستتمكن من تقييم الشقة فور انتهاء فترة العقد وتسليمها للإدارة.',
      };
    }

    return {
      canReview: true,
      leaseId: endedLease.id,
    };
  },

  async submitReview(data: {
    apartment_id: string;
    tenant_id: string;
    tenant_name: string;
    rating: number;
    comment: string;
    lease_id?: string;
  }): Promise<{ success: boolean; review?: Review; error?: string }> {
    // Re-verify eligibility
    const eligibility = await this.canUserReviewApartment(data.tenant_id, data.apartment_id);
    if (!eligibility.canReview) {
      return { success: false, error: eligibility.reason };
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      apartment_id: data.apartment_id,
      tenant_id: data.tenant_id,
      tenant_name: data.tenant_name,
      rating: Math.min(5, Math.max(1, data.rating)),
      comment: data.comment.trim(),
      lease_id: data.lease_id || eligibility.leaseId,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('reviews').insert([newReview]);
    } catch (err) {
      console.warn('Supabase insert review error:', err);
    }

    // Update local cache
    let currentReviews: Review[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adrar_live_reviews');
      if (stored) {
        currentReviews = JSON.parse(stored);
      }
      currentReviews.unshift(newReview);
      localStorage.setItem('adrar_live_reviews', JSON.stringify(currentReviews));
    }

    return { success: true, review: newReview };
  },
};

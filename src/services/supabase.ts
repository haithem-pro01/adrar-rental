import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AdrarNeighborhood,
  Lease,
  Listing,
  RentPeriod,
  UserProfile,
} from '../types';

export const OFFICIAL_WHATSAPP_PHONE =
  import.meta.env.VITE_WHATSAPP_PHONE || '213550472523';

export const ADMIN_PHONE_NUMBERS = [
  '0550472523',
  '+213550472523',
  '213550472523',
  '0696980328',
  '+213696980328',
  '213696980328',
  '0552069874',
  '+213552069874',
  '213552069874',
];

export const ADRAR_NEIGHBORHOODS: AdrarNeighborhood[] = [
  'حي السلام',
  'حي قصر تيليلين',
  'وسط المدينة',
  'حي 140 مسكن',
  'حي المطار',
  'حي البدر',
  'حي 20 أوت',
];

export const AlgerianPhoneRegex = /^(0|\+213|213)[567][0-9]{8}$/;

export function isValidAlgerianPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.trim().replace(/[\s-]/g, '');
  return AlgerianPhoneRegex.test(clean);
}

export function normalizeAlgerianPhone(phone: string): string {
  const clean = phone.trim().replace(/[\s-]/g, '');
  if (clean.startsWith('+213')) return '0' + clean.substring(4);
  if (clean.startsWith('213')) return '0' + clean.substring(3);
  return clean;
}

export function isAdminPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.trim().replace(/[\s-]/g, '');
  const normalized = normalizeAlgerianPhone(clean);
  return ADMIN_PHONE_NUMBERS.some((adm) => {
    const admNorm = normalizeAlgerianPhone(adm);
    return admNorm === normalized || clean.endsWith('550472523') || clean.endsWith('696980328') || clean.endsWith('552069874');
  });
}

// Supabase client initialization
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

// Seed Initial Listings for Adrar Centre matching the Luxury MacBook UI Mockup
export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'zayd-apt-1',
    ref_code: 'ADR-1042',
    title_ar: 'شقة ملكية عصرية F4 مع إطلالة بانورامية - حي السلام',
    title_fr: 'Appartement Royal Moderne F4 Vue Panoramique - Cité Es-Salam',
    description_ar: 'شقة فاخرة مفروشة بأحدث الأثاث الإيطالي، صالون ملكي فسيح، نظام تكييف مركزي متكيف مع مناخ أدرار، مطبخ مجهز بالكامل، وخزان ماء 3000 لتر مع مضخة ضغط.',
    description_fr: 'Appartement de luxe entièrement meublé, grand salon marocain et moderne, climatisation intégrale, cuisine équipée et bâche à eau de 3000L.',
    neighborhood: 'حي السلام',
    property_type: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    living_rooms: 1,
    area_m2: 120,
    price_night: 15000,
    price_month: 45000,
    price_year: 520000,
    contact_whatsapp: '213550472523',
    status: 'available',
    image_url: '/images/apartment_adrar_modern_1_1794234918725.jpg',
    images: [
      '/images/apartment_adrar_modern_1_1794234918725.jpg',
      '/images/hero_adrar_luxury_1794234917435.jpg',
      '/images/apartment_reggane_suite_1794234919330.jpg',
    ],
    amenities: ['تكييف هوائي وصحراوي', 'خزان ماء 3000 لتر', 'أنترنت ألياف بصرية', 'موقف محروس'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'zayd-apt-2',
    ref_code: 'ADR-2088',
    title_ar: 'فيلا قصر التيليلين الفاخرة - حدائق داخلية ومسبح خاص',
    title_fr: 'Villa Palais Tililine de Prestige - Jardins et Piscine Privée',
    description_ar: 'تحفة معمارية بطراز القصور الصحراوية الراقية بقصر تيليلين بأدرار، جلسات شاي أندلسية، صالونات استقبال متعددة، مسبح خاص مظلل، وعوازل حرارية مزدوجة.',
    description_fr: 'Splendide villa d’architecte à Tililine, salons de réception prestigieux, piscine privative ombragée, suite parentale et climatisation renforcée.',
    neighborhood: 'حي قصر تيليلين',
    property_type: 'villa',
    bedrooms: 5,
    bathrooms: 3,
    living_rooms: 2,
    area_m2: 260,
    price_night: 28000,
    price_month: 85000,
    price_year: 980000,
    contact_whatsapp: '213550472523',
    status: 'available',
    image_url: '/images/hero_adrar_luxury_1794234917435.jpg',
    images: [
      '/images/hero_adrar_luxury_1794234917435.jpg',
      '/images/apartment_timimoun_palmeraie_1794234919292.jpg',
    ],
    amenities: ['مسبح خاص', 'صالونات متعددة', 'بئر ماء عذب', 'مرآب سيارات يتسع لـ 3 سيارات'],
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'zayd-apt-3',
    ref_code: 'ADR-3105',
    title_ar: 'شقة إدارية راقية F3 للإطارات والشركات - وسط المدينة',
    title_fr: 'Suite Résidentielle F3 Cadres & Entreprises - Centre-Ville',
    description_ar: 'شقة عصرية هادئة جداً قرب مقر ولاية أدرار والإدارات الرئيسية، أثاث مكتبي وسكني متكامل، شاشات ذكية 4K، مطبخ أمريكي مفتوح، وإنترنت سريع.',
    description_fr: 'Appartement meublé idéal pour cadres et missions professionnelles, proche des administrations de la Wilaya d’Adrar, fibre optique et calme absolu.',
    neighborhood: 'وسط المدينة',
    property_type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    living_rooms: 1,
    area_m2: 95,
    price_night: 12000,
    price_month: 38000,
    price_year: 440000,
    contact_whatsapp: '213550472523',
    status: 'available',
    image_url: '/images/apartment_reggane_suite_1794234919330.jpg',
    images: [
      '/images/apartment_reggane_suite_1794234919330.jpg',
      '/images/apartment_adrar_modern_1_1794234918725.jpg',
    ],
    amenities: ['موقع استراتيجي', 'أثاث جديد 100%', 'تلفاز 55 بوصة', 'غسالة ومجفف ملابس'],
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'zayd-apt-4',
    ref_code: 'ADR-4190',
    title_ar: 'شقة عائلية مؤثثة F4 مع فناء مشمس - حي 140 مسكن',
    title_fr: 'Appartement Familial Meublé F4 - Cité 140 Logements',
    description_ar: 'شقة أرضية فسيحة بحي 140 مسكن الراقي، مدخل مستقل، فناء واسع، خزانات مياه سعة 4000 لتر، ومكيفات سبليت في كل الغرف والصالون.',
    description_fr: 'Appartement spacieux au rez-de-chaussée avec cour privative, réservoirs de 4000L, climatisation split dans toutes les pièces.',
    neighborhood: 'حي 140 مسكن',
    property_type: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    living_rooms: 1,
    area_m2: 135,
    price_night: 16000,
    price_month: 48000,
    price_year: 540000,
    contact_whatsapp: '213550472523',
    status: 'available',
    image_url: '/images/apartment_timimoun_palmeraie_1794234919292.jpg',
    images: [
      '/images/apartment_timimoun_palmeraie_1794234919292.jpg',
      '/images/apartment_adrar_modern_1_1794234918725.jpg',
    ],
    amenities: ['فناء مستقل', 'خزان 4000 لتر', 'قريب من المدارس والخدمات', 'أمان عالي'],
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'zayd-apt-5',
    ref_code: 'ADR-5221',
    title_ar: 'دوبلكس راقٍ مع تيراس مفتوح - حي المطار الجديد',
    title_fr: 'Duplex Haut Standing avec Terrasse - Cité Aéroport',
    description_ar: 'دوبلكس فاخر بتصميم عصري مفتوح، إطلالة رائعة على سماء أدرار الصافية، غرف نوم رحبة، وحي راقٍ وهادئ مناسب للعائلات والإطارات السامية.',
    description_fr: 'Duplex moderne avec terrasse panoramique, quartier résidentiel paisible proche de l’aéroport Touat Cheikh Sidi Mohamed Belkebir.',
    neighborhood: 'حي المطار',
    property_type: 'duplex',
    bedrooms: 4,
    bathrooms: 2,
    living_rooms: 2,
    area_m2: 175,
    price_night: 20000,
    price_month: 60000,
    price_year: 680000,
    contact_whatsapp: '213550472523',
    status: 'available',
    image_url: '/images/hero_adrar_luxury_1794234917435.jpg',
    images: [
      '/images/hero_adrar_luxury_1794234917435.jpg',
      '/images/apartment_reggane_suite_1794234919330.jpg',
    ],
    amenities: ['تيراس واسع', 'صالونين مستقلين', 'نظام عزل صوتي وحراري', 'مطبخ إيطالي'],
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
  {
    id: 'zayd-apt-6',
    ref_code: 'ADR-6310',
    title_ar: 'إقامة النخيل الفاخرة F3 - حي البدر الهادئ',
    title_fr: 'Résidence Les Palmiers F3 - Cité El-Badr',
    description_ar: 'شقة فاخرة مجهزة حديثاً في موقع هادئ بحي البدر، ديكور شرقي صحراوي راقٍ، صالون فسيح مع جلسات مريحة وتجهيز متكامل للإقامة القصيرة والطويلة.',
    description_fr: 'Appartement décoré avec raffinement saharien et moderne, ambiance chaleureuse, parfait pour séjours professionnels ou vacances en famille.',
    neighborhood: 'حي البدر',
    property_type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    living_rooms: 1,
    area_m2: 100,
    price_night: 13000,
    price_month: 42000,
    price_year: 480000,
    contact_whatsapp: '213550472523',
    status: 'available',
    image_url: '/images/apartment_adrar_modern_1_1794234918725.jpg',
    images: ['/images/apartment_adrar_modern_1_1794234918725.jpg'],
    amenities: ['أثاث فاخر', 'هدوء تام', 'تكييف في كل الغرف', 'إنترنت 4G مجاني'],
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
  },
];

// Seed Initial Leases for Expiry Alerts demonstrations
export const INITIAL_LEASES: Lease[] = [
  {
    id: 'lease-exp-1',
    listing_id: 'zayd-apt-1',
    tenant_name: 'أحمد بن مبارك (إطار شركة سونلغاز)',
    tenant_phone: '0661234567',
    period_type: 'night',
    agreed_price: 15000,
    start_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 18 * 3600 * 1000).toISOString().split('T')[0], // Expires in < 24 hours!
    status: 'expiring_soon',
    listing_title: 'شقة ملكية عصرية F4 مع إطلالة بانورامية - حي السلام',
    listing_ref: 'ADR-1042',
    neighborhood: 'حي السلام',
    notes: 'إقامة يومية لوفد مهندسين، تنتهي غداً صباحاً.',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lease-exp-2',
    listing_id: 'zayd-apt-3',
    tenant_name: 'سليمان التواتي (مهندس معماري)',
    tenant_phone: '0696980328',
    period_type: 'month',
    agreed_price: 38000,
    start_date: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0], // Expires in 4 days (< 7 days!)
    status: 'expiring_soon',
    listing_title: 'شقة إدارية راقية F3 للإطارات والشركات - وسط المدينة',
    listing_ref: 'ADR-3105',
    neighborhood: 'وسط المدينة',
    notes: 'عقد شهري، المستأجر يرغب في التجديد.',
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lease-exp-3',
    listing_id: 'zayd-apt-4',
    tenant_name: 'نور الدين بلخضر',
    tenant_phone: '0550123456',
    period_type: 'year',
    agreed_price: 540000,
    start_date: new Date(Date.now() - 345 * 24 * 3600 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString().split('T')[0], // Expires in 20 days (< 30 days!)
    status: 'expiring_soon',
    listing_title: 'شقة عائلية مؤثثة F4 مع فناء مشمس - حي 140 مسكن',
    listing_ref: 'ADR-4190',
    neighborhood: 'حي 140 مسكن',
    notes: 'عقد سنوي عائلي يقترب من موعد التجديد.',
    created_at: new Date(Date.now() - 345 * 24 * 3600 * 1000).toISOString(),
  },
];

// Local Storage Keys
const STORAGE_KEY_LISTINGS = 'zayd_live_listings';
const STORAGE_KEY_LEASES = 'zayd_live_leases';
const STORAGE_KEY_PROFILES = 'zayd_live_profiles';

// Database Service with Supabase + Local Cache Sync
export const dbService = {
  // =================== LISTINGS ===================
  async getListings(): Promise<Listing[]> {
    let list: Listing[] = [];
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        list = data.map((item) => ({
          id: item.id,
          ref_code: item.ref_code,
          title_ar: item.title_ar,
          title_fr: item.title_fr || item.title_ar,
          neighborhood: item.neighborhood,
          property_type: item.property_type || 'apartment',
          bedrooms: item.bedrooms || 3,
          bathrooms: item.bathrooms || 2,
          living_rooms: item.living_rooms || 1,
          area_m2: item.area_m2 || 120,
          price_night: Number(item.price_night || 0),
          price_month: Number(item.price_month || 0),
          price_year: Number(item.price_year || 0),
          contact_whatsapp: item.contact_whatsapp || OFFICIAL_WHATSAPP_PHONE,
          status: item.status || 'available',
          image_url: item.image_url || '/images/apartment_adrar_modern_1_1794234918725.jpg',
          images: item.images || [item.image_url],
          amenities: item.amenities || [],
          created_at: item.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn('Supabase getListings note:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_LISTINGS);
      let localList: Listing[] = stored ? JSON.parse(stored) : INITIAL_LISTINGS;
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(INITIAL_LISTINGS));
      }

      const map = new Map<string, Listing>();
      list.forEach((l) => map.set(l.id, l));
      localList.forEach((l) => {
        if (!map.has(l.id)) {
          map.set(l.id, l);
        }
      });
      list = Array.from(map.values());
    }

    if (list.length === 0) {
      list = INITIAL_LISTINGS;
    }

    return list;
  },

  async saveListing(listing: Listing): Promise<Listing> {
    try {
      await supabase.from('listings').upsert({
        id: listing.id,
        ref_code: listing.ref_code,
        title_ar: listing.title_ar,
        title_fr: listing.title_fr,
        neighborhood: listing.neighborhood,
        property_type: listing.property_type,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        living_rooms: listing.living_rooms,
        area_m2: listing.area_m2,
        price_night: listing.price_night,
        price_month: listing.price_month,
        price_year: listing.price_year,
        contact_whatsapp: listing.contact_whatsapp,
        status: listing.status,
        image_url: listing.image_url,
      });
    } catch (err) {
      console.warn('Supabase saveListing note:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_LISTINGS);
      let list: Listing[] = stored ? JSON.parse(stored) : [...INITIAL_LISTINGS];
      const idx = list.findIndex((l) => l.id === listing.id);
      if (idx >= 0) {
        list[idx] = listing;
      } else {
        list.unshift(listing);
      }
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(list));
    }

    return listing;
  },

  async deleteListing(listingId: string): Promise<void> {
    try {
      await supabase.from('listings').delete().eq('id', listingId);
    } catch (err) {
      console.warn('Supabase deleteListing note:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_LISTINGS);
      if (stored) {
        let list: Listing[] = JSON.parse(stored);
        list = list.filter((l) => l.id !== listingId);
        localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(list));
      }
    }
  },

  // =================== LEASES & EXPIRIES ===================
  async getLeases(): Promise<Lease[]> {
    let list: Lease[] = [];
    try {
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        list = data as Lease[];
      }
    } catch (err) {
      console.warn('Supabase getLeases note:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_LEASES);
      let localList: Lease[] = stored ? JSON.parse(stored) : INITIAL_LEASES;
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_LEASES, JSON.stringify(INITIAL_LEASES));
      }

      const map = new Map<string, Lease>();
      list.forEach((l) => map.set(l.id, l));
      localList.forEach((l) => {
        if (!map.has(l.id)) {
          map.set(l.id, l);
        }
      });
      list = Array.from(map.values());
    }

    if (list.length === 0) {
      list = INITIAL_LEASES;
    }

    return list;
  },

  async createLease(leaseData: Omit<Lease, 'id' | 'created_at'>): Promise<Lease> {
    const newLease: Lease = {
      ...leaseData,
      id: `lease-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('leases').insert([
        {
          id: newLease.id,
          listing_id: newLease.listing_id,
          tenant_name: newLease.tenant_name,
          tenant_phone: newLease.tenant_phone,
          period_type: newLease.period_type,
          agreed_price: newLease.agreed_price,
          start_date: newLease.start_date,
          end_date: newLease.end_date,
          status: newLease.status,
        },
      ]);

      // Automatically update property status to 'rented'
      await supabase
        .from('listings')
        .update({ status: 'rented' })
        .eq('id', newLease.listing_id);
    } catch (err) {
      console.warn('Supabase createLease note:', err);
    }

    if (typeof window !== 'undefined') {
      const storedLeases = localStorage.getItem(STORAGE_KEY_LEASES);
      let leases: Lease[] = storedLeases ? JSON.parse(storedLeases) : [...INITIAL_LEASES];
      leases.unshift(newLease);
      localStorage.setItem(STORAGE_KEY_LEASES, JSON.stringify(leases));

      // Also mark property rented locally
      const storedListings = localStorage.getItem(STORAGE_KEY_LISTINGS);
      if (storedListings) {
        let listings: Listing[] = JSON.parse(storedListings);
        const idx = listings.findIndex((l) => l.id === newLease.listing_id);
        if (idx >= 0) {
          listings[idx].status = 'rented';
          localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
        }
      }
    }

    return newLease;
  },

  async updateLease(leaseId: string, updates: Partial<Lease>): Promise<void> {
    try {
      await supabase.from('leases').update(updates).eq('id', leaseId);
    } catch (err) {
      console.warn('Supabase updateLease note:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_LEASES);
      if (stored) {
        let list: Lease[] = JSON.parse(stored);
        const idx = list.findIndex((l) => l.id === leaseId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...updates };
          localStorage.setItem(STORAGE_KEY_LEASES, JSON.stringify(list));
        }
      }
    }
  },

  async deleteLease(leaseId: string): Promise<void> {
    try {
      await supabase.from('leases').delete().eq('id', leaseId);
    } catch (err) {
      console.warn('Supabase deleteLease note:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_LEASES);
      if (stored) {
        let list: Lease[] = JSON.parse(stored);
        list = list.filter((l) => l.id !== leaseId);
        localStorage.setItem(STORAGE_KEY_LEASES, JSON.stringify(list));
      }
    }
  },

  async getTenantActiveLease(phone: string): Promise<Lease | null> {
    if (!phone) return null;
    const leases = await this.getLeases();
    const clean = normalizeAlgerianPhone(phone);
    const found = leases.find((l) => {
      const lClean = normalizeAlgerianPhone(l.tenant_phone);
      return (lClean === clean || l.tenant_phone.includes(clean)) && l.status !== 'ended';
    });
    return found || null;
  },

  // =================== PROFILES & AUTH ===================
  async getProfiles(): Promise<UserProfile[]> {
    let list: UserProfile[] = [];
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        list = data as UserProfile[];
      }
    } catch (err) {
      console.warn('Supabase getProfiles note:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      let localList: UserProfile[] = stored ? JSON.parse(stored) : [];
      const map = new Map<string, UserProfile>();
      list.forEach((p) => map.set(normalizeAlgerianPhone(p.phone), p));
      localList.forEach((p) => {
        const norm = normalizeAlgerianPhone(p.phone);
        if (!map.has(norm)) map.set(norm, p);
      });
      list = Array.from(map.values());
    }

    return list;
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await supabase.from('profiles').upsert(profile);
    } catch (err) {
      console.warn('Supabase saveProfile note:', err);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      let profiles: UserProfile[] = stored ? JSON.parse(stored) : [];
      const norm = normalizeAlgerianPhone(profile.phone);
      const idx = profiles.findIndex((p) => normalizeAlgerianPhone(p.phone) === norm);
      if (idx >= 0) {
        profiles[idx] = profile;
      } else {
        profiles.unshift(profile);
      }
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    }
  },

  // =================== WHATSAPP GENERATOR ===================
  formatWhatsAppUrl(
    listing: Listing,
    period: RentPeriod = 'month',
    user?: UserProfile | null
  ): string {
    const periodLabelAr =
      period === 'night' ? 'يومي' : period === 'year' ? 'سنوي' : 'شهري';
    const price =
      period === 'night'
        ? `${listing.price_night.toLocaleString('fr-DZ')} د.ج / يوم`
        : period === 'year'
        ? `${listing.price_year.toLocaleString('fr-DZ')} د.ج / سنة`
        : `${listing.price_month.toLocaleString('fr-DZ')} د.ج / شهر`;

    const senderInfo = user ? `، أنا ${user.full_name}` : '';

    const message = `السلام عليكم وكالة زيد العقارية${senderInfo}، أنا مهتم بكراء: [${listing.title_ar}] (كود: [${listing.ref_code}]) في [${listing.neighborhood}] بأدرار، نوع الكراء: [${periodLabelAr}] بسعر [${price}]. هل الشقة متوفرة للمعاينة؟`;

    const targetPhone = listing.contact_whatsapp || OFFICIAL_WHATSAPP_PHONE;
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  },

  // =================== SMART EXPIRY CHECK ===================
  getLeaseExpiryAlert(lease: Lease): {
    isExpiring: boolean;
    level: 'critical_red' | 'warning_orange' | 'caution_yellow' | 'none';
    daysLeft: number;
    hoursLeft: number;
    labelAr: string;
    labelFr: string;
  } {
    if (lease.status === 'ended') {
      return {
        isExpiring: false,
        level: 'none',
        daysLeft: 0,
        hoursLeft: 0,
        labelAr: 'منتهي',
        labelFr: 'Expiré',
      };
    }

    const end = new Date(lease.end_date);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60));
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // 1. Daily lease: Alert if < 24 hours
    if (lease.period_type === 'night') {
      if (hoursLeft <= 24) {
        return {
          isExpiring: true,
          level: 'critical_red',
          daysLeft,
          hoursLeft,
          labelAr: hoursLeft > 0 ? `متبقي أقل من ${hoursLeft} ساعة (عقد يومي)!` : 'انتهى العقد اليوم!',
          labelFr: hoursLeft > 0 ? `Reste moins de ${hoursLeft}h (Bail journalier) !` : 'Expiré aujourd’hui !',
        };
      }
    }

    // 2. Monthly lease: Alert if < 7 days
    if (lease.period_type === 'month') {
      if (daysLeft <= 7) {
        return {
          isExpiring: true,
          level: 'warning_orange',
          daysLeft,
          hoursLeft,
          labelAr: daysLeft > 0 ? `متبقي ${daysLeft} أيام (عقد شهري)!` : 'انتهى العقد اليوم!',
          labelFr: daysLeft > 0 ? `Reste ${daysLeft} jours (Bail mensuel) !` : 'Expiré aujourd’hui !',
        };
      }
    }

    // 3. Yearly lease: Alert if < 30 days
    if (lease.period_type === 'year') {
      if (daysLeft <= 30) {
        return {
          isExpiring: true,
          level: 'caution_yellow',
          daysLeft,
          hoursLeft,
          labelAr: daysLeft > 0 ? `متبقي ${daysLeft} يوماً (عقد سنوي)` : 'انتهى العقد اليوم!',
          labelFr: daysLeft > 0 ? `Reste ${daysLeft} jours (Bail annuel)` : 'Expiré aujourd’hui !',
        };
      }
    }

    return {
      isExpiring: false,
      level: 'none',
      daysLeft,
      hoursLeft,
      labelAr: `سارٍ حتى ${lease.end_date}`,
      labelFr: `Valide jusqu’au ${lease.end_date}`,
    };
  },
};

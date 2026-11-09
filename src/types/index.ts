export type UserRole = 'tenant' | 'admin';

export type RentPeriod = 'night' | 'month' | 'year';

export type ListingStatus = 'available' | 'rented' | 'hidden';

export type AdrarNeighborhood =
  | 'حي السلام'
  | 'حي قصر تيليلين'
  | 'وسط المدينة'
  | 'حي 140 مسكن'
  | 'حي المطار'
  | 'حي البدر'
  | 'حي 20 أوت';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  role_code: number; // 1 = Admin, 0 = Tenant
  pin?: string;
  created_at: string;
  updated_at?: string;
}

export interface Listing {
  id: string;
  ref_code: string; // e.g. ADR-1042
  title_ar: string;
  title_fr: string;
  description_ar?: string;
  description_fr?: string;
  neighborhood: AdrarNeighborhood | string;
  property_type: 'apartment' | 'villa' | 'duplex' | 'studio';
  bedrooms: number;
  bathrooms: number;
  living_rooms: number;
  area_m2: number;
  price_night: number; // DZD per day
  price_month: number; // DZD per month
  price_year: number; // DZD per year
  contact_whatsapp: string; // Default: 213550472523
  status: ListingStatus;
  image_url: string;
  images?: string[];
  amenities?: string[];
  created_at: string;
}

export interface Lease {
  id: string;
  listing_id: string;
  tenant_name: string;
  tenant_phone: string;
  period_type: RentPeriod; // 'night' | 'month' | 'year'
  agreed_price: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: 'active' | 'expiring_soon' | 'ended';
  notes?: string;
  created_at: string;
  // Denormalized property details for quick display
  listing_title?: string;
  listing_ref?: string;
  listing_image?: string;
  neighborhood?: string;
}

export type Language = 'ar' | 'fr';

export type ThemeMode = 'dark' | 'light';

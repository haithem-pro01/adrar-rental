export type UserRole = 'admin' | 'tenant' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  role_code?: number; // 1 = Admin, 0 = Customers / Tenants
  is_active: boolean;
  created_at: string;
}

export type Municipality =
  | 'أدرار'
  | 'تيميمون'
  | 'رقان'
  | 'فنوغيل'
  | 'تسابيت'
  | 'زاوية كنتة'
  | 'أولف'
  | 'شروين';

export type RentalType = 'monthly' | 'yearly' | 'both';

export type ApartmentStatus = 'available' | 'rented' | 'hidden';

export interface Apartment {
  id: string;
  code: string; // e.g. ADR-1042
  title: string;
  description: string;
  municipality: Municipality;
  address: string;
  rental_type: RentalType;
  monthly_price: number; // DZD
  yearly_price: number; // DZD
  rooms: number;
  bathrooms: number;
  area: number; // m²
  floor: number | string;
  amenities: string[];
  images: string[];
  status: ApartmentStatus;
  landlord_phone?: string;
  landlord_name?: string;
  average_rating?: number;
  reviews_count?: number;
  created_at: string;
}

export type LeaseStatus = 'active' | 'expiring_soon' | 'ended';

export interface Lease {
  id: string;
  apartment_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  apartment_title: string;
  apartment_code: string;
  apartment_municipality: Municipality;
  apartment_image?: string;
  lease_type: 'monthly' | 'yearly';
  rent_amount: number; // DZD
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: LeaseStatus;
  notes?: string;
  created_at: string;
}

export interface Review {
  id: string;
  apartment_id: string;
  tenant_id: string;
  tenant_name: string;
  rating: number; // 1 to 5 stars
  comment: string;
  lease_id?: string;
  created_at: string;
}

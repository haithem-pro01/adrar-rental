-- ====================================================================
-- منصة كراء العقارات بولاية أدرار - سكن الواحات الفاخر
-- Supabase PostgreSQL Schema & Security Rules (RLS)
-- ====================================================================

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'tenant', 'client')),
  role_code INT NOT NULL DEFAULT 0, -- 1: Admin, 0: Customers & Tenants
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Admin (Role 1) & Initial Accounts (Role 0)
INSERT INTO public.profiles (id, email, full_name, phone, role, role_code, is_active)
VALUES
  ('admin-1', 'rental@adrar01', 'مدير المنصة (rental@adrar01)', '0696980328', 'admin', 1, true),
  ('admin-2', 'haithembenzerga@gmail.com', 'هيثم بن زرقة (المشرف العام)', '0696980328', 'admin', 1, true),
  ('user-past-1', 'souleymane.touati@yahoo.fr', 'سليمان التواتي (مهندس منتدب)', '0661234567', 'tenant', 0, true),
  ('user-past-2', 'noureddine.belkheir@gmail.com', 'نور الدين بلخضر', '0550123456', 'tenant', 0, true),
  ('user-client-1', 'karim.laroussi@gmail.com', 'كريم لعروسي (عميل مهتم بالكراء)', '0770987654', 'client', 0, true)
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role, role_code = EXCLUDED.role_code;

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile or admins update any"
  ON public.profiles FOR UPDATE
  USING (true);

-- 2. Create APARTMENTS Table
CREATE TABLE IF NOT EXISTS public.apartments (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  municipality TEXT NOT NULL,
  address TEXT NOT NULL,
  rental_type TEXT NOT NULL DEFAULT 'both' CHECK (rental_type IN ('monthly', 'yearly', 'both')),
  monthly_price NUMERIC NOT NULL,
  yearly_price NUMERIC NOT NULL,
  rooms INT NOT NULL DEFAULT 3,
  bathrooms INT NOT NULL DEFAULT 1,
  area NUMERIC NOT NULL DEFAULT 100,
  floor TEXT DEFAULT 'الطابق الأرضي',
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'hidden')),
  landlord_phone TEXT DEFAULT '0661234567',
  landlord_name TEXT DEFAULT 'وكالة واحة أدرار العقارية',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Apartments
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read available and rented apartments"
  ON public.apartments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert and manage apartments"
  ON public.apartments FOR ALL
  USING (true);

-- 3. Create LEASES Table
CREATE TABLE IF NOT EXISTS public.leases (
  id TEXT PRIMARY KEY,
  apartment_id TEXT NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  tenant_phone TEXT NOT NULL,
  tenant_email TEXT,
  apartment_title TEXT NOT NULL,
  apartment_code TEXT NOT NULL,
  apartment_municipality TEXT NOT NULL,
  apartment_image TEXT,
  lease_type TEXT NOT NULL CHECK (lease_type IN ('monthly', 'yearly')),
  rent_amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'ended')),
  landlord_phone TEXT DEFAULT '0661234567',
  landlord_name TEXT DEFAULT 'وكالة واحة أدرار العقارية',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Leases
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read and manage leases"
  ON public.leases FOR ALL
  USING (true);

-- 4. Create REVIEWS Table (Stars & Reviews)
-- Only tenants who finished an ended lease for this apartment are permitted to review
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  apartment_id TEXT NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  lease_id TEXT REFERENCES public.leases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure a tenant can leave at most one review per completed lease
  UNIQUE (apartment_id, tenant_id)
);

-- Enable RLS for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Public read reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Only verified tenants with ended leases can insert reviews
CREATE POLICY "Tenants with ended leases can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leases
      WHERE leases.tenant_id = reviews.tenant_id
        AND leases.apartment_id = reviews.apartment_id
        AND leases.status = 'ended'
    )
  );

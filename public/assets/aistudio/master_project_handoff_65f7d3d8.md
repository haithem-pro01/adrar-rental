# ملف التسليم والمواصفات الشاملة لمنصة "وكالة زيد العقارية — أدرار"
# ZAYD Agence Immobilière — Master Architecture & Engineering Handoff

هذا الملف مخصص للمطور أو لأي نموذج ذكاء اصطناعي متقدم (مثل **Claude 3.5 Sonnet** أو **Cursor** أو **AI Studio**) لتوليد التطبيق كاملاً وبدقة 100% دون أي اجتهاد أو تحريف.

---

## 1. الهوية البصرية المعتمدة (Exact Visual Identity & Design System)

الموقع يجب أن يطابق بدقة شاشة الماك بوك الفندقية الفاخرة التي تم اعتمادها:

### أ. لوحة الألوان (Hex Colors):
* **الخلفية الداكنة الفاخرة (Deep Obsidian Navy):** `#060D18` و `#0A1424` (للترويسة والقوائم).
* **الكحلي المتوسط للبطاقات (Navy Surface):** `#101D33` و `#14233C`.
* **الذهبي الملكي (Sahara Gold):** `#C5A059` (اللون الذهبي المستخرج من الشعار، يستخدم للتبويبات النشطة، الإطارات، والشارات).
* **الذهبي الفاتح (Light Gold Accent):** `#DFBF7A`.
* **الأخضر للواتساب (Emerald Action):** `#10B981` (للزر الرئيسي للحجز).
* **النصوص:** الأبيض الناصع `#FFFFFF` والرمادي الثلجي `#E2E8F0`.

### ب. بنية الصفحة الرئيسية (Layout Hierarchy):
1. **الترويسة (Top Header - Fixed 80px):**
   * **اليمين:** الشعار الرسمي المعتمد (أيقونة الأبراج والمدار الذهبي والطائرة) + نص عريض:
     `وكالة زَيــد العقارية` (بخط Cairo أسود عريض) وتحتها `ZAYD Agence Immobilière • أدرار`.
   * **الوسط:** روابط تنقل أفقية (`الرئيسية` تحتها خط ذهبي نشط، `العقارات`، `عن الوكالة`، `اتصل بنا`).
   * **اليسار:** زر التبديل `AR / FR`، زر الوضع الليلي/النهاري `🌙/☀️`، وزر بإطار ذهبي `تسجيل الدخول بالهاتف`.
2. **واجهة البطل (Hero Section):**
   * صورة خلفية لفيلا معمارية صحراوية راقية بإضاءات ليلية خافتة مع تراكب لوني كحلي متدرج (`linear-gradient(to bottom, rgba(10,20,36,0.85), #060D18)`).
   * العنوان الرئيسي العريض في المنتصف: **"سكن وإقامات فاخرة للإيجار في أدرار"**.
   * صندوق البحث العائم المذهب، يعلوه 3 أزرار تبويب:
     * `كراء يومي` (نشط بلون ذهبي متدرج).
     * `كراء شهري` (خلفية شفافة).
     * `كراء سنوي` (خلفية شفافة).
   * شريط إدخال أبيض مستدير الحواف بداخله أيقونة بحث وقائمة اختيار أحياء بلدية أدرار حصرياً، وبجانبه زر تصفية.
3. **شبكة كروت العقارات (Luxury Cards Grid):**
   * بطاقات بيضاء أو كحلية ناصعة بزوايا مستديرة ناعمة (`rounded-3xl`) مع ظل عميق.
   * صورة العقار الداخلية عالية الدقة.
   * **شارة السعر الذهبية الطافية:** مستطيل ذهبي في الزاوية العلوية (مثال: `15,000 د.ج / يوم` أو `45,000 د.ج / شهر`).
   * **شريط أيقونات المواصفات الهندسي:** سطر أفقي يحتوي: `🛏️ 3 غرف` | `🛁 3 حمامات` | `🛋️ 2 صالون` | `📐 120 م²`.
   * **زر الواتساب الأخضر الممتد:** زر عريض بلون الزمرد `bg-emerald-500` مكتوب عليه `💬 احجز عبر واتساب` مع أيقونة الواتساب.

---

## 2. المنطق الوظيفي وقواعد العمل (Business Rules)

### أ. الدخول بالهاتف فقط (No Email Auth):
* لا يُطلب من المستخدم بريد إلكتروني نهائياً (يتناسب مع طبيعة ولاية أدرار).
* الحقول المطلوبة: **الاسم واللقب** + **رقم الهاتف الجزائري** (`05/06/07...`) + **رمز سري (PIN)** من 4 إلى 6 أرقام.
* لا يوجد حظر تفعيل أو KYC يعطل الزائر؛ التصفح متاح للجميع، والدخول مطلوب لإدارة العقود.

### ب. أرقام المشرفين المعتمدة (Admin Access):
عند تسجيل الدخول بأي من هذه الأرقام الثلاثة حصراً، يفتح النظام تلقائياً **لوحة تحكم الإدارة (`/admin`)**:
1. `+213 550 47 25 23` (أو `0550472523`)
2. `+213 696 98 03 28` (أو `0696980328`)
3. `+213 552 06 98 74` (أو `0552069874`)

### ج. حجز الواتساب التلقائي (Smart WhatsApp Direct):
* رقم الواتساب الرسمي المستلم للطلبات: `+213 550 47 25 23` (الدولي: `213550472523`).
* الرابط المولد عند الضغط على أي شقة:
  `https://wa.me/213550472523?text=[نص مشفر]`
* نص الرسالة المنظم:
  > "السلام عليكم وكالة زيد العقارية، أنا مهتم بكراء: [عنوان الشقة] (كود: [ADR-XXX]) في [الحي] بأدرار، نوع الكراء: [يومي/شهري/سنوي] بسعر [السعر]. هل الشقة متوفرة للمعاينة؟"

### د. نظام التنبيهات الذكي لعقود الكراء (Smart Expiry Alerts):
في لوحة تحكم الآدمن، يقوم النظام بحساب الفارق الزمني لتاريخ نهاية كل عقد ويطلق شارات تحذيرية:
* **عقد كراء يومي:** تنبيه أحمر إذا تبقى أقل من **24 ساعة**.
* **عقد كراء شهري:** تنبيه برتقالي إذا تبقى أقل من **7 أيام**.
* **عقد كراء سنوي:** تنبيه أصفر إذا تبقى أقل من **30 يوماً**.

### هـ. نطاق الموقع الجغرافي:
* بلدية أدرار حصرياً (Adrar Centre) وتشمل الأحياء:
  * حي السلام
  * حي قصر تيليلين
  * وسط المدينة (Centre-Ville)
  * حي 140 مسكن
  * حي المطار
  * حي البدر
  * حي 20 أوت

---

## 3. إعدادات وقاعدة بيانات Supabase (Backend Specs)

### أ. المفاتيح الرسمية للمشروع:
```env
VITE_SUPABASE_URL=https://afqwgpcbvissovuirihh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ibFkMQumiCub8zrJJetT8Q_MAHOhtgf
VITE_WHATSAPP_PHONE=213550472523
```

### ب. كود PostgreSQL الكامل للتشغيل (01_supabase_database.sql):
```sql
-- 1. أنواع البيانات
create type public.user_role as enum ('tenant', 'admin');
create type public.rent_period as enum ('night', 'month', 'year');
create type public.listing_status as enum ('available', 'rented', 'hidden');

-- 2. جدول المستخدمين (Phone Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null unique,
  role public.user_role not null default 'tenant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. جدول عقارات بلدية أدرار
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null unique default ('ADR-' || upper(substr(md5(random()::text), 1, 6))),
  title_ar text not null,
  title_fr text not null,
  neighborhood text not null,
  property_type text not null default 'apartment',
  bedrooms smallint not null default 3,
  bathrooms smallint not null default 2,
  living_rooms smallint not null default 1,
  area_m2 integer not null default 100,
  price_night numeric(12,2) default 0,
  price_month numeric(12,2) default 0,
  price_year numeric(12,2) default 0,
  contact_whatsapp text not null default '213550472523',
  status public.listing_status not null default 'available',
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 4. جدول عقود الكراء والتنبيهات
create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  tenant_name text not null,
  tenant_phone text not null,
  period_type public.rent_period not null default 'month',
  agreed_price numeric(12,2) not null check (agreed_price >= 0),
  start_date date not null,
  end_date date not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- 5. الصلاحيات وفحص أرقام المشرفين الثلاثة
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.leases   enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() 
      and (
        role = 'admin' or 
        phone in ('0550472523', '+213550472523', '0696980328', '+213696980328', '0552069874', '+213552069874')
      )
  );
$$;

create policy "listings_public_read" on public.listings for select using (true);
create policy "listings_admin_manage" on public.listings for all using (public.is_admin());
create policy "leases_select" on public.leases for select using (public.is_admin() or tenant_phone = (select phone from public.profiles where id = auth.uid()));
create policy "leases_admin_manage" on public.leases for all using (public.is_admin());
```

---

## 4. البرومبت الموجه للنماذج البرمجية الذكية (Master LLM Build Prompt)

انسخ هذا النص كاملاً وأعطه لـ **Claude 3.5 Sonnet** أو **Cursor** أو أي أداة ذكاء اصطناعي:

```markdown
You are a Principal Frontend Architect and Senior UI/UX Designer.
Build a complete, pixel-perfect, production-ready web application in React 18, TypeScript, and Tailwind CSS for "ZAYD Agence Immobilière" (وكالة زيد العقارية), a luxury real estate rental agency based in Adrar Centre, Algeria.

### 1. STRICT VISUAL IDENTITY & THEME
- Background Theme: Deep Obsidian Luxury Navy (#060D18 and #0A1424) with warm Sahara Gold accents (#C5A059 / #DFBF7A).
- Header: Dark navy bar featuring the ZAYD brand emblem, title "وكالة زَيــد العقارية" + "Agence Immobilière ZAYD", navigation links ("الرئيسية" with active gold underline, "العقارات", "عن الوكالة", "اتصل بنا"), language toggle [AR / FR], dark mode toggle, and a gold-outlined button "تسجيل الدخول".
- Hero: Cinematic luxury residential villa background with an ambient navy gradient overlay. Heading: "سكن وإقامات فاخرة للإيجار في أدرار".
- Floating Search Box: 
  * Period Tabs: [كراء يومي (Active Gold) | كراء شهري | كراء سنوي].
  * Search bar with dropdown of Adrar neighborhoods (حي السلام، حي قصر تيليلين، وسط المدينة، حي 140 مسكن، حي المطار، حي البدر) and a quick filter button.
- Luxury Listing Cards:
  * Premium property photo with floating gold price badge on top right (e.g. "15,000 د.ج / يوم" or "45,000 د.ج / شهر").
  * Specs Row: 🛏️ Bedrooms | 🛁 Bathrooms | 🛋️ Living Rooms | 📐 Area m².
  * Full-width emerald WhatsApp action button: "💬 احجز عبر واتساب" linking dynamically to +213 550 47 25 23 with encoded property ref code, title, and price.

### 2. AUTHENTICATION & ROLE-BASED ACCESS
- Phone-Only Auth: User enters Full Name + Algerian Mobile Number (05xx/06xx/07xx) + 4-6 digit PIN. No email required.
- Hardcoded Admin Privileges: If the entered phone ends with 0550472523, 0696980328, or 0552069874, the user automatically gets role = 'admin' and gains access to the Admin Dashboard (/admin).
- Regular tenants see their active lease banner ("عقدي الحالي") if assigned by the admin.

### 3. ADMIN DASHBOARD & EXPIRY ALERTS
- KPI Cards: Total Properties, Available, Rented, and Expiring Leases.
- Properties Management: Add, edit, toggle available/rented, and delete properties.
- Lease Management: Assign property to a tenant phone, select lease period (night, month, year), start and end dates.
- Smart Expiry Warning Badges:
  * Daily leases expiring in < 24h.
  * Monthly leases expiring in < 7 days.
  * Yearly leases expiring in < 30 days.

### 4. BILINGUAL SUPPORT (AR / FR)
- Arabic (RTL, Cairo font) default.
- French (LTR, Inter font) toggled via the [AR / FR] pill button with full text translation.

### 5. INTEGRATION
- Connect to Supabase using:
  VITE_SUPABASE_URL=https://afqwgpcbvissovuirihh.supabase.co
  VITE_SUPABASE_ANON_KEY=sb_publishable_ibFkMQumiCub8zrJJetT8Q_MAHOhtgf
- WhatsApp target: 213550472523.
```

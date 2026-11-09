import React, { useState } from 'react';
import {
  Check,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  KeyRound,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { dbService } from '../../services/supabase';
import { Apartment, ApartmentStatus, Municipality, RentalType } from '../../types';

interface PropertyManagementProps {
  apartments: Apartment[];
  onRefresh: () => void;
  onNotification: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}

const ADRAR_MUNICIPALITIES: Municipality[] = [
  'أدرار',
  'تيميمون',
  'رقان',
  'فنوغيل',
  'تسابيت',
  'زاوية كنتة',
  'أولف',
  'شروين',
];

const PRESET_IMAGES = [
  { label: 'شقة عصرية بأدرار', url: '/images/apartment_adrar_modern_1_1794234918725.jpg' },
  { label: 'قصر تيميمون التراثي', url: '/images/apartment_timimoun_palmeraie_1794234919292.jpg' },
  { label: 'إقامة رقان الفاخرة', url: '/images/apartment_reggane_suite_1794234919330.jpg' },
  { label: 'فيلا الواحات الكبرى', url: '/images/hero_adrar_luxury_1794234917435.jpg' },
];

export const PropertyManagement: React.FC<PropertyManagementProps> = ({
  apartments,
  onRefresh,
  onNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('الكل');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [municipality, setMunicipality] = useState<Municipality>('أدرار');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [rentalType, setRentalType] = useState<RentalType>('both');
  const [monthlyPrice, setMonthlyPrice] = useState(45000);
  const [yearlyPrice, setYearlyPrice] = useState(500000);
  const [rooms, setRooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(1);
  const [area, setArea] = useState(120);
  const [floor, setFloor] = useState('الطابق الأول');
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([
    'مكيف صحراوي',
    'خزان ماء 2000 لتر',
    'أنترنت فايبر',
  ]);
  const [images, setImages] = useState<string[]>([
    '/images/apartment_adrar_modern_1_1794234918725.jpg',
  ]);
  const [status, setStatus] = useState<ApartmentStatus>('available');
  const [landlordPhone, setLandlordPhone] = useState('0661234567');
  const [landlordName, setLandlordName] = useState('وكالة واحة أدرار');

  const openAddModal = () => {
    setEditingApartment(null);
    setTitle('');
    setCode(`ADR-${Math.floor(1000 + Math.random() * 9000)}`);
    setMunicipality('أدرار');
    setAddress('');
    setDescription('');
    setRentalType('both');
    setMonthlyPrice(50000);
    setYearlyPrice(550000);
    setRooms(3);
    setBathrooms(1);
    setArea(115);
    setFloor('الطابق الأول');
    setAmenities(['مكيف صحراوي', 'خزان ماء 2000 لتر', 'مطبخ مجهز', 'أنترنت فايبر']);
    setImages(['/images/apartment_adrar_modern_1_1794234918725.jpg']);
    setStatus('available');
    setLandlordPhone('0661234567');
    setLandlordName('وكالة واحة أدرار');
    setIsModalOpen(true);
  };

  const openEditModal = (apt: Apartment) => {
    setEditingApartment(apt);
    setTitle(apt.title);
    setCode(apt.code);
    setMunicipality(apt.municipality);
    setAddress(apt.address);
    setDescription(apt.description);
    setRentalType(apt.rental_type);
    setMonthlyPrice(apt.monthly_price);
    setYearlyPrice(apt.yearly_price);
    setRooms(apt.rooms);
    setBathrooms(apt.bathrooms);
    setArea(apt.area);
    setFloor(String(apt.floor));
    setAmenities(apt.amenities);
    setImages(apt.images);
    setLandlordPhone(apt.landlord_phone || '0661234567');
    setLandlordName(apt.landlord_name || 'وكالة واحة أدرار');
    setIsModalOpen(true);
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  // Image uploader with auto-compression via HTML Canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setImages([compressedDataUrl, ...images]);
          onNotification('تم تحميل وضغط الصورة بنجاح!', 'success');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSaveApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) {
      onNotification('يرجى ملء الحقول الإجبارية (العنوان والموقع)', 'warning');
      return;
    }

    try {
      if (editingApartment) {
        await dbService.updateApartment(editingApartment.id, {
          title,
          code,
          municipality,
          address,
          description,
          rental_type: rentalType,
          monthly_price: Number(monthlyPrice),
          yearly_price: Number(yearlyPrice),
          rooms: Number(rooms),
          bathrooms: Number(bathrooms),
          area: Number(area),
          floor,
          amenities,
          images,
          status,
          landlord_phone: landlordPhone,
          landlord_name: landlordName,
        });
        onNotification('تم تحديث بيانات الشقة بنجاح!', 'success');
      } else {
        await dbService.addApartment({
          title,
          code,
          municipality,
          address,
          description,
          rental_type: rentalType,
          monthly_price: Number(monthlyPrice),
          yearly_price: Number(yearlyPrice),
          rooms: Number(rooms),
          bathrooms: Number(bathrooms),
          area: Number(area),
          floor,
          amenities,
          images,
          status,
          landlord_phone: landlordPhone,
          landlord_name: landlordName,
        });
        onNotification('تم إضافة الشقة الجديدة إلى قائمة أدرار بنجاح!', 'success');
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      onNotification('حدث خطأ أثناء حفظ الشقة', 'error');
    }
  };

  // Quick 1-click status toggle as required
  const handleQuickStatusToggle = async (apt: Apartment, newStatus: ApartmentStatus) => {
    await dbService.setApartmentStatus(apt.id, newStatus);
    onNotification(`تم تغيير حالة الشقة [${apt.code}] إلى: ${
      newStatus === 'available' ? 'متاحة' : newStatus === 'rented' ? 'مؤجرة' : 'مخفية'
    }`, 'success');
    onRefresh();
  };

  const handleDelete = async (id: string, aptCode: string) => {
    if (confirm(`هل أنت متأكد من حذف الشقة كود [${aptCode}] نهائياً؟`)) {
      await dbService.deleteApartment(id);
      onNotification('تم حذف الشقة بنجاح', 'success');
      onRefresh();
    }
  };

  // Filter properties
  const filteredApartments = apartments.filter((a) => {
    if (selectedMunicipality !== 'الكل' && a.municipality !== selectedMunicipality) return false;
    if (selectedStatus !== 'الكل' && a.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">إدارة الشقق والعقارات (CRUD)</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            إضافة وتعديل وحذف الشقق وضبط أسعار الكراء وحالة العرض
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 py-2.5 px-4 bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شقة جديدة في أدرار</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالعنوان، الكود، أو الحي..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        <select
          value={selectedMunicipality}
          onChange={(e) => setSelectedMunicipality(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl border border-stone-200 bg-white text-stone-700"
        >
          <option value="الكل">كل بلديات أدرار</option>
          {ADRAR_MUNICIPALITIES.map((m) => (
            <option key={m} value={m}>
              بلدية {m}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl border border-stone-200 bg-white text-stone-700"
        >
          <option value="الكل">جميع الحالات</option>
          <option value="available">متاحة للكراء</option>
          <option value="rented">مؤجرة حالياً</option>
          <option value="hidden">مخفية عن العامة</option>
        </select>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
              <tr>
                <th className="py-3 px-4">العقار والكود</th>
                <th className="py-3 px-4">البلدية والموقع</th>
                <th className="py-3 px-4">نوع الكراء والسعر</th>
                <th className="py-3 px-4">المواصفات</th>
                <th className="py-3 px-4">التبديل السريع للحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredApartments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    لا توجد شقق مطابقة للمعايير المحددة.
                  </td>
                </tr>
              ) : (
                filteredApartments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Apartment & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={apt.images?.[0] || '/images/apartment_adrar_modern_1_1794234918725.jpg'}
                          alt={apt.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-10 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                        />
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1 max-w-[200px]">
                            {apt.title}
                          </p>
                          <span className="font-mono text-[10px] text-[#C85A32] font-bold">
                            {apt.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Municipality */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-semibold text-stone-900">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{apt.municipality}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 line-clamp-1 max-w-[150px]">
                        {apt.address}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1E4D38] tabular-nums">
                        {apt.rental_type === 'yearly'
                          ? `${apt.yearly_price.toLocaleString('fr-DZ')} دج/سنة`
                          : `${apt.monthly_price.toLocaleString('fr-DZ')} دج/شهر`}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {apt.rental_type === 'both'
                          ? 'شهري أو سنوي'
                          : apt.rental_type === 'yearly'
                          ? 'سنوي فقط'
                          : 'شهري فقط'}
                      </span>
                    </td>

                    {/* Specs */}
                    <td className="py-3 px-4">
                      <span className="tabular-nums font-medium">
                        {apt.rooms} غرف · {apt.area} م²
                      </span>
                      <span className="block text-[10px] text-stone-500">{apt.floor}</span>
                    </td>

                    {/* Quick Status Toggle (One-Click) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg w-fit">
                        <button
                          type="button"
                          onClick={() => handleQuickStatusToggle(apt, 'available')}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                            apt.status === 'available'
                              ? 'bg-[#1E4D38] text-white shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                          title="ضبط كـ متاحة"
                        >
                          متاحة
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusToggle(apt, 'rented')}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                            apt.status === 'rented'
                              ? 'bg-[#C85A32] text-white shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                          title="ضبط كـ مؤجرة"
                        >
                          مؤجرة
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusToggle(apt, 'hidden')}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                            apt.status === 'hidden'
                              ? 'bg-stone-700 text-white shadow-2xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                          title="إخفاء من القائمة"
                        >
                          مخفية
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(apt)}
                          className="p-1.5 text-stone-500 hover:text-[#1E4D38] hover:bg-emerald-50 rounded-lg transition-colors"
                          title="تعديل الشقة"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(apt.id, apt.code)}
                          className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف الشقة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Apartment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-stone-900">
                {editingApartment ? `تعديل الشقة [${editingApartment.code}]` : 'إضافة شقة سكنية جديدة بأدرار'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">عنوان الشقة المعروضة *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: شقة دوبلكس مؤثثة مطلة على النخيل"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">كود الشقة الداخلي</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">البلدية في ولاية أدرار *</label>
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value as Municipality)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {ADRAR_MUNICIPALITIES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">العنوان الدقيق والحي *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: حي 140 مسكن، قرب مجمع المحاكم"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">وصف تفصيلي للشقة</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مواصفات الشقة، حالة العزل الحراري، الأثاث، الجيران..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Rental type & Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">نظام الكراء المتاح</label>
                  <select
                    value={rentalType}
                    onChange={(e) => setRentalType(e.target.value as RentalType)}
                    className="w-full p-2 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="both">كلاهما (شهري وسنوي)</option>
                    <option value="monthly">كراء شهري فقط</option>
                    <option value="yearly">كراء سنوي فقط</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">السعر الشهري (دج)</label>
                  <input
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">السعر السنوي (دج)</label>
                  <input
                    type="number"
                    value={yearlyPrice}
                    onChange={(e) => setYearlyPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 tabular-nums"
                  />
                </div>
              </div>

              {/* Rooms & Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">عدد الغرف</label>
                  <input
                    type="number"
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-200 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-200 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">الطابق</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="الطابق الأول"
                    className="w-full p-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">حالة العرض الأولية</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApartmentStatus)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="available">متاحة للكراء</option>
                    <option value="rented">مؤجرة</option>
                    <option value="hidden">مخفية</option>
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">المرافق والتجهيزات</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    placeholder="أضف ميزة (مثال: خزان ماء 3000L، مكيف مركزي...)"
                    className="flex-1 p-2 rounded-xl border border-stone-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-800"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-[11px]"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(idx)}
                        className="text-stone-400 hover:text-rose-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Image Uploader & Presets */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="block font-bold text-stone-700 mb-1">
                  صور الشقة (رفع مع ضغط تلقائي أو اختيار من النماذج الصحراوية)
                </label>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3 bg-white border border-stone-300 rounded-lg text-stone-700 hover:border-[#1E4D38] font-bold">
                    <Upload className="w-3.5 h-3.5 text-[#1E4D38]" />
                    <span>رفع صورة من جهازك (ضغط تلقائي)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-stone-400 text-[10px]">أو اختر نموذجاً:</span>
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImages([preset.url, ...images])}
                      className="py-1 px-2 bg-white border border-stone-200 rounded text-[10px] text-stone-600 hover:border-[#C85A32]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Previews */}
                <div className="flex gap-2 overflow-x-auto py-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-stone-300">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Landlord Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">اسم الوكيل أو المالك</label>
                  <input
                    type="text"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">رقم هاتف المالك (للحجز عبر واتساب)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={landlordPhone}
                    onChange={(e) => setLandlordPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 tabular-nums"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#1E4D38] hover:bg-[#153828] text-white font-bold rounded-xl shadow-xs"
                >
                  {editingApartment ? 'حفظ التعديلات' : 'إضافة الشقة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  FileUp,
  Image as ImageIcon,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { compressImageToDataUrl, uploadKycDocument } from '../services/supabase';

const DEMO_FRONT_CARD =
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80';
const DEMO_BACK_CARD =
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80';

export const KycVerificationModal: React.FC = () => {
  const {
    currentUser,
    kycModalOpen,
    closeKycModal,
    submitKyc,
    refreshCurrentUser,
  } = useAuth();

  const [documentType, setDocumentType] = useState<string>('بطاقة التعريف الوطنية البيومترية');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  
  // Front and Back images
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!kycModalOpen || !currentUser) return null;

  // Normalize status: treat 'pending_review' as 'pending'
  const rawStatus = currentUser.kyc_status || (currentUser.is_active ? 'verified' : 'unverified');
  const currentStatus: 'unverified' | 'pending' | 'verified' | 'rejected' =
    rawStatus === 'pending_review' ? 'pending' : (rawStatus as any);

  const handleFrontFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).');
      return;
    }

    try {
      setFrontFile(file);
      // Fast client-side compression preview
      const { dataUrl } = await compressImageToDataUrl(file);
      setFrontPreview(dataUrl);
    } catch {
      setErrorMsg('تعذر قراءة ملف الصورة، يرجى المحاولة بصورة أخرى.');
    }
  };

  const handleBackFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).');
      return;
    }

    try {
      setBackFile(file);
      const { dataUrl } = await compressImageToDataUrl(file);
      setBackPreview(dataUrl);
    } catch {
      setErrorMsg('تعذر قراءة ملف الصورة، يرجى المحاولة بصورة أخرى.');
    }
  };

  const handleUseDemoCards = () => {
    setFrontPreview(DEMO_FRONT_CARD);
    setBackPreview(DEMO_BACK_CARD);
    if (!documentNumber) {
      setDocumentNumber('110948271039');
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!frontPreview) {
      setErrorMsg('يرجى رفع صورة الوجه الأمامي لبطاقة التعريف للمتابعة.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('جاري معالجة وضغط وثائق الهوية...');

    try {
      let finalFront = frontPreview;
      let finalBack = backPreview || frontPreview;

      // If user uploaded real files, upload to storage
      if (frontFile) {
        setUploadProgress('جاري رفع الوجه الأمامي إلى مساحة التخزين الآمنة...');
        finalFront = await uploadKycDocument(currentUser.id, frontFile, 'front');
      }

      if (backFile) {
        setUploadProgress('جاري رفع الوجه الخلفي إلى مساحة التخزين الآمنة...');
        finalBack = await uploadKycDocument(currentUser.id, backFile, 'back');
      }

      setUploadProgress('جاري تسجيل طلب التوثيق...');
      const success = await submitKyc({
        id_card_front: finalFront,
        id_card_back: finalBack,
        id_card_image: finalFront,
        id_card_type: documentType,
        id_card_number: documentNumber.trim(),
      });

      if (success) {
        setFrontPreview('');
        setBackPreview('');
        setFrontFile(null);
        setBackFile(null);
        setDocumentNumber('');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء رفع الوثائق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl bg-[#FDFBF7] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800 animate-scale-up max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1E4D38] text-white p-5 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <CreditCard className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif leading-tight">
                توثيق الهوية الوطنية (KYC)
              </h3>
              <p className="text-xs text-emerald-100 font-sans mt-0.5">
                تفعيل حساب المستأجرين والحجز الفوري بمنصة عقارات أدرار
              </p>
            </div>
          </div>
          <button
            onClick={closeKycModal}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status banner with 4 explicit states */}
          <div className="rounded-2xl p-4 border flex items-start gap-3.5 shadow-xs transition-all bg-white">
            {currentStatus === 'verified' && (
              <>
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-800 text-base">حسابك مفعل وموثق (Verified) ✓</span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">
                      نشط وجاهز للحجز
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    تم التحقق من وثائق هويتك بنجاح من طرف إدارة عقارات أدرار. يمكنك الآن حجز أي شقة، توقيع عقود الكراء، والتواصل المباشر مع الملاك.
                  </p>
                </div>
              </>
            )}

            {currentStatus === 'pending' && (
              <>
                <Clock className="w-7 h-7 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-800 text-base">الطلب قيد المراجعة (Pending)</span>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-bold">
                      بانتظار موافقة الإدارة
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    وثائقك قيد المراجعة من طرف الإدارة حالياً. ستتلقى إشعاراً فور التفعيل (عادة خلال دقائق إلى ساعات قليلة).
                  </p>
                </div>
              </>
            )}

            {currentStatus === 'rejected' && (
              <>
                <ShieldAlert className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-800 text-base">تم رفض وثيقة الهوية (Rejected)</span>
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full font-bold">
                      بحاجة لتعديل
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mt-1 font-semibold leading-relaxed">
                    سبب الرفض: {currentUser.kyc_rejection_reason || 'الصورة غير واضحة أو تاريخ الصلاحية منتهٍ. يرجى إعادة رفع صورة واضحة للوجهين.'}
                  </p>
                </div>
              </>
            )}

            {currentStatus === 'unverified' && (
              <>
                <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-800 text-base">حسابك غير مفعل بعد (Unverified)</span>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-bold">
                      خطوة التوثيق مطلوبة
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    حسابك غير مفعل بعد. يرجى رفع بطاقة التعريف الوطنية لتتمكن من كراء الشقق وتأكيد حجزك وتوقيع العقد.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* User info summary card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex justify-between items-center text-xs text-stone-600">
            <div>
              <span className="font-semibold text-stone-700">المستأجر:</span> {currentUser.full_name}
            </div>
            <div>
              <span className="font-semibold text-stone-700">الهاتف الجزائري:</span>{' '}
              <span className="font-mono text-stone-800 font-bold">{currentUser.phone || 'غير مسجل'}</span>
            </div>
          </div>

          {/* Form when not verified or when rejected or pending re-upload */}
          {currentStatus !== 'verified' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Document Type Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  نوع الوثيقة الرسمية
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E4D38] transition-shadow"
                >
                  <option value="بطاقة التعريف الوطنية البيومترية">
                    بطاقة التعريف الوطنية البيومترية (CNIB)
                  </option>
                  <option value="رخصة السياقة البيومترية">
                    رخصة السياقة البيومترية
                  </option>
                  <option value="جواز السفر الجزائري البيومتري">
                    جواز السفر الجزائري البيومتري
                  </option>
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  رقم الوثيقة / رقم التعريف الوطني (NIN)
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="مثال: 109847291039"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E4D38] transition-shadow font-mono"
                />
              </div>

              {/* Two-Sided Upload: Front & Back */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700">
                    صور بطاقة الهوية (الوجه الأمامي والخلفي)
                  </label>
                  <button
                    type="button"
                    onClick={handleUseDemoCards}
                    className="text-[11px] text-[#C85A32] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ملء بصور تجريبية للاختبار السريع (الوجهين)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* FRONT SIDE */}
                  <div>
                    <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                      الوجه الأمامي (Face Avant) *
                    </span>
                    {frontPreview ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[#1E4D38]/30 group bg-stone-100 h-36">
                        <img
                          src={frontPreview}
                          alt="الوجه الأمامي"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer bg-white text-stone-800 text-[11px] px-2.5 py-1 rounded-lg font-bold shadow hover:bg-stone-100">
                            تغيير
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFrontFileChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFrontPreview('');
                              setFrontFile(null);
                            }}
                            className="bg-rose-600 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold shadow hover:bg-rose-700 cursor-pointer"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-stone-300 rounded-2xl cursor-pointer hover:border-[#1E4D38] hover:bg-stone-50/80 transition-all">
                        <div className="flex flex-col items-center justify-center p-3 text-stone-500 text-center">
                          <FileUp className="w-7 h-7 text-[#1E4D38] mb-1.5" />
                          <p className="text-[11px] font-bold text-stone-700">
                            رفع الوجه الأمامي
                          </p>
                          <p className="text-[9px] text-stone-400 mt-0.5">
                            الوجه الأمامي للبطاقة
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFrontFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* BACK SIDE */}
                  <div>
                    <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                      الوجه الخلفي (Face Arrière)
                    </span>
                    {backPreview ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[#1E4D38]/30 group bg-stone-100 h-36">
                        <img
                          src={backPreview}
                          alt="الوجه الخلفي"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer bg-white text-stone-800 text-[11px] px-2.5 py-1 rounded-lg font-bold shadow hover:bg-stone-100">
                            تغيير
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBackFileChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setBackPreview('');
                              setBackFile(null);
                            }}
                            className="bg-rose-600 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold shadow hover:bg-rose-700 cursor-pointer"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-stone-300 rounded-2xl cursor-pointer hover:border-[#1E4D38] hover:bg-stone-50/80 transition-all">
                        <div className="flex flex-col items-center justify-center p-3 text-stone-500 text-center">
                          <FileUp className="w-7 h-7 text-[#C85A32] mb-1.5" />
                          <p className="text-[11px] font-bold text-stone-700">
                            رفع الوجه الخلفي
                          </p>
                          <p className="text-[9px] text-stone-400 mt-0.5">
                            الوجه الخلفي للبطاقة
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress text */}
              {uploadProgress && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1E4D38] hover:bg-[#153728] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ معالجة وإرسال الوثائق...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {currentStatus === 'pending'
                        ? 'تحديث صور بطاقة الهوية المرسلة'
                        : 'إرسال وثائق الهوية للمراجعة والتفعيل'}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-5 space-y-3">
              <div className="inline-flex p-3.5 bg-emerald-50 rounded-full text-emerald-600">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h4 className="font-bold text-stone-800 text-lg">
                أنت الآن مستأجر موثق ومفعل ✓
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                تم اعتماد وثائقك بنجاح. يمكنك الآن مراسلة الملاك وحجز أي شقة في أدرار وتيميمون، وإبرام عقود الكراء الرسمية بكل أمان.
              </p>
              <button
                onClick={closeKycModal}
                className="mt-2 bg-[#1E4D38] hover:bg-[#153728] text-white px-7 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تصفح الشقق المتاحة الآن
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100/70 border-t border-stone-200 px-6 py-3 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>بياناتك محمية ومشفرة وفق المعايير الجزائرية</span>
          </div>
          <button
            type="button"
            onClick={refreshCurrentUser}
            className="text-[#1E4D38] hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>تحديث الحالة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

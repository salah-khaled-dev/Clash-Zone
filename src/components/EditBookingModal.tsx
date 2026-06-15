import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCalendar, FiClock, FiUser, FiPhone, FiShare2, FiTag, FiFileText } from 'react-icons/fi';
import { LuCar } from 'react-icons/lu';
import { HiSparkles } from 'react-icons/hi2';
import type { Booking, BookingStatus, CustomerSource, CustomerType } from '../types/booking';
import { generateSlots } from '../utils/timeSlots';
import type { TimeSlot } from '../utils/timeSlots';
import { useToast } from './ToastProvider';

interface EditBookingModalProps {
  booking: Booking;
  bookings: Booking[];
  onClose: () => void;
  onSave: (bookingId: string, updatedData: Partial<Booking>) => void;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  booking,
  bookings,
  onClose,
  onSave
}) => {
  const { showToast } = useToast();

  // Form states matching database schema
  const [customerName, setCustomerName] = useState(booking.customer_name);
  const [customerPhone, setCustomerPhone] = useState(booking.customer_phone);
  const [customerSource, setCustomerSource] = useState<CustomerSource>(booking.customer_source || 'انستغرام');
  const [customerType, setCustomerType] = useState<CustomerType>(booking.customer_type || 'new');
  
  const [vehicleMake, setVehicleMake] = useState(booking.vehicle_make);
  const [vehicleModel, setVehicleModel] = useState(booking.vehicle_model);
  const [vehicleYear, setVehicleYear] = useState(booking.vehicle_year || '');
  
  const [serviceType, setServiceType] = useState(booking.service_type);
  const [date, setDate] = useState(booking.booking_date);
  const [selectedSlot, setSelectedSlot] = useState(booking.time_slot);
  const [status, setStatus] = useState<BookingStatus>(booking.status || 'جديد');
  const [notes, setNotes] = useState(booking.notes || '');

  // Follow-up dates states (convert to simple YYYY-MM-DD for inputs)
  const getInitialDateStr = (isoStr: string | null) => {
    if (!isoStr) return '';
    return isoStr.split('T')[0];
  };

  const [lastContactDate, setLastContactDate] = useState(getInitialDateStr(booking.last_contact_date));
  const [nextFollowupDate, setNextFollowupDate] = useState(getInitialDateStr(booking.next_followup_date));

  const [slots, setSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    setSlots(generateSlots());
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Exclude current booking ID when checking double booking
  const isSlotBooked = (d: string, t: string) => {
    return bookings.some(
      (b) => b.id !== booking.id && b.booking_date === d && b.time_slot === t && b.status !== 'ملغي'
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || customerName.trim().length < 3) {
      showToast("يرجى كتابة الاسم الكامل للعميل.", "warning");
      return;
    }
    
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      showToast("رقم الجوال غير صحيح! يجب أن يتكون من 10 أرقام ويبدأ بـ 05.", "warning");
      return;
    }

    if (!vehicleMake.trim() || !vehicleModel.trim()) {
      showToast("يرجى كتابة الشركة المصنعة وموديل السيارة.", "warning");
      return;
    }

    if (!date || !selectedSlot) {
      showToast("يرجى اختيار موعد الحجز.", "warning");
      return;
    }

    if (isSlotBooked(date, selectedSlot)) {
      showToast("هذا الموعد محجوز لعميل آخر! يرجى اختيار موعد آخر.", "error");
      return;
    }

    // Assemble updated object
    const updatedData: Partial<Booking> = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_source: customerSource,
      customer_type: customerType,
      vehicle_make: vehicleMake.trim(),
      vehicle_model: vehicleModel.trim(),
      vehicle_year: vehicleYear.trim() || null,
      service_type: serviceType,
      booking_date: date,
      time_slot: selectedSlot,
      status: status,
      notes: notes.trim() || null,
      // Format simple date back to ISO format if set
      last_contact_date: lastContactDate ? new Date(lastContactDate).toISOString() : null,
      next_followup_date: nextFollowupDate ? new Date(nextFollowupDate).toISOString() : null
    };

    onSave(booking.id, updatedData);
  };

  const servicesList = [
    "حماية الطلاء PPF",
    "نانو سيراميك",
    "عزل حراري",
    "تظليل النوافذ",
    "غسيل وتلميع",
    "خدمة أخرى"
  ];

  const sourcesList = [
    "انستغرام",
    "تيك توك",
    "سناب شات",
    "واتساب",
    "اتصال هاتفي",
    "زيارة مباشرة",
    "صديق / توصية",
    "جوجل",
    "إعلان ممول",
    "أخرى"
  ];

  const typesList = [
    { key: "new", label: "عميل جديد" },
    { key: "returning", label: "عميل سابق" },
    { key: "vip", label: "عميل VIP" },
    { key: "referred", label: "عميل محول من عميل آخر" }
  ] as const;

  const statusesList: BookingStatus[] = [
    "جديد",
    "تم التواصل",
    "تم التأكيد",
    "مكتمل",
    "ملغي"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-booking-title"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[32px] p-6 lg:p-8 w-full max-w-xl shadow-2xl border border-neutral-100 flex flex-col text-right relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2.5 text-gray-400 hover:text-gray-700 hover:bg-neutral-50 rounded-full transition-all"
          aria-label="إغلاق"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <h3 id="edit-booking-title" className="text-xl font-extrabold text-gray-900 mb-1 pr-1">تعديل بيانات العميل والموعد</h3>
        <p className="text-xs font-bold text-gray-400 mb-5 pr-1">تحديث سجل العميل في نظام الـ CRM</p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-customer-name" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <FiUser className="w-3.5 h-3.5" />
                <span>اسم العميل الكامل *</span>
              </label>
              <input
                id="edit-customer-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-customer-phone" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <FiPhone className="w-3.5 h-3.5" />
                <span>رقم الجوال *</span>
              </label>
              <input
                id="edit-customer-phone"
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-bold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
            </div>
          </div>

          {/* Row 2: Customer Source & Customer Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-customer-source" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <FiShare2 className="w-3.5 h-3.5" />
                <span>مصدر العميل *</span>
              </label>
              <select
                id="edit-customer-source"
                value={customerSource}
                onChange={(e) => setCustomerSource(e.target.value as CustomerSource)}
                className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
              >
                {sourcesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-customer-type" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <FiTag className="w-3.5 h-3.5" />
                <span>نوع العميل *</span>
              </label>
              <select
                id="edit-customer-type"
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
              >
                {typesList.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Vehicle details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-vehicle-make" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <LuCar className="w-3.5 h-3.5" />
                <span>نوع السيارة *</span>
              </label>
              <input
                id="edit-vehicle-make"
                type="text"
                required
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-vehicle-model" className="text-[11px] font-bold text-gray-400 pr-1">الموديل</label>
              <input
                id="edit-vehicle-model"
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-vehicle-year" className="text-[11px] font-bold text-gray-400 pr-1">سنة الصنع</label>
              <input
                id="edit-vehicle-year"
                type="text"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-bold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
              />
            </div>
          </div>

          {/* Row 4: Service & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-service-type" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <HiSparkles className="w-3.5 h-3.5" />
                <span>الخدمة المطلوبة *</span>
              </label>
              <select
                id="edit-service-type"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
              >
                {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-status" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <FiTag className="w-3.5 h-3.5" />
                <span>حالة الحجز *</span>
              </label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
              >
                {statusesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row 5: Date & Time slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-booking-date" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>التاريخ الجديد *</span>
              </label>
              <input
                id="edit-booking-date"
                type="date"
                required
                min={todayStr}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-time-slot" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <FiClock className="w-3.5 h-3.5" />
                <span>الوقت المتاح *</span>
              </label>
              {date ? (
                <select
                  id="edit-time-slot"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
                >
                  <option value="">-- اختر وقت الحجز المتاح --</option>
                  {slots.map((slot) => {
                    const booked = isSlotBooked(date, slot.key);
                    return (
                      <option 
                        key={slot.key} 
                        value={slot.key} 
                        disabled={booked}
                      >
                        {slot.label} {booked ? '(محجوز)' : ''}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="h-11 bg-neutral-50 border border-neutral-200/50 rounded-xl flex items-center px-4 text-xs text-gray-450 font-bold">
                  يرجى تحديد التاريخ أولاً
                </div>
              )}
            </div>
          </div>

          {/* Row 6: CRM Follow-up dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-last-contact-date" className="text-[11px] font-bold text-gray-400 pr-1">تاريخ آخر تواصل</label>
              <input
                id="edit-last-contact-date"
                type="date"
                value={lastContactDate}
                onChange={(e) => setLastContactDate(e.target.value)}
                className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-next-followup-date" className="text-[11px] font-bold text-gray-400 pr-1 text-amber-800">تاريخ المتابعة القادمة</label>
              <input
                id="edit-next-followup-date"
                type="date"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
                className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Row 7: Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-notes" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
              <FiFileText className="w-3.5 h-3.5" />
              <span>ملاحظات المتابعة المحدثة</span>
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: طلب العميل تظليل لون أسود 20%..."
              className="w-full p-3 bg-neutral-50 border border-neutral-200/85 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 justify-end mt-4 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-neutral-50 border border-neutral-200 rounded-xl transition-all"
            >
              تراجع
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold bg-[#F4C542] hover:bg-[#E8B923] text-gray-900 rounded-xl hover:shadow-md hover:shadow-[#F4C542]/10 transition-all"
            >
              حفظ التعديلات المحدثة
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default React.memo(EditBookingModal);

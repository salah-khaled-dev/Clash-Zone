import React, { useState } from 'react';
import { 
  FiUser, 
  FiPhone, 
  FiClock, 
  FiCalendar, 
  FiShare2, 
  FiTag, 
  FiPlusCircle,
  FiFileText
} from 'react-icons/fi';
import { LuCar } from 'react-icons/lu';
import { HiSparkles } from 'react-icons/hi2';
import { generateSlots } from '../utils/timeSlots';
import type { TimeSlot } from '../utils/timeSlots';
import { useToast } from './ToastProvider';
import type { Booking, BookingStatus, CustomerSource, CustomerType } from '../types/booking';

interface BookingFormProps {
  bookings: Booking[];
  onSubmitBooking: (bookingData: {
    customer_name: string;
    customer_phone: string;
    customer_source: CustomerSource;
    customer_type: CustomerType;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: string;
    service_type: string;
    branch_name: string;
    booking_date: string;
    time_slot: string;
    status: BookingStatus;
    notes: string;
  }) => void;
}

export const BookingForm = React.memo<BookingFormProps>(({ bookings, onSubmitBooking }) => {
  const { showToast } = useToast();

  // Form Fields State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerSource, setCustomerSource] = useState<CustomerSource>('انستغرام');
  const [customerType, setCustomerType] = useState<CustomerType>('new');
  
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  
  const [serviceType, setServiceType] = useState('حماية الطلاء PPF');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [status, setStatus] = useState<BookingStatus>('جديد');
  const [notes, setNotes] = useState('');

  // Slots state
  const [slots] = useState<TimeSlot[]>(() => generateSlots());

  const todayStr = new Date().toISOString().split('T')[0];

  // Check slot availability
  const isSlotBooked = (date: string, time: string) => {
    return bookings.some(
      (b) => b.booking_date === date && b.time_slot === time && b.status !== 'ملغي'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || customerName.trim().length < 3) {
      showToast("يرجى كتابة الاسم الكامل (٣ أحرف على الأقل).", "warning");
      return;
    }
    
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      showToast("رقم الجوال غير صحيح! يجب أن يبدأ بـ 05 ويتكون من ١٠ أرقام.", "warning");
      return;
    }

    if (!vehicleMake.trim() || !vehicleModel.trim()) {
      showToast("يرجى كتابة الشركة المصنعة وموديل السيارة.", "warning");
      return;
    }

    if (!bookingDate || !selectedTimeSlot) {
      showToast("يرجى تحديد تاريخ ووقت الحجز.", "warning");
      return;
    }

    // Double check duplicate slots
    if (isSlotBooked(bookingDate, selectedTimeSlot)) {
      showToast("هذا الموعد محجوز بالفعل! يرجى اختيار موعد آخر.", "error");
      return;
    }

    onSubmitBooking({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_source: customerSource,
      customer_type: customerType,
      vehicle_make: vehicleMake.trim(),
      vehicle_model: vehicleModel.trim(),
      vehicle_year: vehicleYear.trim(),
      service_type: serviceType,
      branch_name: 'فرع الرياض - حي المروج', // Automatically assigned Riyadh Branch
      booking_date: bookingDate,
      time_slot: selectedTimeSlot,
      status: status,
      notes: notes.trim()
    });

    // Reset Form Fields after submit
    setCustomerName('');
    setCustomerPhone('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear('');
    setBookingDate('');
    setSelectedTimeSlot('');
    setNotes('');
    setCustomerSource('انستغرام');
    setCustomerType('new');
    setStatus('جديد');
  };

  // Lists configurations
  const servicesList = [
    "حماية الطلاء PPF",
    "نانو سيراميك",
    "عزل حراري",
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
    "وكالة",
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
    <div className="premium-card p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden">
      {/* Dynamic Gold Gradient outline decoration */}
      <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-[#F4C542] via-[#FFD95A] to-[#D4A017]" />

      <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <FiPlusCircle className="w-5 h-5 text-[#D4A017]" />
          <span>إضافة حجز جديد للعملاء</span>
        </h3>
        <span className="text-[10px] font-black text-[#D4A017] bg-[#F4C542]/10 px-3 py-1 rounded-xl">
          📍 فرع الرياض - حي المروج
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Row 1: Client details */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label htmlFor="form-customer-name" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <FiUser className="w-3.5 h-3.5" />
            <span>اسم العميل الكامل *</span>
          </label>
          <input
            id="form-customer-name"
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="الاسم الكامل للعميل"
            className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="form-customer-phone" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <FiPhone className="w-3.5 h-3.5" />
            <span>رقم جوال العميل *</span>
          </label>
          <input
            id="form-customer-phone"
            type="tel"
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm font-bold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
            dir="ltr"
            style={{ textAlign: 'right' }}
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="form-customer-source" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <FiShare2 className="w-3.5 h-3.5" />
            <span>مصدر العميل *</span>
          </label>
          <select
            id="form-customer-source"
            value={customerSource}
            onChange={(e) => setCustomerSource(e.target.value as CustomerSource)}
            className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
          >
            {sourcesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="form-customer-type" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <FiTag className="w-3.5 h-3.5" />
            <span>نوع العميل *</span>
          </label>
          <select
            id="form-customer-type"
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value as CustomerType)}
            className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
          >
            {typesList.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>

        {/* Row 2: Car details & Status */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label htmlFor="form-vehicle-make" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <LuCar className="w-3.5 h-3.5" />
            <span>نوع السيارة / الشركة المصنعة *</span>
          </label>
          <input
            id="form-vehicle-make"
            type="text"
            required
            value={vehicleMake}
            onChange={(e) => setVehicleMake(e.target.value)}
            placeholder="مثال: Porsche"
            className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="form-vehicle-model" className="text-[11px] font-bold text-gray-400 pr-1">موديل السيارة</label>
          <input
            id="form-vehicle-model"
            type="text"
            required
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="مثال: Taycan"
            className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="form-vehicle-year" className="text-[11px] font-bold text-gray-400 pr-1">سنة الصنع</label>
          <input
            id="form-vehicle-year"
            type="number"
            value={vehicleYear}
            onChange={(e) => setVehicleYear(e.target.value)}
            placeholder="مثال: 2025"
            className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm font-bold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none"
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="form-status" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <FiTag className="w-3.5 h-3.5" />
            <span>الحالة الافتراضية *</span>
          </label>
          <select
            id="form-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
            className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
          >
            {statusesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Row 3: Services & Date/Time appointments */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label htmlFor="form-service-type" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <HiSparkles className="w-3.5 h-3.5" />
            <span>الخدمة المطلوبة *</span>
          </label>
          <select
            id="form-service-type"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
          >
            {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="form-booking-date" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <FiCalendar className="w-3.5 h-3.5" />
            <span>تاريخ الحجز المختار *</span>
          </label>
          <input
            id="form-booking-date"
            type="date"
            required
            min={todayStr}
            value={bookingDate}
            onChange={(e) => {
              setBookingDate(e.target.value);
              setSelectedTimeSlot('');
            }}
            className="w-full px-4 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm font-bold text-gray-700 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all outline-none"
          />
        </div>

        <div className="md:col-span-5 flex flex-col gap-1.5">
          <label htmlFor="form-time-slot" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <FiClock className="w-3.5 h-3.5" />
            <span>الوقت المتاح *</span>
          </label>
          {bookingDate ? (
            <select
              id="form-time-slot"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full px-3 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-bold text-gray-750 focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all cursor-pointer outline-none"
            >
              <option value="">-- اختر وقت الحجز المتاح --</option>
              {slots.map((slot) => {
                const booked = isSlotBooked(bookingDate, slot.key);
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
            <div className="h-11 bg-neutral-50 border border-neutral-200/50 rounded-xl flex items-center px-4 text-xs text-gray-400 font-bold">
              يرجى اختيار تاريخ الزيارة أولاً لإدراج الساعات المتاحة
            </div>
          )}
        </div>

        {/* Row 4: Customer Notes History */}
        <div className="md:col-span-12 flex flex-col gap-1.5">
          <label htmlFor="form-notes" className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
            <FiFileText className="w-3.5 h-3.5" />
            <span>ملاحظات العميل التاريخية (سجل المتابعة)</span>
          </label>
          <textarea
            id="form-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="مثال: تم التواصل لتأكيد الموعد.. مهتم بباقة عزل وحماية طلاء كاملة..."
            className="w-full p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm font-semibold focus:border-[#F4C542] focus:bg-white focus:ring-4 focus:ring-[#F4C542]/10 transition-all text-gray-800 outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-12 flex justify-end mt-2">
          <button
            type="submit"
            className="btn-primary-luxury px-8 py-3.5 text-sm w-full md:w-auto"
          >
            <FiPlusCircle className="w-5 h-5" />
            <span>حفظ وتأكيد حجز العميل</span>
          </button>
        </div>
      </form>
    </div>
  );
});

export default BookingForm;

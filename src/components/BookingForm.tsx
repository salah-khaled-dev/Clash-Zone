import React, { useState, useMemo } from 'react';
import { 
  FiUser, 
  FiPhone, 
  FiClock, 
  FiCalendar, 
  FiTag, 
  FiPlusCircle,
  FiFileText,
  FiUsers,
  FiMinus,
  FiPlus,
  FiMapPin
} from 'react-icons/fi';
import { generateSlots, toPostgresTime } from '../utils/timeSlots';
import type { BookingDuration } from '../utils/timeSlots';
import { useToast } from './useToast';
import type { Booking, BookingCategory, BookingDbStatus } from '../types/booking';
import { ClashZone_CATEGORIES, STATUS_ARABIC_MAP } from '../types/booking';

interface BookingFormProps {
  bookings: Booking[];
  onSubmitBooking: (bookingData: {
    customer_name: string;
    phone: string;
    number_of_people: number;
    category: BookingCategory;
    booking_date: string;
    booking_time: string;
    duration_minutes: BookingDuration;
    status: BookingDbStatus;
    notes: string;
  }) => void;
}

export const BookingForm = React.memo<BookingFormProps>(({ onSubmitBooking }) => {
  const { showToast } = useToast();

  // Form Fields State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2);
  const [category, setCategory] = useState<BookingCategory>('عميل جديد');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [status, setStatus] = useState<BookingDbStatus>('pending');
  const [notes, setNotes] = useState('');

  // Duration & Slots state
  const [duration, setDuration] = useState<BookingDuration>(30);
  const slots = useMemo(() => generateSlots(duration), [duration]);

  const handleIncrementPeople = () => {
    setNumberOfPeople((prev) => prev + 1);
  };

  const handleDecrementPeople = () => {
    setNumberOfPeople((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || customerName.trim().length < 3) {
      showToast("يرجى كتابة الاسم الكامل (٣ أحرف على الأقل).", "warning");
      return;
    }
    
    const phoneRegex = /^(05\d{8}|01\d{9}|011\d{8}|\+?\d{9,15})$/;
    if (!phoneRegex.test(phone.trim().replace(/[\s-]/g, ''))) {
      showToast("رقم الجوال غير صحيح! يرجى إدخال رقم جوال صالح.", "warning");
      return;
    }

    const count = Math.floor(Number(numberOfPeople));
    if (isNaN(count) || count < 1) {
      showToast("عدد الأفراد يجب أن يكون رقماً صحيحاً وموجباً (١ على الأقل).", "warning");
      return;
    }

    if (!bookingDate || !selectedTimeSlot) {
      showToast("يرجى تحديد تاريخ ووقت الحجز.", "warning");
      return;
    }

    onSubmitBooking({
      customer_name: customerName.trim(),
      phone: phone.trim(),
      number_of_people: count,
      category: category,
      booking_date: bookingDate,
      booking_time: toPostgresTime(selectedTimeSlot),
      duration_minutes: duration,
      status: status,
      notes: notes.trim()
    });

    // Reset Form Fields after submit
    setCustomerName('');
    setPhone('');
    setNumberOfPeople(2);
    setCategory('عميل جديد');
    setBookingDate('');
    setSelectedTimeSlot('');
    setNotes('');
    setStatus('pending');
  };

  const statusesList: { value: BookingDbStatus; label: string }[] = [
    { value: 'pending', label: STATUS_ARABIC_MAP.pending },
    { value: 'confirmed', label: STATUS_ARABIC_MAP.confirmed },
  ];

  return (
    <div className="bg-white p-6 lg:p-7 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <FiPlusCircle className="w-5 h-5 text-red-600" />
          <span>تسجيل حجز جديد</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg flex items-center gap-1.5">
          <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>ميدان CLASH ZONE الرئيسي</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Row 1: Client Name, Phone, People Count, Category */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label htmlFor="form-customer-name" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiUser className="w-3.5 h-3.5 text-slate-400" />
            <span>اسم العميل الكامل *</span>
          </label>
          <input
            id="form-customer-name"
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder=" مثال : حسام مهدي "
            className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="form-phone" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiPhone className="w-3.5 h-3.5 text-slate-400" />
            <span>رقم جوال العميل *</span>
          </label>
          <input
            id="form-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
            dir="ltr"
            style={{ textAlign: 'right' }}
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="form-number-of-people" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiUsers className="w-3.5 h-3.5 text-slate-400" />
            <span>عدد الأفراد *</span>
          </label>
          <div className="flex items-center h-10 bg-slate-50 border border-slate-200 rounded-xl px-1">
            <button
              type="button"
              onClick={handleDecrementPeople}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiMinus className="w-3 h-3" />
            </button>
            <input
              id="form-number-of-people"
              type="number"
              min="1"
              required
              value={numberOfPeople}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setNumberOfPeople(isNaN(val) ? 1 : Math.max(1, val));
              }}
              className="w-full text-center bg-transparent text-sm font-black text-slate-900 outline-none"
            />
            <button
              type="button"
              onClick={handleIncrementPeople}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiPlus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="form-category" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiTag className="w-3.5 h-3.5 text-slate-400" />
            <span>فئة الحجز *</span>
          </label>
          <select
            id="form-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as BookingCategory)}
            className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none"
          >
            {ClashZone_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Date, Duration, Time Slot, Status */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="form-booking-date" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
            <span>تاريخ الحجز المختار *</span>
          </label>
          <input
            id="form-booking-date"
            type="date"
            required
            value={bookingDate}
            onChange={(e) => {
              setBookingDate(e.target.value);
              setSelectedTimeSlot('');
            }}
            className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 text-slate-400" />
            <span>مدة الحجز *</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 h-10">
            <button
              type="button"
              onClick={() => {
                setDuration(30);
                setSelectedTimeSlot('');
              }}
              className={`rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                duration === 30
                  ? 'bg-red-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              ٣٠ دقيقة
            </button>
            <button
              type="button"
              onClick={() => {
                setDuration(60);
                setSelectedTimeSlot('');
              }}
              className={`rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                duration === 60
                  ? 'bg-red-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              ساعة كاملة
            </button>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label htmlFor="form-booking-time" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 text-slate-400" />
            <span>وقت الحجز المتاح *</span>
          </label>
          {bookingDate ? (
            <select
              id="form-booking-time"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none"
            >
              <option value="">-- اختر وقت الحجز المتاح --</option>
              {slots.map((slot) => (
                <option key={slot.key} value={slot.key}>
                  {slot.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 text-xs text-slate-400 font-medium">
              يرجى اختيار تاريخ الزيارة أولاً لعرض الأوقات المتاحة
            </div>
          )}
        </div>

        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="form-status" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiTag className="w-3.5 h-3.5 text-slate-400" />
            <span>الحالة الأولية *</span>
          </label>
          <select
            id="form-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingDbStatus)}
            className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none"
          >
            {statusesList.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 3: Notes */}
        <div className="md:col-span-12 flex flex-col gap-1.5">
          <label htmlFor="form-notes" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
            <FiFileText className="w-3.5 h-3.5 text-slate-400" />
            <span>ملاحظات إضافية (اختياري)</span>
          </label>
          <textarea
            id="form-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="مثال: حجز احتفال عيد ميلاد، يطلبون تنظيم منافسة خاصة بين فريقين..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-12 flex justify-end mt-1">
          <button
            type="submit"
            className="btn-primary-luxury px-6 py-2.5 text-xs font-bold"
          >
            <FiPlusCircle className="w-4 h-4" />
            <span>تأكيد وتسجيل الحجز</span>
          </button>
        </div>
      </form>
    </div>
  );
});

export default BookingForm;

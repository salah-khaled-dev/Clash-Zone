import React, { useState, useMemo } from 'react';
import { FiX, FiCalendar, FiClock, FiUser, FiPhone, FiTag, FiFileText, FiUsers } from 'react-icons/fi';
import type { Booking, BookingCategory, BookingDbStatus } from '../types/booking';
import { ClashZone_CATEGORIES, STATUS_ARABIC_MAP } from '../types/booking';
import { generateSlots, toPostgresTime } from '../utils/timeSlots';
import type { BookingDuration } from '../utils/timeSlots';
import { useToast } from './useToast';

interface EditBookingModalProps {
  booking: Booking;
  bookings: Booking[];
  onClose: () => void;
  onSave: (bookingId: string, updatedData: Partial<Booking>) => void;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  booking,
  onClose,
  onSave
}) => {
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState(booking.customer_name);
  const [phone, setPhone] = useState(booking.phone);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(booking.number_of_people || 1);
  const [category, setCategory] = useState<BookingCategory>(
    (booking.category as BookingCategory) || 'عميل جديد'
  );
  const [date, setDate] = useState(booking.booking_date);
  const [selectedSlot, setSelectedSlot] = useState(() => toPostgresTime(booking.booking_time));
  const [status, setStatus] = useState<BookingDbStatus>(booking.status || 'pending');
  const [notes, setNotes] = useState(booking.notes || '');

  // Duration & Slots state
  const [duration, setDuration] = useState<BookingDuration>(() => {
    return booking.duration_minutes === 60 ? 60 : 30;
  });
  const slots = useMemo(() => generateSlots(duration), [duration]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || customerName.trim().length < 3) {
      showToast("يرجى كتابة الاسم الكامل للعميل (٣ أحرف على الأقل).", "warning");
      return;
    }
    
    // Support Saudi (05xxxxxxxx), Egyptian (01xxxxxxxxx / 011xxxxxxxx), and general standard mobile numbers
    const phoneRegex = /^(05\d{8}|01\d{9}|011\d{8}|\+?\d{9,15})$/;
    if (!phoneRegex.test(phone.trim().replace(/[\s-]/g, ''))) {
      showToast("رقم الجوال غير صحيح! يرجى إدخال رقم هاتف صالح.", "warning");
      return;
    }

    const count = Math.floor(Number(numberOfPeople));
    if (isNaN(count) || count < 1) {
      showToast("عدد الأفراد يجب أن يكون رقماً موجباً (١ على الأقل).", "warning");
      return;
    }

    if (!date || !selectedSlot) {
      showToast("يرجى اختيار موعد الحجز.", "warning");
      return;
    }

    const updatedData: Partial<Booking> = {
      customer_name: customerName.trim(),
      phone: phone.trim(),
      number_of_people: count,
      category: category,
      booking_date: date,
      booking_time: toPostgresTime(selectedSlot),
      duration_minutes: duration,
      status: status,
      notes: notes.trim() || null
    };

    onSave(booking.id, updatedData);
  };

  const statusesList: { value: BookingDbStatus; label: string }[] = [
    { value: 'pending', label: STATUS_ARABIC_MAP.pending },
    { value: 'confirmed', label: STATUS_ARABIC_MAP.confirmed },
    { value: 'completed', label: STATUS_ARABIC_MAP.completed },
    { value: 'cancelled', label: STATUS_ARABIC_MAP.cancelled },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-booking-title"
        className="bg-white rounded-2xl p-6 lg:p-7 w-full max-w-xl shadow-xl border border-slate-200 flex flex-col text-right relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <h3 id="edit-booking-title" className="text-lg font-black text-slate-900 mb-1 pr-1">
          تعديل حجز الفعالية
        </h3>
        <p className="text-xs text-slate-500 mb-5 pr-1">
          تحديث تفاصيل الحجز وعدد الأفراد في النظام
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-customer-name" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5 text-slate-400" />
                <span>اسم العميل الكامل *</span>
              </label>
              <input
                id="edit-customer-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="edit-phone" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
                <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                <span>رقم الجوال *</span>
              </label>
              <input
                id="edit-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
            </div>
          </div>

          {/* Row 2: People Count & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-number-of-people" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
                <FiUsers className="w-3.5 h-3.5 text-slate-400" />
                <span>عدد الأفراد المشاركين *</span>
              </label>
              <input
                id="edit-number-of-people"
                type="number"
                min="1"
                required
                value={numberOfPeople}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setNumberOfPeople(isNaN(val) ? 1 : Math.max(1, val));
                }}
                className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="edit-category" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
                <FiTag className="w-3.5 h-3.5 text-slate-400" />
                <span>فئة الحجز *</span>
              </label>
              <select
                id="edit-category"
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
          </div>

          {/* Row 3: Date & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-booking-date" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                <span>تاريخ الحجز *</span>
              </label>
              <input
                id="edit-booking-date"
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-slate-400" />
                <span>مدة الحجز *</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 h-10">
                <button
                  type="button"
                  onClick={() => {
                    setDuration(30);
                    const newSlots = generateSlots(30);
                    if (!newSlots.some(s => s.startTime24 === selectedSlot)) {
                      setSelectedSlot('');
                    }
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
                    const newSlots = generateSlots(60);
                    if (!newSlots.some(s => s.startTime24 === selectedSlot)) {
                      setSelectedSlot('');
                    }
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
          </div>

          {/* Row 4: Time Slot & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-booking-time" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-slate-400" />
                <span>وقت الحجز المتاح *</span>
              </label>
              {date ? (
                <select
                  id="edit-booking-time"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none"
                >
                  <option value="">-- اختر الوقت --</option>
                  {slots.map((slot) => (
                    <option key={slot.key} value={slot.key}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 text-xs text-slate-400 font-medium">
                  حدد التاريخ أولاً
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="edit-status" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
                <FiTag className="w-3.5 h-3.5 text-slate-400" />
                <span>حالة الحجز *</span>
              </label>
              <select
                id="edit-status"
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
          </div>

          {/* Row 4: Notes */}
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-notes" className="text-[11px] font-bold text-slate-600 pr-1 flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5 text-slate-400" />
              <span>ملاحظات الحجز</span>
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="أي ملاحظات خاصة بالفعالية..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 justify-end mt-3 pt-3.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              تراجع
            </button>
            <button
              type="submit"
              className="btn-primary-luxury px-5 py-2 text-xs font-bold"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditBookingModal);

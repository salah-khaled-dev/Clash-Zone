import React from 'react';
import { FiClock, FiCalendar, FiUsers, FiTag, FiCheck } from 'react-icons/fi';
import type { Booking } from '../types/booking';
import { Logo } from './Logo';
import {
  formatArabicDate,
  formatArabicTime,
  formatPeopleCount
} from '../utils/bookingFormatters';
import { getCategoryIcon } from '../utils/translations';

interface SuccessScreenProps {
  booking: Booking;
  onViewBooking: () => void;
  onBookAnother: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  booking,
  onViewBooking,
  onBookAnother
}) => {
  const displayDate = formatArabicDate(booking.booking_date);
  const displayTime = formatArabicTime(booking.booking_time, booking.duration_minutes);
  const peopleText = formatPeopleCount(booking.number_of_people);
  const categoryIcon = getCategoryIcon(booking.category);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        aria-describedby="success-description"
        className="bg-white rounded-2xl p-6 lg:p-7 w-full max-w-md shadow-xl border border-slate-200 flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Brand Logo */}
        <div className="mb-4">
          <Logo size="sm" variant="horizontal" />
        </div>

        {/* Clean Success Circle */}
        <div className="w-14 h-14 mb-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
          <FiCheck className="w-7 h-7 stroke-[2.5]" />
        </div>

        {/* Title */}
        <h3 id="success-title" className="text-lg font-black text-slate-900 mb-1 leading-snug">
          تم تأكيد وتسجيل الحجز بنجاح
        </h3>
        <p id="success-description" className="text-xs text-slate-500 leading-relaxed mb-5 max-w-xs">
          تم حفظ حجز الفعالية في قاعدة البيانات، وجاهز للمتابعة والتأكيد.
        </p>

        {/* Voucher Card */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-5 text-right">
          <div className="text-[10px] font-bold text-slate-500 border-b border-slate-200/80 pb-2 flex justify-between items-center">
            <span>ملخص بطاقة الحجز</span>
            <span className="text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
              مؤكد بالنظام
            </span>
          </div>

          {/* Customer */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500">
              <FiUsers className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold leading-none">العميل والمشاركين</span>
              <span className="text-xs font-bold text-slate-900 mt-1">
                {booking.customer_name} ({peopleText})
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500">
              <FiTag className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold leading-none">فئة الحجز</span>
              <span className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
                <span>{categoryIcon}</span>
                <span>{booking.category}</span>
              </span>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-2 border-t border-slate-200/80 pt-2.5">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold leading-none">التاريخ</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5">{displayDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold leading-none">الموعد المحدد</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5">{displayTime}</span>
                {booking.duration_minutes && (
                  <span className="text-[9px] text-slate-500 font-medium">
                    المدة: {booking.duration_minutes === 60 ? 'ساعة كاملة' : '٣٠ دقيقة'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={onViewBooking}
            className="btn-primary-luxury w-full py-2.5 text-xs font-bold"
          >
            <span>عرض الحجز في لوحة التحكم</span>
          </button>
          
          <button
            type="button"
            onClick={onBookAnother}
            className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            تسجيل حجز آخر
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SuccessScreen);

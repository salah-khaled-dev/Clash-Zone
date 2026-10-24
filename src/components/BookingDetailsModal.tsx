import React from 'react';
import { FiX, FiUser, FiPhone, FiClock, FiCalendar, FiTag, FiFileText, FiUsers } from 'react-icons/fi';
import type { Booking } from '../types/booking';
import { StatusBadge } from './StatusBadge';
import {
  formatArabicDate,
  formatArabicTime,
  formatPeopleCount,
  formatCreationDateTime
} from '../utils/bookingFormatters';
import { getCategoryIcon } from '../utils/translations';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const displayDate = formatArabicDate(booking.booking_date);
  const displayTime = formatArabicTime(booking.booking_time);
  const peopleText = formatPeopleCount(booking.number_of_people);
  const categoryIcon = getCategoryIcon(booking.category);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
        className="bg-white rounded-2xl p-6 lg:p-7 w-full max-w-lg shadow-xl border border-slate-200 flex flex-col text-right relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
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
        <div className="flex items-center gap-2 mb-5 pr-1">
          <h3 id="booking-details-title" className="text-lg font-black text-slate-900">
            تفاصيل حجز الفعالية
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {/* Row 1: Customer Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <FiUser className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-bold leading-none">اسم العميل</span>
                <span className="text-sm font-bold text-slate-900 mt-1 truncate">{booking.customer_name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <FiPhone className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-bold leading-none">رقم الجوال</span>
                <span className="text-sm font-bold text-slate-900 mt-1" dir="ltr">{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Row 2: People Count & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <FiUsers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold leading-none">عدد المشاركين</span>
                <span className="text-sm font-black text-slate-900 mt-1">{peopleText}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <FiTag className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold leading-none">فئة الحجز</span>
                <span className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                  <span>{categoryIcon}</span>
                  <span>{booking.category}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <FiCalendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold leading-none">تاريخ الحجز</span>
                <span className="text-xs font-bold text-slate-800 mt-1">{displayDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <FiClock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold leading-none">الموعد المحدد</span>
                <span className="text-xs font-bold text-slate-800 mt-1">{displayTime}</span>
              </div>
            </div>
          </div>

          {/* Row 4: Status */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">حالة الحجز الحالية</span>
            <StatusBadge status={booking.status} />
          </div>

          {/* Row 5: Notes */}
          <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5 text-slate-400" />
              <span>ملاحظات إضافية</span>
            </span>
            <p className="text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed mt-1">
              {booking.notes || 'لا توجد ملاحظات مسجلة لهذا الحجز.'}
            </p>
          </div>

          {/* Row 6: Creator Tracking Metadata */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold">تم الإنشاء بواسطة</span>
              <span className="font-bold text-slate-800 mt-0.5">{booking.creator_name || 'غير مسجل'}</span>
            </div>
            {booking.created_at && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-bold">تاريخ وتوقيت التسجيل</span>
                <span className="font-semibold text-slate-600 mt-0.5" dir="ltr">
                  {formatCreationDateTime(booking.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          type="button"
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors mt-5 outline-none cursor-pointer"
        >
          إغلاق النافذة
        </button>
      </div>
    </div>
  );
};

export default React.memo(BookingDetailsModal);

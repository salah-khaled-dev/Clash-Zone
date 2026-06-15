import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUser, FiPhone, FiMapPin, FiClock, FiCalendar, FiShare2, FiTag, FiFileText } from 'react-icons/fi';
import { LuCar } from 'react-icons/lu';
import { HiSparkles } from 'react-icons/hi2';
import type { Booking } from '../types/booking';
import { StatusBadge } from './StatusBadge';
import {
  formatArabicDate,
  formatArabicTime,
  formatVehicleName,
  formatServiceName,
  formatCustomerType
} from '../utils/bookingFormatters';
import { translateBranch } from '../utils/translations';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const vehicleStr = `${booking.vehicle_make} ${booking.vehicle_model}${booking.vehicle_year ? ` ${booking.vehicle_year}` : ''}`;
  const displayCar = formatVehicleName(vehicleStr);
  const displayService = formatServiceName(booking.service_type);
  const displayBranch = translateBranch(booking.branch_name);
  const displayDate = formatArabicDate(booking.booking_date);
  const displayTime = formatArabicTime(booking.time_slot);
  const displayClientType = formatCustomerType(booking.customer_type);

  // Format dates helpers
  const formatDateTime = (isoStr: string | null) => {
    if (!isoStr) return 'لم يحدد بعد';
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[32px] p-6 lg:p-8 w-full max-w-lg shadow-2xl border border-neutral-100 flex flex-col text-right relative max-h-[90vh] overflow-y-auto"
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
        <h3 id="booking-details-title" className="text-xl font-extrabold text-gray-900 mb-5 pr-1">بطاقة تفاصيل عميل CRM</h3>

        <div className="flex flex-col gap-4">
          {/* Customer Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <FiUser className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">اسم العميل</span>
                <span className="text-sm font-extrabold text-gray-800 mt-1.5">{booking.customer_name}</span>
              </div>
            </div>

            {/* Customer Phone */}
            <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <FiPhone className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">رقم الجوال</span>
                <span className="text-sm font-bold text-gray-800 mt-1.5" dir="ltr">{booking.customer_phone}</span>
              </div>
            </div>
          </div>

          {/* CRM Indicators: Source & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <FiShare2 className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">مصدر الاستقطاب</span>
                <span className="text-sm font-extrabold text-[#D4A017] mt-1.5">{booking.customer_source || 'أخرى'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <FiTag className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">فئة العميل</span>
                <span className="text-sm font-extrabold text-blue-600 mt-1.5">{displayClientType}</span>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
            <LuCar className="w-5 h-5 text-[#D4A017]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold leading-none">تفاصيل المركبة</span>
              <span className="text-sm font-extrabold text-gray-800 mt-1.5">{displayCar}</span>
            </div>
          </div>

          {/* Service & Riyadh Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <HiSparkles className="w-5 h-5 text-[#D4A017]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">الخدمة</span>
                <span className="text-xs font-black text-gray-800 mt-1.5">{displayService}</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <FiMapPin className="w-5 h-5 text-[#D4A017]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">الفرع المعتمد</span>
                <span className="text-xs font-extrabold text-gray-800 mt-1.5">{displayBranch}</span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <FiCalendar className="w-5 h-5 text-[#D4A017]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">التاريخ</span>
                <span className="text-xs font-extrabold text-gray-800 mt-1.5">{displayDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <FiClock className="w-5 h-5 text-[#D4A017]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none">الموعد المحدد</span>
                <span className="text-xs font-extrabold text-amber-800 mt-1.5">{displayTime}</span>
              </div>
            </div>
          </div>

          {/* Followup Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
              <span className="text-[9px] text-gray-400 font-bold block">تاريخ آخر تواصل</span>
              <span className="text-xs font-bold text-gray-700 mt-1 block">{formatDateTime(booking.last_contact_date)}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
              <span className="text-[9px] text-gray-400 font-bold block text-amber-800">تاريخ المتابعة القادمة</span>
              <span className="text-xs font-bold text-gray-700 mt-1 block">{formatDateTime(booking.next_followup_date)}</span>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="flex flex-col gap-1.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
              <FiFileText className="w-3.5 h-3.5" />
              <span>ملاحظات المتابعة (سجل المبيعات)</span>
            </span>
            <p className="text-xs font-semibold text-gray-850 whitespace-pre-wrap leading-relaxed mt-1">
              {booking.notes || 'لا يوجد ملاحظات مسجلة لهذا العميل حالياً.'}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 mt-1">
            <span className="text-xs font-bold text-gray-500">حالة العميل الحالية</span>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          type="button"
          className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-gray-700 rounded-xl font-bold text-sm transition-colors mt-6 outline-none"
        >
          إغلاق النافذة
        </button>
      </motion.div>
    </div>
  );
};

export default React.memo(BookingDetailsModal);

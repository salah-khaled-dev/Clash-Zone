import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { FiClock, FiMapPin, FiCalendar } from 'react-icons/fi';
import { LuCar } from 'react-icons/lu';
import { HiSparkles } from 'react-icons/hi2';
import type { Booking } from '../types/booking';
import { Logo } from './Logo';
import {
  formatArabicDate,
  formatArabicTime,
  formatVehicleName,
  formatServiceName
} from '../utils/bookingFormatters';
import { translateBranch } from '../utils/translations';

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
  const vehicleStr = `${booking.vehicle_make} ${booking.vehicle_model}${booking.vehicle_year ? ` ${booking.vehicle_year}` : ''}`;
  const displayCar = formatVehicleName(vehicleStr);
  const displayService = formatServiceName(booking.service_type);
  const displayBranch = translateBranch(booking.branch_name);
  const displayDate = formatArabicDate(booking.booking_date);
  const displayTime = formatArabicTime(booking.time_slot);

  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 0.35, type: "spring", stiffness: 100, damping: 20 },
        opacity: { delay: 0.35, duration: 0.01 }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        aria-describedby="success-description"
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        className="bg-white rounded-[32px] p-6 lg:p-8 w-full max-w-md shadow-2xl border border-neutral-100 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft Ambient Gold Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#F4C542]/5 rounded-full filter blur-xl pointer-events-none" />

        {/* Small Horizontal Brand Logo */}
        <div className="mb-4 opacity-75">
          <Logo size="sm" variant="icon-only" />
        </div>

        {/* Premium Gold Ring with SVG checkmark draw animation */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center flex-shrink-0">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
            className="absolute inset-0 rounded-full border-4 border-[#F4C542] shadow-lg shadow-[#F4C542]/10 bg-[#F4C542]/5"
          />
          
          <svg
            className="w-10 h-10 text-[#D4A017] relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M20 6L9 17L4 12"
              variants={draw}
              initial="hidden"
              animate="visible"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 id="success-title" className="text-xl lg:text-2xl font-black text-gray-900 mb-2 leading-snug">
          تم تأكيد الحجز الفاخر
        </h3>
        <p id="success-description" className="text-xs lg:text-sm text-gray-500 leading-relaxed mb-6 max-w-xs font-semibold">
          تم حفظ موعدك بأمان في قاعدة البيانات السحابية. سيتواصل معك فريق الدعم قريباً.
        </p>

        {/* Dynamic Receipt Voucher Card */}
        <div className="w-full bg-neutral-50 border border-neutral-200/50 rounded-2xl p-5 flex flex-col gap-4 mb-6 text-right">
          <div className="text-[10px] font-bold text-gray-400 border-b border-neutral-200/40 pb-2.5 flex justify-between items-center">
            <span>تفاصيل بطاقة الحجز</span>
            <span className="text-[#D4A017] bg-[#F4C542]/10 px-2.5 py-0.5 rounded font-black text-[10px]">مؤكد سحابياً</span>
          </div>

          {/* Service */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white border border-neutral-100 text-[#D4A017]">
              <HiSparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold leading-none">الخدمة</span>
              <span className="text-xs font-extrabold text-gray-800 mt-1">{displayService}</span>
            </div>
          </div>

          {/* Car */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white border border-neutral-100 text-[#D4A017]">
              <LuCar className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold leading-none">السيارة</span>
              <span className="text-xs font-extrabold text-gray-800 mt-1">{displayCar}</span>
            </div>
          </div>

          {/* Branch */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white border border-neutral-100 text-gray-400">
              <FiMapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold leading-none">الفرع</span>
              <span className="text-xs font-extrabold text-gray-800 mt-1">{displayBranch}</span>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-2 border-t border-neutral-200/40 pt-3.5">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#D4A017]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold leading-none">التاريخ</span>
                <span className="text-xs font-extrabold text-gray-700 mt-1">{displayDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-[#D4A017]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold leading-none">الموعد</span>
                <span className="text-xs font-extrabold text-[#D4A017] mt-1">{displayTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            type="button"
            onClick={onViewBooking}
            className="w-full py-3.5 bg-gradient-to-r from-[#F4C542] to-[#FFD95A] hover:from-[#E8B923] hover:to-[#F4C542] text-gray-900 rounded-xl font-bold text-sm shadow-md shadow-[#F4C542]/10 transition-all flex items-center justify-center gap-2"
          >
            <span>عرض حجوزاتي في Dashboard</span>
          </button>
          
          <button
            type="button"
            onClick={onBookAnother}
            className="w-full py-3 bg-white hover:bg-neutral-50 text-gray-600 border border-neutral-200 rounded-xl font-bold text-sm transition-colors"
          >
            حجز خدمة أخرى
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(SuccessScreen);

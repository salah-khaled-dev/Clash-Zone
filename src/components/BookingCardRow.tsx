import React from 'react';
import { 
  FiUser, 
  FiMapPin, 
  FiClock, 
  FiCalendar, 
  FiPhone, 
  FiCopy, 
  FiMessageCircle,
  FiEdit3,
  FiEye,
  FiTrash2
} from 'react-icons/fi';
import { LuCar } from 'react-icons/lu';
import type { Booking } from '../types/booking';
import { StatusBadge } from './StatusBadge';
import { ActionMenu } from './ActionMenu';
import { useToast } from './useToast';
import {
  formatArabicDate,
  formatArabicTime,
  formatVehicleName,
  formatServiceName,
  formatCustomerType
} from '../utils/bookingFormatters';
import { translateBranch } from '../utils/translations';

interface BookingCardRowProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onEditTime: (booking: Booking) => void;
  onConfirm: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete?: (bookingId: string) => void; // Added for CRM direct deletes
}

export const BookingCardRow = React.memo<BookingCardRowProps>(({
  booking,
  onViewDetails,
  onEditTime,
  onConfirm,
  onCancel,
  onDelete
}) => {
  const { showToast } = useToast();

  const vehicleStr = `${booking.vehicle_make} ${booking.vehicle_model}${booking.vehicle_year ? ` ${booking.vehicle_year}` : ''}`;
  const displayCar = formatVehicleName(vehicleStr);
  const displayService = formatServiceName(booking.service_type);
  const displayBranch = translateBranch(booking.branch_name);
  const displayDate = formatArabicDate(booking.booking_date);
  const displayTime = formatArabicTime(booking.time_slot);
  const displayClientType = formatCustomerType(booking.customer_type);

  // Marketing source icon mapping
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'انستغرام': return '📱';
      case 'تيك توك': return '🎵';
      case 'سناب شات': return '👻';
      case 'واتساب': return '💬';
      case 'اتصال هاتفي': return '📞';
      case 'زيارة مباشرة': return '🚶';
      case 'صديق / توصية': return '🤝';
      case 'جوجل': return '🔍';
      case 'إعلان ممول': return '📣';
      case 'وكالة': return '🏢';
      default: return '🌐';
    }
  };

  // Client Type badges styling
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'returning': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'vip': return 'bg-amber-50 text-amber-700 border-amber-200/50 shadow-sm ring-1 ring-amber-400/10';
      case 'referred': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      default: return 'bg-neutral-50 text-neutral-500 border-neutral-100';
    }
  };

  // Marketing source badge styling
  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case 'وكالة':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-neutral-50 text-gray-700 border-neutral-150';
    }
  };

  // Generate prefilled WhatsApp URL
  const getWhatsAppLink = () => {
    // Standard WhatsApp template in Arabic
    const rawMessage = `السلام عليكم،\n\nمعك Infinity Bright.\n\nنود تأكيد موعدكم بتاريخ ${displayDate}\nالساعة ${displayTime}.\n\nشكراً لكم.`;
    const encodedMessage = encodeURIComponent(rawMessage);
    
    // Clean phone number from non-numeric (e.g. spaces, leading zero) and apply Saudi country code 966
    let cleanPhone = booking.customer_phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('5')) {
      cleanPhone = '966' + cleanPhone;
    }
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  // Copy Phone Number Action
  const handleCopyPhone = () => {
    navigator.clipboard.writeText(booking.customer_phone);
    showToast('تم نسخ رقم الجوال بنجاح', 'success');
  };

  return (
    <div
      className="w-full box-border bg-white border border-neutral-100 hover:border-[#F4C542]/50 rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col lg:grid lg:grid-cols-[260px_160px_160px_140px_130px_150px_auto] lg:items-center gap-4 relative overflow-hidden card-hover-effect animate-fade-in-up"
    >
      {/* VIP Left border accent indicator */}
      {booking.customer_type === 'vip' && (
        <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-[#F4C542]" />
      )}

      {/* Column 1: Client & Car details */}
      <div className="flex items-center gap-3 w-full min-w-0" dir="rtl">
        <div className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-gray-500 flex-shrink-0">
          <FiUser className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-base font-extrabold text-gray-900 tracking-tight leading-normal truncate flex items-center gap-1.5">
            {booking.customer_name}
            {booking.customer_type === 'vip' && <span className="text-xs" title="عميل VIP">👑</span>}
          </span>
          <span className="text-[13px] font-semibold text-gray-400 flex items-center gap-1 mt-2 truncate">
            <LuCar className="w-3.5 h-3.5 text-[#D4A017] flex-shrink-0" />
            <span className="truncate">{displayCar}</span>
          </span>
        </div>
      </div>

      {/* Column 2: Badges (Source & Client Type) */}
      <div className="flex flex-row lg:flex-col gap-2 min-w-0 items-center lg:items-start">
        {/* Source badge */}
        <span className={`text-xs font-bold border px-2.5 py-1 rounded-xl whitespace-nowrap ${getSourceBadgeClass(booking.customer_source)}`}>
          {getSourceIcon(booking.customer_source)} {booking.customer_source}
        </span>
        {/* Client Type badge */}
        <span className={`text-[11px] font-black border px-2 py-0.5 rounded-lg whitespace-nowrap ${getTypeBadgeClass(booking.customer_type)}`}>
          {displayClientType}
        </span>
      </div>

      {/* Column 3: Service */}
      <div className="flex items-center min-w-0">
        <span className="text-[13px] font-black text-gray-900 bg-neutral-50 border border-neutral-150 px-3 py-1.5 rounded-xl truncate whitespace-nowrap">
          {displayService}
        </span>
      </div>

      {/* Column 4: Date & Time details */}
      <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-1.5 min-w-0">
        <span className="text-[13px] font-extrabold text-gray-600 flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5 text-[#D4A017] flex-shrink-0" />
          <span className="leading-none">{displayDate}</span>
        </span>
        <span className="text-[13px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200/25 px-2 py-0.5 rounded-lg flex items-center gap-1">
          <FiClock className="w-3.5 h-3.5 text-[#D4A017] flex-shrink-0" />
          <span className="leading-none">{displayTime}</span>
        </span>
      </div>

      {/* Column 5: Static Branch Details */}
      <div className="flex items-center min-w-0">
        <span className="text-[13px] font-semibold text-gray-400 flex items-center gap-1 truncate">
          <FiMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{displayBranch}</span>
        </span>
      </div>

      {/* Column 6: Status Badge */}
      <div className="flex items-center lg:justify-center">
        <StatusBadge status={booking.status} />
      </div>

      {/* Column 7: CRM Quick Actions & Dropdown menu */}
      <div className="flex items-center justify-between lg:justify-end gap-2 pt-3.5 lg:pt-0 border-t border-neutral-50 lg:border-none w-full">
        {/* Quick messaging/call actions */}
        <div className="flex items-center gap-1.5">
          {/* Direct call */}
          <a
            href={`tel:${booking.customer_phone}`}
            className="p-2 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="اتصال هاتفي"
          >
            <FiPhone className="w-4 h-4" />
          </a>

          {/* Direct WhatsApp with prefilled message */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="مراسلة واتساب"
          >
            <FiMessageCircle className="w-4 h-4" />
          </a>

          {/* Copy phone number */}
          <button
            onClick={handleCopyPhone}
            className="p-2 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-gray-500 rounded-xl transition-all shadow-sm flex items-center justify-center outline-none cursor-pointer"
            title="نسخ رقم الجوال"
          >
            <FiCopy className="w-4 h-4" />
          </button>
        </div>

        {/* Extended drop menu for Edit/Delete/View details */}
        <div className="flex items-center gap-1">
          {/* Quick Edit */}
          <button
            onClick={() => onEditTime(booking)}
            className="p-2 hover:bg-neutral-50 text-gray-500 hover:text-gray-800 rounded-xl transition-colors outline-none cursor-pointer hidden lg:flex"
            title="تعديل الحجز"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>

          {/* Quick View */}
          <button
            onClick={() => onViewDetails(booking)}
            className="p-2 hover:bg-neutral-50 text-gray-500 hover:text-gray-800 rounded-xl transition-colors outline-none cursor-pointer hidden lg:flex"
            title="عرض التفاصيل"
          >
            <FiEye className="w-4 h-4" />
          </button>

          {/* Quick Delete */}
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من رغبتك في حذف حجز هذا العميل نهائياً من قاعدة البيانات؟')) {
                  onDelete(booking.id);
                }
              }}
              className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-colors outline-none cursor-pointer hidden lg:flex"
              title="حذف الحجز"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}

          {/* Dropdown Menu for smaller widths / custom state changes */}
          <div className="z-20">
            <ActionMenu
              onViewDetails={() => onViewDetails(booking)}
              onEditTime={() => onEditTime(booking)}
              onConfirm={() => onConfirm(booking)}
              onCancel={() => onCancel(booking)}
              status={booking.status}
            />
          </div>
        </div>
      </div>

      {/* Brief Notes Preview at the bottom of the card if notes exist */}
      {booking.notes && (
        <div className="col-span-full border-t border-dashed border-neutral-100 pt-2.5 mt-1 text-xs font-bold text-gray-400 flex items-start gap-1.5">
          <span className="text-[#D4A017] flex-shrink-0">📝 ملاحظات المتابعة:</span>
          <span className="text-gray-500 font-semibold line-clamp-1 flex-grow">{booking.notes}</span>
        </div>
      )}
    </div>
  );
});

export default BookingCardRow;

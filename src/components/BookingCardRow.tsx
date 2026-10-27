import React from 'react';
import { 
  FiUser, 
  FiClock, 
  FiCalendar, 
  FiPhone, 
  FiCopy, 
  FiMessageCircle,
  FiEdit3,
  FiEye,
  FiTrash2,
  FiUsers,
  FiFileText
} from 'react-icons/fi';
import type { Booking } from '../types/booking';
import { StatusBadge } from './StatusBadge';
import { ActionMenu } from './ActionMenu';
import { useToast } from './useToast';
import {
  formatArabicDate,
  formatArabicTime,
  formatPeopleCount,
  formatCreationDateTime
} from '../utils/bookingFormatters';
import { getCategoryIcon } from '../utils/translations';

interface BookingCardRowProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onEditTime: (booking: Booking) => void;
  onConfirm: (booking: Booking) => void;
  onComplete?: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete?: (bookingId: string) => void;
  canDelete?: boolean;
}

export const BookingCardRow = React.memo<BookingCardRowProps>(({
  booking,
  onViewDetails,
  onEditTime,
  onConfirm,
  onComplete,
  onCancel,
  onDelete,
  canDelete = false,
}) => {
  const { showToast } = useToast();

  const displayDate = formatArabicDate(booking.booking_date);
  const displayTime = formatArabicTime(booking.booking_time, booking.duration_minutes);
  const peopleText = formatPeopleCount(booking.number_of_people);
  const categoryIcon = getCategoryIcon(booking.category);

  // Clean, professional light category badge styling
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'عيد ميلاد':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'جامعة':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'مدرسة':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'إيفنت خارجي':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'كول سنتر':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'عميل سابق':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getWhatsAppLink = () => {
    const rawMessage = `السلام عليكم،\n\nمعك CLASH ZONE.\n\nنود تأكيد حجزكم لعدد ${booking.number_of_people} أفراد بتاريخ ${displayDate}\nالساعة ${displayTime}.\n\nأهلاً بكم في CLASH ZONE!`;
    const encodedMessage = encodeURIComponent(rawMessage);
    
    let cleanPhone = (booking.phone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('011')) {
      cleanPhone = '20' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('01')) {
      cleanPhone = '20' + cleanPhone;
    }
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(booking.phone);
    showToast('تم نسخ رقم الجوال بنجاح', 'success');
  };

  return (
    <div
      className="w-full box-border bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 shadow-sm flex flex-col lg:grid lg:grid-cols-[280px_130px_140px_165px_130px_auto] lg:items-center gap-3.5 relative card-hover-effect animate-fade-in-up"
    >
      {/* Column 1: Customer Information & Creator Metadata */}
      <div className="flex items-start gap-2.5 w-full min-w-0" dir="rtl">
        {/* Subtle, compact customer avatar */}
        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
          <FiUser className="w-3.5 h-3.5" />
        </div>

        {/* Info Column */}
        <div className="flex flex-col min-w-0 flex-grow">
          {/* Customer Name */}
          <span 
            className="text-sm font-semibold text-slate-900 tracking-tight leading-snug truncate"
            title={booking.customer_name}
          >
            {booking.customer_name}
          </span>

          {/* Phone Number with Icon & Compact Copy Button */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <FiPhone className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span 
              className="text-xs font-medium text-slate-600 whitespace-nowrap select-all tracking-wide" 
              dir="ltr"
            >
              {booking.phone}
            </span>
            <button
              type="button"
              onClick={handleCopyPhone}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer outline-none flex items-center justify-center"
              title="نسخ رقم الجوال"
              aria-label="نسخ رقم الجوال"
            >
              <FiCopy className="w-3 h-3" />
            </button>
          </div>

          {/* Subtle Divider */}
          <div className="border-t border-slate-100 my-1.5" />

          {/* Creator Metadata Row */}
          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 leading-tight">
            <span className="truncate">
              بواسطة: <span className="font-medium text-slate-600">{booking.creator_name || 'غير مسجل'}</span>
            </span>
            {booking.created_at && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 whitespace-nowrap text-[10px]">
                  {formatCreationDateTime(booking.created_at)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Column 2: Number of People */}
      <div className="flex items-center min-w-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
          <FiUsers className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="text-xs font-bold">{peopleText}</span>
        </div>
      </div>

      {/* Column 3: Category Badge */}
      <div className="flex items-center min-w-0">
        <span className={`text-xs font-bold border px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-1.5 ${getCategoryBadgeClass(booking.category)}`}>
          <span>{categoryIcon}</span>
          <span>{booking.category}</span>
        </span>
      </div>

      {/* Column 4: Date & Time */}
      <div className="flex flex-row lg:flex-col items-center lg:items-start gap-3 lg:gap-1 min-w-0">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="leading-none">{displayDate}</span>
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <FiClock className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="leading-none">{displayTime}</span>
          </span>
          {booking.duration_minutes === 60 && (
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 leading-none">
              ساعة كاملة
            </span>
          )}
          {booking.duration_minutes === 30 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 leading-none">
              ٣٠ د
            </span>
          )}
        </div>
      </div>

      {/* Column 5: Status Badge */}
      <div className="flex items-center lg:justify-center">
        <StatusBadge status={booking.status} />
      </div>

      {/* Column 6: Actions */}
      <div className="flex items-center justify-between lg:justify-end gap-1.5 pt-3 lg:pt-0 border-t border-slate-100 lg:border-none w-full">
        {/* Quick Contact Buttons */}
        <div className="flex items-center gap-1">
          {/* Direct Phone Call */}
          <a
            href={`tel:${booking.phone}`}
            className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
            title="اتصال هاتفي"
          >
            <FiPhone className="w-3.5 h-3.5" />
          </a>

          {/* WhatsApp Message */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center"
            title="مراسلة واتساب"
          >
            <FiMessageCircle className="w-3.5 h-3.5" />
          </a>

          {/* Copy Phone */}
          <button
            onClick={handleCopyPhone}
            className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer outline-none"
            title="نسخ رقم الجوال"
          >
            <FiCopy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5">
          {/* Quick Edit */}
          <button
            onClick={() => onEditTime(booking)}
            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer outline-none hidden lg:flex"
            title="تعديل الحجز"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>

          {/* Quick View Details */}
          <button
            onClick={() => onViewDetails(booking)}
            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer outline-none hidden lg:flex"
            title="عرض التفاصيل"
          >
            <FiEye className="w-4 h-4" />
          </button>

          {/* Quick Delete (Admin/Manager Only) */}
          {canDelete && onDelete && (
            <button
              onClick={() => {
                if (window.confirm(`هل أنت متأكد من حذف حجز (${booking.customer_name}) نهائياً؟`)) {
                  onDelete(booking.id);
                }
              }}
              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer outline-none hidden lg:flex"
              title="حذف الحجز نهائياً (خاص بالمسؤول)"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}

          {/* Dropdown Menu */}
          <div>
            <ActionMenu
              onViewDetails={() => onViewDetails(booking)}
              onEditTime={() => onEditTime(booking)}
              onConfirm={() => onConfirm(booking)}
              onComplete={onComplete ? () => onComplete(booking) : undefined}
              onCancel={() => onCancel(booking)}
              onWhatsApp={() => window.open(getWhatsAppLink(), '_blank', 'noopener,noreferrer')}
              onCopyPhone={handleCopyPhone}
              onDelete={canDelete && onDelete ? () => {
                if (window.confirm(`هل أنت متأكد من حذف حجز (${booking.customer_name}) نهائياً؟`)) {
                  onDelete(booking.id);
                }
              } : undefined}
              canDelete={canDelete}
              status={booking.status}
            />
          </div>
        </div>
      </div>

      {/* Notes footer */}
      {booking.notes && (
        <div className="col-span-full border-t border-slate-100 pt-2 mt-0.5 text-xs text-slate-500 flex items-start gap-1.5">
          <FiFileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="font-bold text-slate-600 flex-shrink-0">ملاحظات:</span>
          <span className="font-normal line-clamp-1 flex-grow">{booking.notes}</span>
        </div>
      )}
    </div>
  );
});

export default BookingCardRow;

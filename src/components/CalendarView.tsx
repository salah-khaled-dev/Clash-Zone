import React, { useState, useMemo } from 'react';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiClock, 
  FiEdit3,
  FiUsers
} from 'react-icons/fi';
import type { Booking } from '../types/booking';
import { generateSlots, isBookingInSlot, isBookingStartOfSlot } from '../utils/timeSlots';
import { formatArabicDate, formatPeopleCount, getTodayRiyadhStr } from '../utils/bookingFormatters';
import { getCategoryIcon, translateStatus } from '../utils/translations';

interface CalendarViewProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onEditTime: (booking: Booking) => void;
  onReschedule: (booking: Booking, newDate: string, newSlot: string) => void;
}

export const CalendarView = React.memo<CalendarViewProps>(({
  bookings,
  onViewDetails,
  onEditTime,
  onReschedule,
}) => {
  const timeSlots = useMemo(() => generateSlots(), []);

  const [baseDate, setBaseDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const daysInView = useMemo(() => {
    const todayStr = getTodayRiyadhStr();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + i);
      
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const label = formatArabicDate(dateStr);
      
      const isToday = dateStr === todayStr;
      const dayName = nextDate.toLocaleDateString('ar-EG', { weekday: 'long' });

      days.push({
        dateStr,
        label,
        dayName,
        isToday,
        rawDate: nextDate
      });
    }
    return days;
  }, [baseDate]);

  const handlePrevWeek = () => {
    setBaseDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setBaseDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleGoToToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setBaseDate(d);
  };

  const cellBookings = useMemo(() => {
    const map: Record<string, { booking: Booking; isStart: boolean; duration: number | null }[]> = {};
    bookings.forEach(b => {
      if (b.status !== 'cancelled') {
        timeSlots.forEach(slot => {
          if (isBookingInSlot(b, slot)) {
            const key = `${b.booking_date}_${slot.key}`;
            const isStart = isBookingStartOfSlot(b, slot);
            if (!map[key]) map[key] = [];
            map[key].push({ booking: b, isStart, duration: b.duration_minutes ?? null });
          }
        });
      }
    });
    return map;
  }, [bookings, timeSlots]);

  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    e.dataTransfer.setData('text/plain', booking.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string, slotKey: string) => {
    e.preventDefault();
    const cellKey = `${dateStr}_${slotKey}`;
    if (dragOverCell !== cellKey) {
      setDragOverCell(cellKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string, slotKey: string) => {
    e.preventDefault();
    setDragOverCell(null);
    
    const bookingId = e.dataTransfer.getData('text/plain');
    if (!bookingId) return;

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const targetSlot = timeSlots.find(s => s.key === slotKey || s.startTime24 === slotKey);
    if (!targetSlot) return;

    const newSlotTime = targetSlot.startTime24;

    if (booking.booking_date === dateStr && booking.booking_time === newSlotTime) {
      return;
    }

    onReschedule(booking, dateStr, newSlotTime);
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'pending':
      case 'جديد': 
        return 'border-r-4 border-blue-500';
      case 'confirmed':
      case 'تم التأكيد': 
        return 'border-r-4 border-amber-500';
      case 'completed':
      case 'مكتمل': 
        return 'border-r-4 border-emerald-500';
      case 'cancelled':
      case 'ملغي': 
        return 'border-r-4 border-rose-500';
      default: 
        return 'border-r-4 border-slate-300';
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/90 shadow-sm box-border">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100">
            <FiCalendar className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-slate-900 leading-none">جدول المواعيد التفاعلي</h4>
            <span className="text-[11px] text-slate-500 font-medium mt-1">اسحب وأسقط الحجز لتعديل توقيته بسهولة</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2" dir="ltr">
          <button
            onClick={handlePrevWeek}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer outline-none flex items-center justify-center shadow-sm"
            title="الأسبوع السابق"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleGoToToday}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer outline-none shadow-sm"
          >
            اليوم
          </button>

          <button
            onClick={handleNextWeek}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer outline-none flex items-center justify-center shadow-sm"
            title="الأسبوع القادم"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-3 scrollbar-thin">
        <div className="min-w-[1020px] grid grid-cols-[105px_repeat(7,1fr)] gap-2 border-collapse">
          {/* Top Header Row */}
          <div className="flex items-center justify-center bg-slate-100 p-2.5 rounded-xl border border-slate-200/80 font-bold text-xs text-slate-600 h-[56px]">
            الساعة
          </div>
          {daysInView.map(day => (
            <div 
              key={day.dateStr} 
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all h-[56px] ${
                day.isToday 
                  ? 'bg-red-50/60 border-red-200 text-red-950 font-black' 
                  : 'bg-slate-50 border-slate-200/80 text-slate-800 font-bold'
              }`}
            >
              <span className="text-[12px] leading-tight">{day.dayName}</span>
              <span className={`text-[10px] mt-0.5 font-bold ${day.isToday ? 'text-red-700' : 'text-slate-500'}`}>
                {day.label}
              </span>
            </div>
          ))}

          {/* Time Slot Rows */}
          {timeSlots.map(slot => (
            <React.Fragment key={slot.key}>
              {/* Row Label (Time) */}
              <div className="flex items-center justify-center bg-slate-50 border border-slate-200/80 p-1.5 rounded-xl text-[10px] font-bold text-slate-600 h-[86px] gap-1">
                <FiClock className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="whitespace-nowrap">{slot.shortLabel || slot.label}</span>
              </div>

              {/* Day Cells for this Time Slot */}
              {daysInView.map(day => {
                const cellKey = `${day.dateStr}_${slot.key}`;
                const entries = cellBookings[cellKey] || [];
                const isDragOver = dragOverCell === cellKey;
                const hasMultiple = entries.length > 1;

                return (
                  <div
                    key={day.dateStr}
                    onDragOver={(e) => handleDragOver(e, day.dateStr, slot.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day.dateStr, slot.key)}
                    className={`border rounded-xl p-1.5 transition-all flex flex-col justify-start min-h-[90px] relative ${
                      isDragOver 
                        ? 'bg-red-50 border-dashed border-red-400' 
                        : entries.length > 0
                          ? 'bg-white border-slate-200 shadow-2xs' 
                          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/60'
                    }`}
                  >
                    {entries.length > 0 ? (
                      <div className="w-full flex flex-col gap-1.5">
                        {hasMultiple && (
                          <div className="text-[8px] font-black text-red-700 bg-red-50 border border-red-100 px-1 py-0.5 rounded text-center">
                            {entries.length} حجوزات في هذا الوقت
                          </div>
                        )}
                        {entries.map(({ booking, isStart, duration }) => (
                          isStart ? (
                            <div
                              key={booking.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, booking)}
                              onClick={() => onViewDetails(booking)}
                              className={`w-full rounded-lg p-2 flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-xs bg-white border border-slate-200/90 transition-all select-none hover:border-slate-300 ${getStatusBorder(booking.status)}`}
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between gap-1 w-full min-w-0">
                                <span className="text-[11px] font-bold text-slate-900 truncate leading-none flex-grow">
                                  {booking.customer_name}
                                </span>
                                {duration === 60 && (
                                  <span className="text-[8px] font-extrabold px-1 py-0.5 rounded bg-purple-100 text-purple-800 leading-none shrink-0">
                                    ٦٠ د
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTime(booking);
                                  }}
                                  className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                                  title="تعديل الموعد"
                                >
                                  <FiEdit3 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* People & Category */}
                              <div className="flex flex-col gap-0.5 mt-1 min-w-0">
                                <span className="text-[10px] font-semibold text-slate-600 truncate flex items-center gap-1 leading-none">
                                  <FiUsers className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                                  <span>{formatPeopleCount(booking.number_of_people)}</span>
                                </span>
                                <span className="text-[9.5px] font-bold text-slate-700 truncate leading-none mt-0.5">
                                  {getCategoryIcon(booking.category)} {booking.category}
                                </span>
                              </div>

                              {/* Status Footer */}
                              <div className="flex items-center justify-between text-[8.5px] text-slate-500 font-bold border-t border-slate-100 pt-1 mt-1 leading-none">
                                <span className="truncate">الحالة</span>
                                <span className="font-extrabold text-slate-800">{translateStatus(booking.status)}</span>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={`cont_${booking.id}`}
                              onClick={() => onViewDetails(booking)}
                              className="w-full rounded-lg p-1.5 flex flex-col justify-between cursor-pointer bg-slate-50/90 border border-dashed border-purple-200 hover:border-purple-300 transition-all text-right shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-[9px] font-bold text-purple-900 leading-none">
                                <span className="truncate">امتداد ({booking.customer_name})</span>
                                <span className="text-[8px] font-black px-1 py-0.5 rounded bg-purple-100 text-purple-700">ساعة</span>
                              </div>
                              <span className="text-[8.5px] text-slate-400 font-medium truncate mt-0.5">
                                تابع لنفس الحجز
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full min-h-[70px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-bold text-slate-400">متاح</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});

export default CalendarView;

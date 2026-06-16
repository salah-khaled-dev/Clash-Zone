import React, { useState, useMemo } from 'react';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiEdit3 
} from 'react-icons/fi';
import { LuCar } from 'react-icons/lu';
import type { Booking } from '../types/booking';
import { generateSlots } from '../utils/timeSlots';
import { formatArabicDate } from '../utils/bookingFormatters';
import { translateBranch } from '../utils/translations';

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
  // Time Slots: 12:00 PM to 10:00 PM (11 slots)
  const timeSlots = useMemo(() => generateSlots(), []);

  // Calendar Base Date (default is today)
  const [baseDate, setBaseDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Cell hover tracking for Drag & Drop highlights
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  // Generate 7 days in view starting from baseDate
  const daysInView = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + i);
      
      const dateStr = nextDate.toISOString().split('T')[0];
      const label = formatArabicDate(dateStr);
      
      // Check if it's today
      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = dateStr === todayStr;

      // Get day name (Arabic)
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

  // Navigate calendar base date
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

  // Group bookings by date and time slot for O(1) cell lookup
  const bookingsGrid = useMemo(() => {
    const grid: Record<string, Booking> = {};
    bookings.forEach(b => {
      if (b.status !== 'ملغي') {
        const key = `${b.booking_date}_${b.time_slot}`;
        grid[key] = b;
      }
    });
    return grid;
  }, [bookings]);

  // Drag Handlers
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

    // Check if dragging to the same spot
    if (booking.booking_date === dateStr && booking.time_slot === slotKey) {
      return;
    }

    onReschedule(booking, dateStr, slotKey);
  };

  // Helper for status classes inside the grid cards
  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'جديد': return 'border-r-4 border-blue-500';
      case 'تم التواصل': return 'border-r-4 border-purple-500';
      case 'تم التأكيد': return 'border-r-4 border-amber-500';
      case 'مكتمل': return 'border-r-4 border-emerald-500';
      default: return 'border-r-4 border-neutral-300';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-50/40 hover:bg-blue-50/60';
      case 'تم التواصل': return 'bg-purple-50/40 hover:bg-purple-50/60';
      case 'تم التأكيد': return 'bg-amber-50/40 hover:bg-amber-50/60';
      case 'مكتمل': return 'bg-emerald-50/40 hover:bg-emerald-50/60';
      default: return 'bg-neutral-50 hover:bg-neutral-100';
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 bg-white p-5 lg:p-6 rounded-[24px] border border-neutral-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] box-border">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-[#D4A017] border border-amber-100">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-black text-gray-900 leading-none">جدول المواعيد التفاعلي</h4>
            <span className="text-[10px] text-gray-500 font-bold mt-1.5">اسحب وأسقط الموعد لتعديل وقته وساعته</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2" dir="ltr">
          <button
            onClick={handlePrevWeek}
            className="p-2.5 bg-neutral-50 hover:bg-neutral-100 text-gray-600 rounded-xl border border-neutral-200 transition-colors cursor-pointer outline-none flex items-center justify-center"
            title="الأسبوع السابق"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleGoToToday}
            className="px-4 py-2 bg-neutral-50 hover:bg-neutral-100 text-gray-800 text-xs font-bold rounded-xl border border-neutral-200 transition-colors cursor-pointer outline-none"
          >
            اليوم
          </button>

          <button
            onClick={handleNextWeek}
            className="p-2.5 bg-neutral-50 hover:bg-neutral-100 text-gray-600 rounded-xl border border-neutral-200 transition-colors cursor-pointer outline-none flex items-center justify-center"
            title="الأسبوع القادم"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid Wrapper with custom overflow scroll */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin">
        <div className="min-w-[1050px] grid grid-cols-[100px_repeat(7,1fr)] gap-2 border-collapse">
          {/* Top Header Row */}
          <div className="flex items-center justify-center bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 font-bold text-xs text-gray-600 h-[60px]">
            الساعة
          </div>
          {daysInView.map(day => (
            <div 
              key={day.dateStr} 
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all h-[60px] ${
                day.isToday 
                  ? 'bg-amber-50/40 border-[#F4C542] text-amber-950 font-black shadow-[0_0_12px_rgba(244,197,66,0.06)]' 
                  : 'bg-neutral-50 border-neutral-100 text-gray-900 font-extrabold'
              }`}
            >
              <span className="text-[12px] leading-tight">{day.dayName}</span>
              <span className={`text-[10px] mt-1 font-bold ${day.isToday ? 'text-[#D4A017]' : 'text-gray-400'}`}>
                {day.label}
              </span>
            </div>
          ))}

          {/* Time Slot Rows */}
          {timeSlots.map(slot => (
            <React.Fragment key={slot.key}>
              {/* Row Label (Time) */}
              <div className="flex items-center justify-center bg-neutral-50/70 border border-neutral-100 p-2.5 rounded-xl text-[10px] font-bold text-gray-500 h-[92px] gap-1">
                <FiClock className="w-3 h-3 text-[#D4A017]" />
                <span>{slot.label.replace("مساءً", "م").replace("ظهرًا", "ظ").replace("صباحًا", "ص")}</span>
              </div>

              {/* Day Cells for this Time Slot */}
              {daysInView.map(day => {
                const cellKey = `${day.dateStr}_${slot.key}`;
                const booking = bookingsGrid[cellKey];
                const isDragOver = dragOverCell === cellKey;

                return (
                  <div
                    key={day.dateStr}
                    onDragOver={(e) => handleDragOver(e, day.dateStr, slot.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day.dateStr, slot.key)}
                    className={`border border-neutral-100/70 rounded-xl p-1.5 transition-all flex flex-col justify-center min-h-[92px] h-[92px] relative ${
                      isDragOver 
                        ? 'bg-[#F4C542]/5 border-dashed border-[#F4C542] scale-[1.01] shadow-inner' 
                        : booking 
                          ? 'bg-white' 
                          : 'bg-neutral-50/20 hover:bg-neutral-50/60'
                    }`}
                  >
                    {booking ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, booking)}
                        onClick={() => onViewDetails(booking)}
                        className={`h-full w-full rounded-lg p-2 flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-sm border border-neutral-150 transition-all select-none hover:scale-[1.02] ${getStatusBorder(booking.status)} ${getStatusBg(booking.status)}`}
                      >
                        {/* Booking Card Header */}
                        <div className="flex items-center justify-between gap-1 w-full min-w-0">
                          <span className="text-[11px] font-black text-gray-900 truncate leading-none flex-grow">
                            {booking.customer_name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTime(booking);
                            }}
                            className="text-gray-400 hover:text-gray-700 transition-colors p-0.5"
                            title="تعديل الموعد"
                          >
                            <FiEdit3 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Booking Details */}
                        <div className="flex flex-col gap-0.5 mt-1 min-w-0">
                          <span className="text-[9px] font-bold text-gray-500 truncate flex items-center gap-0.5 leading-none">
                            <LuCar className="w-2.5 h-2.5 text-[#D4A017] flex-shrink-0" />
                            <span className="truncate">{booking.vehicle_make} {booking.vehicle_model}</span>
                          </span>
                          <span className="text-[8.5px] font-black text-amber-800 truncate leading-none mt-0.5">
                            ⚡ {booking.service_type}
                          </span>
                        </div>

                        {/* Branch badge / Footer */}
                        <div className="flex items-center justify-between text-[8px] text-gray-400 font-bold border-t border-neutral-100/50 pt-1 mt-1 leading-none">
                          <span className="truncate flex items-center gap-0.5">
                            <FiMapPin className="w-2 h-2" />
                            <span>{translateBranch(booking.branch_name)}</span>
                          </span>
                          <span className="font-extrabold">{booking.status}</span>
                        </div>
                      </div>
                    ) : (
                      // Empty slot placeholder
                      <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-bold text-gray-400">متاح</span>
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

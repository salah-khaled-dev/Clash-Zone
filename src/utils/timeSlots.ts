export type BookingDuration = 30 | 60;

export const WORKING_HOURS = {
  start: 12, // 12:00 PM
  end: 22,   // 10:30 PM
  startHour: 12,
  startMinute: 0,
  endHour: 22,
  endMinute: 30,
  closeHour: 23, // 11:00 PM closing
  closeMinute: 0
};

export interface TimeSlot {
  key: string;            // e.g. "12:00 PM - 12:30 PM" or "12:00 PM - 01:00 PM"
  label: string;          // e.g. "من 12:00 إلى 12:30 ظهرًا (٣٠ دقيقة)"
  timeLabel: string;      // e.g. "12:00 ظهرًا"
  shortLabel: string;     // e.g. "12:00 - 12:30 ظ"
  duration: BookingDuration;
  startMinutes: number;
  endMinutes: number;
  startFormatted: string; // "12:00 PM"
  endFormatted: string;   // "12:30 PM"
}

/**
 * Generate slots for either 30 minutes or 60 minutes.
 * - For 30 mins: slots from 12:00 PM to 11:00 PM (each 30m).
 * - For 60 mins: slots from 12:00 PM to 11:00 PM (each 60m, step 30m).
 */
export function generateSlots(duration: BookingDuration = 30): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  const startTotalMinutes = WORKING_HOURS.startHour * 60 + WORKING_HOURS.startMinute;
  const closingTotalMinutes = WORKING_HOURS.closeHour * 60 + WORKING_HOURS.closeMinute;
  // Last starting time allowed so session doesn't exceed closing time
  const maxStartMinutes = closingTotalMinutes - duration;
  
  // Step every 30 minutes so sessions can start on the hour or half-hour
  const stepMinutes = 30;
  
  for (let mins = startTotalMinutes; mins <= maxStartMinutes; mins += stepMinutes) {
    const startHour = Math.floor(mins / 60);
    const startMinute = mins % 60;
    
    const endMins = mins + duration;
    const endHour = Math.floor(endMins / 60);
    const endMinute = endMins % 60;
    
    // Start format (12-hour)
    const startIsPM = startHour >= 12;
    const startDisplayHour = startHour === 0 ? 12 : startHour > 12 ? startHour - 12 : startHour;
    const formattedStartHour = String(startDisplayHour).padStart(2, '0');
    const formattedStartMinute = String(startMinute).padStart(2, '0');
    const startAmPm = startIsPM ? "PM" : "AM";
    const startFormatted = `${formattedStartHour}:${formattedStartMinute} ${startAmPm}`;
    
    // End format (12-hour)
    const endIsPM = endHour >= 12;
    const endDisplayHour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
    const formattedEndHour = String(endDisplayHour).padStart(2, '0');
    const formattedEndMinute = String(endMinute).padStart(2, '0');
    const endAmPm = endIsPM ? "PM" : "AM";
    const endFormatted = `${formattedEndHour}:${formattedEndMinute} ${endAmPm}`;
    
    // Canonical key representing the interval
    const key = `${startFormatted} - ${endFormatted}`;
    
    // Arabic period definitions
    const startPeriod = startHour === 12 ? "ظهرًا" : (startIsPM ? "مساءً" : "صباحًا");
    const endPeriod = endHour === 12 ? "ظهرًا" : (endIsPM ? "مساءً" : "صباحًا");
    const shortEndPeriod = endPeriod === "ظهرًا" ? "ظ" : (endPeriod === "مساءً" ? "م" : "ص");
    
    // Duration suffix
    const durationSuffix = duration === 60 ? "(ساعة كاملة)" : "(٣٠ دقيقة)";
    
    // Detailed label e.g. "من 12:00 إلى 12:30 ظهرًا (٣٠ دقيقة)"
    const label = startPeriod === endPeriod
      ? `من ${formattedStartHour}:${formattedStartMinute} إلى ${formattedEndHour}:${formattedEndMinute} ${endPeriod} ${durationSuffix}`
      : `من ${formattedStartHour}:${formattedStartMinute} ${startPeriod} إلى ${formattedEndHour}:${formattedEndMinute} ${endPeriod} ${durationSuffix}`;
    
    // Simple start time label
    const timeLabel = `${formattedStartHour}:${formattedStartMinute} ${startPeriod}`;
    
    // Short label for calendar header
    const shortLabel = `${formattedStartHour}:${formattedStartMinute} - ${formattedEndHour}:${formattedEndMinute} ${shortEndPeriod}`;
    
    slots.push({
      key,
      label,
      timeLabel,
      shortLabel,
      duration,
      startMinutes: mins,
      endMinutes: endMins,
      startFormatted,
      endFormatted
    });
  }
  
  return slots;
}

/**
 * Parse a raw time string (e.g. "12:00 PM" or "12:00 PM - 01:00 PM") into minutes from midnight
 */
export function parseSingleTimeToMinutes(str: string): number {
  if (!str) return 0;
  const clean = str.trim().toUpperCase();

  // Match 12-hour format: "02:30 PM" or "2:30 PM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hr = parseInt(match12[1], 10);
    const min = parseInt(match12[2], 10);
    const ampm = match12[3];
    if (ampm === 'PM' && hr < 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;
    return hr * 60 + min;
  }

  // Match 24-hour format: "14:30" or "14:30:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hr = parseInt(match24[1], 10);
    const min = parseInt(match24[2], 10);
    return hr * 60 + min;
  }

  return 0;
}

export interface BookingInterval {
  startMinutes: number;
  endMinutes: number;
  duration: BookingDuration;
  startStr: string;
  endStr: string;
}

/**
 * Parse any booking time string into interval with duration
 */
export function parseBookingInterval(timeStr: string): BookingInterval {
  if (!timeStr) {
    return { startMinutes: 0, endMinutes: 30, duration: 30, startStr: '', endStr: '' };
  }
  const clean = timeStr.trim();
  
  // Range check: "12:00 PM - 01:00 PM" or "12:00 PM إلى 01:00 PM"
  const parts = clean.split(/\s*[-–—]\s*|\s+إلى\s+/i);
  if (parts.length >= 2) {
    const startMins = parseSingleTimeToMinutes(parts[0]);
    const endMins = parseSingleTimeToMinutes(parts[1]);
    const rawDiff = endMins - startMins;
    const duration: BookingDuration = rawDiff >= 45 ? 60 : 30;
    return {
      startMinutes: startMins,
      endMinutes: endMins > startMins ? endMins : startMins + duration,
      duration,
      startStr: parts[0].trim(),
      endStr: parts[1].trim()
    };
  }
  
  // Single time (legacy): default to 30 minutes
  const startMins = parseSingleTimeToMinutes(clean);
  return {
    startMinutes: startMins,
    endMinutes: startMins + 30,
    duration: 30,
    startStr: clean,
    endStr: ''
  };
}

/**
 * Check if two time intervals conflict/overlap:
 * Two intervals [A, B] and [C, D] overlap if and only if: max(A, C) < min(B, D)
 */
export function isBookingConflict(bookingA: string, bookingB: string): boolean {
  if (!bookingA || !bookingB) return false;
  const a = parseBookingInterval(bookingA);
  const b = parseBookingInterval(bookingB);
  return Math.max(a.startMinutes, b.startMinutes) < Math.min(a.endMinutes, b.endMinutes);
}

/**
 * Check if a booking occupies or overlaps with a specific time slot
 */
export function isBookingInSlot(bookingTime: string, slotKey: string): boolean {
  return isBookingConflict(bookingTime, slotKey);
}

/**
 * Check if a booking specifically STARTS at this slot
 */
export function isBookingStartOfSlot(bookingTime: string, slotKey: string): boolean {
  const b = parseBookingInterval(bookingTime);
  const s = parseBookingInterval(slotKey);
  return b.startMinutes === s.startMinutes;
}

export function parseTimeSlotToMinutes(timeStr: string): number {
  return parseBookingInterval(timeStr).startMinutes;
}

export function compareTimeSlots(a: string, b: string): number {
  return parseTimeSlotToMinutes(a) - parseTimeSlotToMinutes(b);
}

export function normalizeTimeSlot(timeStr: string): string {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  
  const parts = clean.split(/\s*[-–—]\s*/);
  if (parts.length >= 2) {
    const startMins = parseSingleTimeToMinutes(parts[0]);
    const endMins = parseSingleTimeToMinutes(parts[1]);
    
    const formatFromMins = (m: number) => {
      const hr = Math.floor(m / 60);
      const min = m % 60;
      const isPM = hr >= 12;
      const displayHour = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
      return `${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
    };
    
    return `${formatFromMins(startMins)} - ${formatFromMins(endMins)}`;
  }

  // Single time 12-hour format: "02:00 PM"
  const match12 = clean.toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    const hr = parseInt(match12[1], 10);
    const min = match12[2];
    const ampm = match12[3];
    return `${String(hr).padStart(2, '0')}:${min} ${ampm}`;
  }

  // Single time 24-hour format: "14:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hr = parseInt(match24[1], 10);
    const min = match24[2];
    const isPM = hr >= 12;
    const displayHour = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    const ampm = isPM ? "PM" : "AM";
    return `${String(displayHour).padStart(2, '0')}:${min} ${ampm}`;
  }

  return timeStr;
}


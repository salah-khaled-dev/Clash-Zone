export type BookingDuration = 30 | 60;

export const WORKING_HOURS = {
  startHour: 12,    // 12:00 PM noon
  startMinute: 0,
  // Operating through late night past midnight up to 02:00 AM (26 in business hours)
  closeHour: 26,    // 02:00 AM next day
  closeMinute: 0
};

export interface TimeSlot {
  key: string;            // e.g. "12:00:00"
  label: string;          // e.g. "من 12:00 إلى 12:30 ظهرًا (٣٠ دقيقة)"
  timeLabel: string;      // e.g. "12:00 ظهرًا"
  shortLabel: string;     // e.g. "12:00 - 12:30 ظ"
  duration: BookingDuration;
  startMinutes: number;   // Business timeline minutes (720..1560)
  endMinutes: number;     // Business timeline minutes
  startTime24: string;    // "12:00:00" (PostgreSQL TIME format)
  endTime24: string;      // "12:30:00" (PostgreSQL TIME format)
  startFormatted: string; // "12:00 PM"
  endFormatted: string;   // "12:30 PM"
}

/**
 * Converts any time string (12-hour, 24-hour, range, or Arabic format)
 * into a PostgreSQL-compatible 24-hour TIME string: "HH:MM:SS".
 * If a range string is passed (e.g. "06:30 PM - 07:00 PM"), ONLY the start time is extracted.
 */
export function toPostgresTime(input?: string | null): string {
  if (!input) return '12:00:00';
  const clean = input.trim();

  // If input is a range (e.g. "06:30 PM - 07:00 PM" or "من 06:30 إلى 07:00 مساءً"), extract start time
  let timeStr = clean;
  if (/[-–—]|\s+إلى\s+/i.test(clean)) {
    const parts = clean.replace(/^من\s+/i, '').split(/\s*[-–—]\s*|\s+إلى\s+/i);
    if (parts.length > 0 && parts[0].trim()) {
      timeStr = parts[0].trim();
      // If the second part has an AM/PM or Arabic period that was omitted from the first part
      const secondPart = parts[1]?.toUpperCase() || '';
      if (!/(AM|PM|مساءً|صباحًا|ظهرًا)/i.test(timeStr)) {
        if (/PM|مساءً/i.test(secondPart)) timeStr += ' PM';
        else if (/AM|صباحًا/i.test(secondPart)) timeStr += ' AM';
        else if (/ظهرًا/i.test(secondPart)) timeStr += ' PM';
      }
    }
  }

  const upper = timeStr.toUpperCase();

  // Match 12-hour format: "02:30 PM" or "2:30 PM" or "02:30 مساءً"
  const match12 = upper.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|صباحًا|مساءً|ظهرًا)?$/);
  if (match12) {
    let hr = parseInt(match12[1], 10);
    const min = parseInt(match12[2], 10);
    const indicator = match12[3];

    if (indicator === 'PM' || indicator === 'مساءً') {
      if (hr < 12) hr += 12;
    } else if (indicator === 'AM' || indicator === 'صباحًا') {
      if (hr === 12) hr = 0;
    } else if (indicator === 'ظهرًا') {
      if (hr === 12) hr = 12;
    }

    return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
  }

  // Match 24-hour format: "14:30" or "14:30:00"
  const match24 = upper.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    const hr = parseInt(match24[1], 10);
    const min = parseInt(match24[2], 10);
    return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
  }

  return '12:00:00';
}

/**
 * Parse a raw time string (e.g. "12:00 PM" or "14:30:00") into minutes from midnight (0..1439).
 */
export function parseSingleTimeToMinutes(str: string): number {
  if (!str) return 0;
  const clean = str.trim().toUpperCase();

  // Handle range by taking start
  const firstPart = clean.replace(/^من\s+/i, '').split(/\s*[-–—]\s*|\s+إلى\s+/i)[0].trim();

  // Match 12-hour format: "02:30 PM" or "2:30 PM" or "02:30 مساءً"
  const match12 = firstPart.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|صباحًا|مساءً|ظهرًا)?$/);
  if (match12) {
    let hr = parseInt(match12[1], 10);
    const min = parseInt(match12[2], 10);
    const indicator = match12[3];
    if ((indicator === 'PM' || indicator === 'مساءً') && hr < 12) hr += 12;
    if ((indicator === 'AM' || indicator === 'صباحًا') && hr === 12) hr = 0;
    return (hr * 60 + min) % 1440;
  }

  // Match 24-hour format: "14:30" or "14:30:00"
  const match24 = firstPart.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hr = parseInt(match24[1], 10);
    const min = parseInt(match24[2], 10);
    return (hr * 60 + min) % 1440;
  }

  return 0;
}

/**
 * Converts standard minutes from midnight (0..1439) to business timeline minutes.
 * In a gaming arena open from 12:00 PM (720 min) through midnight to 02:00 AM (120 min),
 * hours before 06:00 AM (e.g. 00:00..05:59) represent post-midnight of the same operating day
 * and are mapped to 1440..1799.
 */
export function toBusinessMinutes(minsFromMidnight: number): number {
  if (minsFromMidnight < 360) { // Before 06:00 AM
    return minsFromMidnight + 1440;
  }
  return minsFromMidnight;
}

/**
 * Dynamically calculate booking end time in 24-hour PostgreSQL format "HH:MM:SS"
 * from a start time and duration in minutes (handles crossing midnight).
 */
export function calculateEndTime24(startTime: string, durationMinutes: number): string {
  const startMins = parseSingleTimeToMinutes(startTime);
  const endMinsInDay = (startMins + durationMinutes) % 1440;
  const endHour = Math.floor(endMinsInDay / 60);
  const endMinute = endMinsInDay % 60;
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;
}

/**
 * Generate slots for either 30 minutes or 60 minutes.
 * Operating schedule: 12:00 PM noon through midnight to 02:00 AM.
 * Each slot provides 24-hour start/end times and rich display labels.
 */
export function generateSlots(duration: BookingDuration = 30): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  const startTotalMinutes = WORKING_HOURS.startHour * 60 + WORKING_HOURS.startMinute; // 720
  const closingTotalMinutes = WORKING_HOURS.closeHour * 60 + WORKING_HOURS.closeMinute; // 1560 (02:00 AM)
  const maxStartMinutes = closingTotalMinutes - duration;
  const stepMinutes = 30;
  
  for (let mins = startTotalMinutes; mins <= maxStartMinutes; mins += stepMinutes) {
    const startMinsInDay = mins % 1440;
    const startHour = Math.floor(startMinsInDay / 60);
    const startMinute = startMinsInDay % 60;
    
    const endMins = mins + duration;
    const endMinsInDay = endMins % 1440;
    const endHour = Math.floor(endMinsInDay / 60);
    const endMinute = endMinsInDay % 60;
    
    // 24-hour PostgreSQL formats
    const startTime24 = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`;
    const endTime24 = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;

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
    
    // Key is the 24-hour start time to keep clean database consistency
    const key = startTime24;
    
    // Arabic period definitions
    const startPeriod = startHour === 12 ? "ظهرًا" : (startIsPM ? "مساءً" : "صباحًا");
    const endPeriod = endHour === 12 ? "ظهرًا" : (endIsPM ? "مساءً" : "صباحًا");
    const shortEndPeriod = endPeriod === "ظهرًا" ? "ظ" : (endPeriod === "مساءً" ? "م" : "ص");
    
    // Duration suffix
    const durationSuffix = duration === 60 ? "(ساعة كاملة)" : "(٣٠ دقيقة)";
    
    // Detailed label e.g. "من 12:00 إلى 12:30 ظهرًا (٣٠ دقيقة)" or "من 11:30 مساءً إلى 12:30 صباحًا (ساعة كاملة)"
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
      startTime24,
      endTime24,
      startFormatted,
      endFormatted
    });
  }
  
  return slots;
}

export interface BookingInterval {
  startMinutes: number;
  endMinutes: number;
  duration: BookingDuration;
  hasExplicitDuration: boolean;
  startStr: string;
  endStr: string;
}

/**
 * Parse any booking time string and optional duration into a business timeline interval.
 */
export function parseBookingInterval(timeStr: string, durationMinutes?: number | null): BookingInterval {
  if (!timeStr) {
    return { startMinutes: 0, endMinutes: 30, duration: 30, hasExplicitDuration: false, startStr: '', endStr: '' };
  }

  const startMinsInDay = parseSingleTimeToMinutes(timeStr);
  const startBusinessMins = toBusinessMinutes(startMinsInDay);

  if (durationMinutes === 30 || durationMinutes === 60) {
    return {
      startMinutes: startBusinessMins,
      endMinutes: startBusinessMins + durationMinutes,
      duration: durationMinutes,
      hasExplicitDuration: true,
      startStr: toPostgresTime(timeStr),
      endStr: calculateEndTime24(timeStr, durationMinutes)
    };
  }

  // Fallback for older records with explicit range formatted strings
  const clean = timeStr.trim();
  const parts = clean.split(/\s*[-–—]\s*|\s+إلى\s+/i);
  if (parts.length >= 2) {
    const sMins = toBusinessMinutes(parseSingleTimeToMinutes(parts[0]));
    const eMins = toBusinessMinutes(parseSingleTimeToMinutes(parts[1]));
    const rawDiff = eMins - sMins;
    const dur: BookingDuration = rawDiff >= 45 ? 60 : 30;
    return {
      startMinutes: sMins,
      endMinutes: eMins > sMins ? eMins : sMins + dur,
      duration: dur,
      hasExplicitDuration: true,
      startStr: parts[0].trim(),
      endStr: parts[1].trim()
    };
  }

  // Older record with NULL duration: DO NOT invent historical duration
  return {
    startMinutes: startBusinessMins,
    endMinutes: startBusinessMins + 30, // For grid alignment only
    duration: 30,
    hasExplicitDuration: false,
    startStr: toPostgresTime(clean),
    endStr: ''
  };
}

/**
 * Check if a booking occupies or overlaps with a specific time slot on the calendar.
 */
export function isBookingInSlot(
  bookingOrTime: { booking_time: string; duration_minutes?: number | null } | string,
  slotOrKey: TimeSlot | string,
  explicitDuration?: number | null
): boolean {
  const timeStr = typeof bookingOrTime === 'string' ? bookingOrTime : bookingOrTime.booking_time;
  const duration = typeof bookingOrTime === 'string' ? explicitDuration : bookingOrTime.duration_minutes;

  const bStart = toBusinessMinutes(parseSingleTimeToMinutes(timeStr));
  let slotStart: number;
  let slotEnd: number;

  if (typeof slotOrKey === 'string') {
    slotStart = toBusinessMinutes(parseSingleTimeToMinutes(slotOrKey));
    slotEnd = slotStart + 30;
  } else {
    slotStart = slotOrKey.startMinutes;
    slotEnd = slotOrKey.endMinutes;
  }

  // Older record with NULL duration: only occupies its starting slot
  if (duration === null || duration === undefined) {
    return bStart === slotStart;
  }

  // 30 or 60 minute booking: standard interval overlap [A, B) and [C, D)
  const bEnd = bStart + duration;
  return Math.max(bStart, slotStart) < Math.min(bEnd, slotEnd);
}

/**
 * Check if a booking specifically STARTS at this slot.
 */
export function isBookingStartOfSlot(
  bookingOrTime: { booking_time: string } | string,
  slotOrKey: TimeSlot | string
): boolean {
  const timeStr = typeof bookingOrTime === 'string' ? bookingOrTime : bookingOrTime.booking_time;
  const bStart = toBusinessMinutes(parseSingleTimeToMinutes(timeStr));
  const sStart = typeof slotOrKey === 'string' 
    ? toBusinessMinutes(parseSingleTimeToMinutes(slotOrKey))
    : slotOrKey.startMinutes;

  return bStart === sStart;
}

/**
 * Compare time slots chronologically across the business day.
 */
export function compareTimeSlots(a: string, b: string): number {
  const aMins = toBusinessMinutes(parseSingleTimeToMinutes(a));
  const bMins = toBusinessMinutes(parseSingleTimeToMinutes(b));
  return aMins - bMins;
}

/**
 * Normalize time slot string into standard 24-hour PostgreSQL format "HH:MM:SS".
 */
export function normalizeTimeSlot(timeStr: string): string {
  return toPostgresTime(timeStr);
}

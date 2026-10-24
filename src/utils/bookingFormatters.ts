import { translateStatus, formatPeopleCount } from './translations';
import { toPostgresTime, calculateEndTime24 } from './timeSlots';

const arabicDateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Riyadh',
});

export function getTodayRiyadhStr(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    // If dateStr is YYYY-MM-DD, parse year, month, day directly to avoid UTC midnight timezone shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      return arabicDateFormatter.format(date);
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return arabicDateFormatter.format(date);
  } catch {
    return dateStr;
  }
}

export function formatSingleArabicTime(timeStr: string): { formatted: string; period: string } | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();

  const match12 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|مساءً|صباحًا|ظهرًا)?$/);
  if (match12) {
    const [, hours, minutes, ind] = match12;
    const hr = parseInt(hours, 10);
    const indicator = ind || (hr >= 12 ? 'PM' : 'AM');
    
    // Normalize to 12-hour display
    let displayHour: number;
    let period: string;

    if (indicator === 'PM' || indicator === 'مساءً') {
      period = (hr === 12) ? 'ظهرًا' : 'مساءً';
      displayHour = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);
    } else if (indicator === 'AM' || indicator === 'صباحًا') {
      period = 'صباحًا';
      displayHour = (hr === 12 || hr === 0) ? 12 : hr;
    } else if (indicator === 'ظهرًا') {
      period = 'ظهرًا';
      displayHour = 12;
    } else {
      period = hr === 12 ? 'ظهرًا' : (hr > 12 ? 'مساءً' : 'صباحًا');
      displayHour = hr === 0 ? 12 : (hr > 12 ? hr - 12 : hr);
    }

    const formattedHour = String(displayHour).padStart(2, '0');
    return { formatted: `${formattedHour}:${minutes}`, period };
  }

  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const [, hours, minutes] = match24;
    const hr = parseInt(hours, 10);
    const isPM = hr >= 12;
    const displayHour = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    const formattedHour = String(displayHour).padStart(2, '0');
    const period = hr === 12 ? "ظهرًا" : (isPM ? "مساءً" : "صباحًا");
    return { formatted: `${formattedHour}:${minutes}`, period };
  }

  return null;
}

/**
 * Format Arabic time display:
 * - If duration_minutes is provided (30 or 60): dynamically calculates end time
 *   and displays full range (handles midnight crossing cleanly e.g. "من 11:30 مساءً إلى 12:30 صباحًا").
 * - If duration_minutes is NULL: displays only start time (e.g. "12:00 ظهرًا")
 *   without inventing historical durations.
 */
export function formatArabicTime(timeStr: string, durationMinutes?: number | null): string {
  if (!timeStr) return "";
  const clean = timeStr.trim();

  // If explicit duration is provided (30 or 60), dynamically calculate end time
  if (durationMinutes === 30 || durationMinutes === 60) {
    const startTime24 = toPostgresTime(clean);
    const endTime24 = calculateEndTime24(startTime24, durationMinutes);
    
    const start = formatSingleArabicTime(startTime24);
    const end = formatSingleArabicTime(endTime24);

    if (start && end) {
      if (start.period === end.period) {
        return `من ${start.formatted} إلى ${end.formatted} ${end.period}`;
      }
      return `من ${start.formatted} ${start.period} إلى ${end.formatted} ${end.period}`;
    }
  }

  // Check if legacy timeStr already contains an explicit range
  const parts = clean.split(/\s*[-–—]\s*|\s+إلى\s+/i);
  if (parts.length >= 2) {
    const start = formatSingleArabicTime(parts[0]);
    const end = formatSingleArabicTime(parts[1]);
    if (start && end) {
      if (start.period === end.period) {
        return `من ${start.formatted} إلى ${end.formatted} ${end.period}`;
      }
      return `من ${start.formatted} ${start.period} إلى ${end.formatted} ${end.period}`;
    }
  }

  // Older record with NULL duration: DO NOT invent historical duration
  const single = formatSingleArabicTime(clean);
  if (single) {
    return `${single.formatted} ${single.period}`;
  }

  return timeStr;
}

/**
 * Get duration badge config.
 * For older records with NULL duration, returns null without inventing durations.
 */
export function getBookingDurationBadge(
  timeStr: string, 
  durationMinutes?: number | null
): { label: string; duration: 30 | 60; colorClass: string } | null {
  if (durationMinutes === 60) {
    return { label: 'ساعة كاملة', duration: 60, colorClass: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  if (durationMinutes === 30) {
    return { label: '٣٠ دقيقة', duration: 30, colorClass: 'bg-blue-50 text-blue-700 border-blue-200' };
  }

  // If durationMinutes is explicitly null or undefined, check if timeStr has an explicit range
  if (timeStr) {
    const clean = timeStr.trim();
    const parts = clean.split(/\s*[-–—]\s*|\s+إلى\s+/i);
    if (parts.length >= 2) {
      const start = formatSingleArabicTime(parts[0]);
      const end = formatSingleArabicTime(parts[1]);
      if (start && end) {
        const [sh, sm] = start.formatted.split(':').map(Number);
        const [eh, em] = end.formatted.split(':').map(Number);
        const sH24 = (start.period === 'مساءً' && sh < 12) ? sh + 12 : (start.period === 'صباحًا' && sh === 12 ? 0 : sh);
        const eH24 = (end.period === 'مساءً' && eh < 12) ? eh + 12 : (end.period === 'صباحًا' && eh === 12 ? 0 : eh);
        const diff = (eH24 * 60 + em) - (sH24 * 60 + sm);
        if (diff >= 45) {
          return { label: 'ساعة كاملة', duration: 60, colorClass: 'bg-purple-50 text-purple-700 border-purple-200' };
        }
        return { label: '٣٠ دقيقة', duration: 30, colorClass: 'bg-blue-50 text-blue-700 border-blue-200' };
      }
    }
  }

  // Older record with NULL duration: return null (no duration badge)
  return null;
}

export function formatStatus(status: string): string {
  return translateStatus(status);
}

/**
 * Format booking creation timestamp in Asia/Riyadh timezone:
 * e.g. "24/10/2026 — 05:45 ص"
 */
export function formatCreationDateTime(isoStr?: string | null): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Riyadh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(d);
    let day = '', month = '', year = '', hour = '', minute = '', dayPeriod = '';

    for (const p of parts) {
      if (p.type === 'day') day = p.value;
      else if (p.type === 'month') month = p.value;
      else if (p.type === 'year') year = p.value;
      else if (p.type === 'hour') hour = p.value;
      else if (p.type === 'minute') minute = p.value;
      else if (p.type === 'dayPeriod') {
        const val = p.value.toUpperCase();
        dayPeriod = val.includes('PM') ? 'م' : 'ص';
      }
    }

    const paddedHour = hour.padStart(2, '0');
    return `${day}/${month}/${year} — ${paddedHour}:${minute} ${dayPeriod}`;
  } catch {
    return "";
  }
}

export { formatPeopleCount };

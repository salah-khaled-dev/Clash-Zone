import { translateStatus, formatPeopleCount } from './translations';

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

  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    const [, hours, minutes, ampm] = match12;
    const hr = parseInt(hours, 10);
    const formattedHour = String(hr).padStart(2, '0');
    const period = (hr === 12 && ampm === "PM") ? "ظهرًا" : (ampm === "AM" ? "صباحًا" : "مساءً");
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

export function formatArabicTime(timeStr: string): string {
  if (!timeStr) return "";
  const clean = timeStr.trim();

  // Check if timeStr is an interval range e.g. "12:00 PM - 01:00 PM"
  const parts = clean.split(/\s*[-–—]\s*|\s+إلى\s+/i);
  if (parts.length >= 2) {
    const start = formatSingleArabicTime(parts[0]);
    const end = formatSingleArabicTime(parts[1]);
    if (start && end) {
      const periodLead = start.period === end.period ? "" : ` ${start.period}`;
      return `من ${start.formatted}${periodLead} إلى ${end.formatted} ${end.period}`;
    }
  }

  const single = formatSingleArabicTime(clean);
  if (single) {
    return `${single.formatted} ${single.period}`;
  }

  return timeStr;
}

export function getBookingDurationBadge(timeStr: string): { label: string; duration: 30 | 60; colorClass: string } {
  if (!timeStr) return { label: '٣٠ دقيقة', duration: 30, colorClass: 'bg-blue-50 text-blue-700 border-blue-200' };
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
    }
  }
  return { label: '٣٠ دقيقة', duration: 30, colorClass: 'bg-blue-50 text-blue-700 border-blue-200' };
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


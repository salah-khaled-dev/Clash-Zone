import { translateService, translateStatus, translateVehicle, translateCustomerType } from './translations';

const arabicDateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return arabicDateFormatter.format(date);
  } catch {
    return dateStr;
  }
}


export function formatArabicTime(timeStr: string): string {
  if (!timeStr) return "";
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/);
  if (match) {
    const [, hours, minutes, ampm] = match;
    const hr = parseInt(hours, 10);
    const period = (hr === 12 && ampm === "PM") ? "ظهرًا" : (ampm === "AM" ? "صباحًا" : "مساءً");
    return `${hours}:${minutes} ${period}`;
  }
  return timeStr;
}

export function formatVehicleName(carName: string): string {
  return translateVehicle(carName);
}

export function formatServiceName(service: string): string {
  return translateService(service);
}

export function formatStatus(status: string): string {
  return translateStatus(status);
}

export function formatCustomerType(type: string): string {
  return translateCustomerType(type);
}


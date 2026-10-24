export const WORKING_HOURS = {
  start: 12, // 12:00 PM
  end: 22   // 10:00 PM
};

export interface TimeSlot {
  key: string;   // e.g. "12:00 PM" or "02:00 PM"
  label: string; // e.g. "12:00 ظهرًا" or "02:00 مساءً"
}

export function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = WORKING_HOURS.start; hour <= WORKING_HOURS.end; hour++) {
    // Determine AM/PM
    const isPM = hour >= 12;
    const displayHour = hour > 12 ? hour - 12 : hour;
    const formattedHour = String(displayHour).padStart(2, '0');
    const ampm = isPM ? "PM" : "AM";
    const key = `${formattedHour}:00 ${ampm}`;
    
    // Arabic label
    const period = hour === 12 ? "ظهرًا" : (isPM ? "مساءً" : "صباحًا");
    const label = `${formattedHour}:00 ${period}`;
    
    slots.push({ key, label });
  }
  
  return slots;
}

export function normalizeTimeSlot(timeStr: string): string {
  if (!timeStr) return '';
  const clean = timeStr.trim().toUpperCase();

  // Match 12-hour format: "02:00 PM" or "2:00 PM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    const hr = parseInt(match12[1], 10);
    const min = match12[2];
    const ampm = match12[3];
    return `${String(hr).padStart(2, '0')}:${min} ${ampm}`;
  }

  // Match 24-hour format: "14:00" or "14:00:00"
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


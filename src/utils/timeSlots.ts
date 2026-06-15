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

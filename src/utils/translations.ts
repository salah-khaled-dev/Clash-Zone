export const SERVICE_TRANSLATIONS: Record<string, string> = {
  "Paint Protection Film": "حماية الطلاء PPF",
  "Paint Protection Film (PPF)": "حماية الطلاء PPF",
  "حماية الطلاء PPF": "حماية الطلاء PPF",
  "Nano Ceramic Coating": "نانو سيراميك",
  "Nano Ceramic": "نانو سيراميك",
  "نانو سيراميك": "نانو سيراميك",
  "Thermal Insulation": "عزل حراري",
  "عزل حراري": "عزل حراري",
  "Window Tinting": "تظليل النوافذ",
  "تظليل النوافذ": "تظليل النوافذ",
  "غسيل وتلميع": "غسيل وتلميع",
  "Wash and Polish": "غسيل وتلميع",
  "خدمة أخرى": "خدمة أخرى",
  "Other Service": "خدمة أخرى"
};

export const STATUS_TRANSLATIONS: Record<string, string> = {
  "جديد": "جديد",
  "new": "جديد",
  "Pending": "جديد",
  "pending": "جديد",
  
  "تم التواصل": "تم التواصل",
  "contacted": "تم التواصل",
  
  "تم التأكيد": "تم التأكيد",
  "confirmed": "تم التأكيد",
  "Completed": "تم التأكيد",
  
  "مكتمل": "مكتمل",
  "completed": "مكتمل",
  
  "ملغي": "ملغي",
  "cancelled": "ملغي",
  "Cancelled": "ملغي"
};

export const BRANCH_TRANSLATIONS: Record<string, string> = {
  "Riyadh": "فرع الرياض - حي المروج",
  "فرع الرياض": "فرع الرياض - حي المروج",
  "فرع الرياض - حي المروج": "فرع الرياض - حي المروج"
};

export const CUSTOMER_TYPE_TRANSLATIONS: Record<string, string> = {
  "new": "عميل جديد",
  "returning": "عميل سابق",
  "vip": "عميل VIP",
  "referred": "عميل محول من عميل آخر"
};

export function translateService(service: string): string {
  return SERVICE_TRANSLATIONS[service] || service;
}

export function translateStatus(status: string): string {
  return STATUS_TRANSLATIONS[status] || status;
}

export function translateBranch(branch: string): string {
  return BRANCH_TRANSLATIONS[branch] || "فرع الرياض - حي المروج";
}

export function translateCustomerType(type: string): string {
  return CUSTOMER_TYPE_TRANSLATIONS[type] || type;
}

export const VEHICLE_TRANSLATIONS: Record<string, string> = {
  "toyota camry": "تويوتا كامري",
  "mercedes c200": "مرسيدس C200",
  "tesla model 3": "تسلا موديل 3",
  "ford mustang": "فورد موستانج"
};

export function translateVehicle(carName: string): string {
  if (!carName) return "";
  const clean = carName.trim().toLowerCase();
  for (const [eng, arb] of Object.entries(VEHICLE_TRANSLATIONS)) {
    if (clean.includes(eng)) {
      const yearMatch = carName.match(/\d{4}/);
      const yearSuffix = yearMatch ? ` ${yearMatch[0]}` : "";
      return `${arb}${yearSuffix}`;
    }
  }
  return carName;
}

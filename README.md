# War Zone — Booking Management System

War Zone Booking Management System is a professional, production-ready portal and booking management system designed specifically for **War Zone**, an action-packed tactical entertainment and arena center. 

The system features a sleek tactical dark gaming aesthetic with subtle crimson accents, full Arabic Right-to-Left (RTL) alignment, interactive timelines, advanced analytics, PostgreSQL Realtime synchronization, and robust Supabase authentication gates.

---

## 📖 Project Overview

### Purpose
War Zone coordinates arena games, tactical matches, corporate events, student activities, and birthday celebrations. The portal manages reservations, tracking participant numbers and booking categories across scheduled slots.

### Key Booking Fields
1. **Customer Name:** Full name of the organizer / player.
2. **Phone Number:** Contact mobile number (formatted for direct calling and WhatsApp).
3. **Number of People:** Positive integer indicating the number of participants.
4. **Booking Category:** Exactly one of the 7 predefined War Zone categories:
   - `كول سنتر`
   - `عميل جديد`
   - `عميل سابق`
   - `عيد ميلاد`
   - `جامعة`
   - `إيفنت خارجي`
   - `مدرسة`
5. **Booking Date & Time Slot:** Target game date and hourly time slot.
6. **Additional Notes:** Optional custom requests or event details.

### Status Progression
Bookings transition through standard operational statuses:
`جديد` (New) ➔ `تم التأكيد` (Confirmed) ➔ `مكتمل` (Completed) or `ملغي` (Cancelled).

---

## 🌟 Key Features

* 📅 **Interactive Calendar & Timelines:** Weekly interactive visual schedule with drag-and-drop rescheduling capabilities.
* 📊 **Analytics & Reporting:** Real-time metrics panel showing total bookings, participants count, today's schedule, upcoming events, and category distributions.
* ⚡ **PostgreSQL Realtime Updates:** Instant live updates across all active screens when bookings are inserted, modified, or cancelled.
* 🔐 **Supabase Authentication Gate & Role-Based Access Control:** Secure access control for Admin, Manager, and Employee roles.
* 👥 **Employee Management:** Role-aware staff management with granular permission restrictions.
* 💬 **Automated WhatsApp & Phone Integration:** One-click prefilled WhatsApp confirmation messages and direct calls.
* 📥 **CSV Export:** Fast export with UTF-8 BOM encoding for seamless Arabic text compatibility in Excel.
* 🎨 **Modern SaaS Light Dashboard:** Clean, professional light aesthetic with restrained War Zone red accents and floating menus.
* 🌍 **Native Arabic RTL Design:** Fully responsive design tailored for mobile, tablet, and desktop viewports.

---

## 🛠️ Technology Stack

* **Frontend Library:** React 19 (Hooks, Context, Memoization)
* **Build Tool & Dev Server:** Vite 8 & TypeScript
* **Styling & Design System:** Tailwind CSS v4 & PostCSS
* **Icons:** React Icons 5
* **Backend & DB Provider:** Supabase (PostgreSQL, Supabase Auth, PostgreSQL Realtime)

---

## 📂 Project Structure

```
d:\Calendar\
├── index.html            # Main HTML entry point (War Zone branding)
├── package.json          # Dependency configurations and scripts
├── supabase/
│   └── migrations/
│       ├── 01_init.sql          # Initial schema
│       ├── 02_crm_pivot.sql     # CRM tracking columns
│       └── 03_warzone_pivot.sql # Safe migration to War Zone (people_count & 7 categories)
└── src/
    ├── App.tsx                  # Main War Zone dashboard
    ├── components/              # Modular UI components
    │   ├── BookingForm.tsx      # Add booking form (people_count & 7 categories)
    │   ├── BookingCardRow.tsx   # Booking card list row
    │   ├── BookingDetailsModal.tsx # Booking details modal
    │   ├── EditBookingModal.tsx # Edit booking modal
    │   ├── CalendarView.tsx     # Interactive calendar timeline
    │   ├── FilterToolbar.tsx    # Search & category filters
    │   ├── StatsSection.tsx     # Metrics & category analytics
    │   ├── LoginScreen.tsx      # Authentication gate
    │   ├── Logo.tsx             # War Zone tactical logo
    │   ├── StatusBadge.tsx      # Status badges
    │   └── SuccessScreen.tsx    # Confirmation voucher
    ├── services/
    │   └── bookings.service.ts  # Supabase client service
    ├── types/
    │   ├── booking.ts           # War Zone TypeScript types & 7 categories
    │   └── database.ts          # Database schemas
    └── utils/
        ├── bookingFormatters.ts # Date/time and participant count formatters
        ├── timeSlots.ts         # Available time slots generator
        └── translations.ts      # Status and category translations
```

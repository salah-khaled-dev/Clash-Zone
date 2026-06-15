# Infinity Bright Portal — Premium CRM Booking Management System

Infinity Bright Portal is a high-end, production-grade Customer Relationship Management (CRM) and Booking Management System designed specifically for **Infinity Bright**, a luxury car detailing, thermal insulation, and Paint Protection Film (PPF) application center. 

The system features a bespoke luxury dark-and-gold design aesthetic, full Arabic Right-to-Left (RTL) alignment, interactive calendars, advanced dashboards, PostgreSQL Postgres Realtime synchronization, and robust Supabase authentication gates.

---

## 📖 Project Overview

### Business Purpose
Infinity Bright serves owners of high-end luxury and sports vehicles. The portal helps manage high-value service appointments, tracking vehicle care lifecycles from booking insertion through followup and completion.

### CRM Workflow
1. **Booking Creation:** Staff records appointment details including customer name, phone, vehicle parameters (make, model, year), service type, target date, and time slot.
2. **Contact & Follow-up Tracking:** CRM logs the `last_contact_date` and schedules a `next_followup_date`.
3. **Status Progression:** Bookings move through defined statuses: `جديد` (New) ➔ `تم التواصل` (Contacted) ➔ `تم التأكيد` (Confirmed) ➔ `مكتمل` (Completed) or `ملغي` (Cancelled).
4. **Instant Client Engagement:** Quick links format templates for mobile dialing (`tel:`) and instant pre-filled WhatsApp confirmation messages (`wa.me`).

---

## 🌟 Key Features

*   📅 **Interactive Calendar & Timelines:** Interactive calendar visualization of schedule load with drag-and-drop rescheduling capabilities.
*   📊 **Analytics & Reporting:** Interactive statistics panel displaying total customer volume, new client conversions, service distributions, and exportable CSV reports with UTF-8 BOM compatibility.
*   ⚡ **PostgreSQL Realtime Updates:** Incremental data syncing across open screens without page refreshes.
*   🔐 **Supabase Authentication Gate:** Safe login screen securing access to all operational data.
*   🎨 **Cinematic UI/UX Animations:** Parallax 3D visual panels, animated meshes, ambient diagonal glows, noise textures, and micro-interactions powered by Framer Motion.
*   ✍️ **Designer Signature Badge:** A beautiful, glowing signature badge replacing traditional footers.
*   🌍 **Native Arabic RTL Design:** Responsive design tailored for Arabic web reading directions.

---

## 🛠️ Technology Stack

*   **Frontend Library:** React 19 (Hooks, Context, Memoization)
*   **Build Tool & Dev Server:** Vite 8 & TypeScript
*   **Styling & Design System:** Tailwind CSS v4 & PostCSS
*   **Animations:** Framer Motion 12
*   **Icons:** React Icons 5 & Lucide React 1
*   **Backend & DB Provider:** Supabase (PostgreSQL, Supabase Auth, PostgreSQL Realtime)

---

## 📂 Project Structure

```
d:\Calendar\
├── .env                  # Private local environment variables (Git ignored)
├── index.html            # Main HTML entry point
├── package.json          # Dependency configurations and build scripts
├── postcss.config.js     # PostCSS configurations
├── tsconfig.json         # TypeScript configurations
├── vite.config.ts        # Vite configuration file
├── supabase/
│   └── migrations/       # SQL database initialization and schema alterations
│       ├── 01_init.sql       # Initial schemas, tables, indexes, and RLS policies
│       └── 02_crm_pivot.sql  # CRM-specific columns, constraints, and status defaults
└── src/
    ├── main.tsx          # React application entry node
    ├── App.tsx           # Global routing, Postgres Realtime listeners, Auth gate
    ├── index.css         # Styling, luxury typography, custom keyframes, scrollbars
    ├── assets/           # Media resources (Logo, luxury PPF detailing image)
    ├── lib/              # Client setups (Supabase connector config)
    ├── services/         # Database services (Supabase CRUD wrapper logic)
    ├── types/            # TypeScript interfaces (bookings, statuses)
    └── components/       # Component Library
        ├── Logo.tsx              # Animated brand logo stack
        ├── LoginScreen.tsx       # Luxury split-screen login card with parallax & glow
        ├── SignatureFooter.tsx   # Glassmorphic glowing designer signature badge
        ├── StatsSection.tsx      # Analytical dashboards & KPI displays
        ├── BookingForm.tsx       # Booking creation interface
        ├── CalendarView.tsx      # Interactive calendar panel
        ├── FilterToolbar.tsx     # Advanced query, status filter, CSV exporter bar
        ├── BookingCardRow.tsx    # Responsive customer action cards
        ├── BookingDetailsModal.tsx # Inspection overlays
        ├── EditBookingModal.tsx  # Customer record modifiers
        ├── LoadingSkeleton.tsx   # Visual skeleton placeholders
        └── ToastProvider.tsx     # Customized micro-notifications
```

---

## 🗄️ Database Documentation

The backend is hosted on Supabase PostgreSQL. Below is the schema layout:

### 1. `branches` Table
Tracks Infinity Bright center branches.
*   `id` (UUID, Primary Key): Unique branch code.
*   `name_ar` (TEXT, Not Null): Arabic branch label.
*   `name_en` (TEXT, Not Null): English branch label.
*   `address` (TEXT): Location address text.
*   `is_active` (BOOLEAN): Status toggle.
*   `created_at` (TIMESTAMP WITH TIME ZONE)

### 2. `services` Table
Stores details of offered detailing, thermal isolation, and coating options.
*   `id` (UUID, Primary Key): Unique service code.
*   `name_ar` (TEXT, Not Null): Arabic service name.
*   `name_en` (TEXT, Not Null): English service name.
*   `description` (TEXT): Description of the service.
*   `duration_minutes` (INTEGER): Duration in minutes.
*   `is_active` (BOOLEAN): Status toggle.
*   `created_at` (TIMESTAMP WITH TIME ZONE)

### 3. `bookings` Table
Primary data container for CRM customer interactions and details.
*   `id` (UUID, Primary Key): Unique booking code.
*   `customer_name` (TEXT, Not Null)
*   `customer_phone` (TEXT, Not Null)
*   `vehicle_make` (TEXT, Not Null)
*   `vehicle_model` (TEXT, Not Null)
*   `vehicle_year` (TEXT)
*   `service_type` (TEXT, Not Null)
*   `branch_name` (TEXT, Not Null)
*   `booking_date` (DATE, Not Null)
*   `time_slot` (TEXT, Not Null)
*   `status` (TEXT): State (`جديد`, `تم التواصل`, `تم التأكيد`, `مكتمل`, `ملغي`).
*   `notes` (TEXT): Followup details.
*   `customer_source` (TEXT): Marketing channel.
*   `customer_type` (TEXT): Customer type (`new`, `returning`, `vip`, `referred`).
*   `last_contact_date` (TIMESTAMP WITH TIME ZONE)
*   `next_followup_date` (TIMESTAMP WITH TIME ZONE)
*   `created_at` (TIMESTAMP WITH TIME ZONE)
*   `updated_at` (TIMESTAMP WITH TIME ZONE)

### Constraints & Indexes
*   **Duplicate Prevention:** `unique_booking_date_slot` enforces a UNIQUE constraint on `(booking_date, time_slot)` to prevent double booking.
*   **Performance Indexes:**
    *   `idx_bookings_booking_date` on `booking_date`
    *   `idx_bookings_status` on `status`
    *   `idx_bookings_customer_phone` on `customer_phone`
    *   `idx_bookings_branch_name` on `branch_name`
    *   `idx_bookings_service_type` on `service_type`

### Row-Level Security (RLS) & Realtime Configuration
*   **Branches & Services Policies:** Public read-only SELECT permissions (`Allow public read access` for active entries).
*   **Bookings Policies:** Public/anon access permissions allowing operations for CRM workflows.
*   **Realtime Setup:** `bookings` is added to the `supabase_realtime` publication to enable PostgreSQL realtime subscription channels.

---

## 🔒 Authentication Flow

Security is established through **Supabase Authentication (GoTrue)**:
1.  **Gatekeeper Check:** On app initialization, `App.tsx` calls `supabase.auth.getSession()` to check for an active user token.
2.  **Redirect & Gate:** If no session is found, mounting of the main layout is blocked and users are locked into the `<LoginScreen />` component.
3.  **Active Listeners:** `supabase.auth.onAuthStateChange()` watches for logins or logouts, instantly updating session states client-side.
4.  **Logout Validation:** Logging out triggers `supabase.auth.signOut()`, completely invalidating cookies and session tokens.

---

## ⚙️ Environment Variables

Copy `.env.example` into a local `.env` file at the root directory:

```env
# Supabase Connection URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Public Anonymous API Key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
> [!IMPORTANT]
> The `.env` file is excluded from git tracking via `.gitignore`. Never commit actual API keys or database connection strings to public repositories.

---

## 🚀 Installation & Local Development

1.  **Clone and enter directory:**
    ```bash
    cd infinity-bright-portal
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Launch local development server:**
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Production Compilation

To compile the application bundle for production:
```bash
npm run build
```
This triggers type validation (`tsc -b`) and bundles files using Vite. The output assets are written to the `/dist` directory, fully minified and optimized.

---

## 🌐 Production Deployment

The project can be deployed seamlessly to Vercel, Netlify, or AWS Amplify:
1.  **Repository Connection:** Connect the repository to your hosting service.
2.  **Build Command Configuration:** Set build command to `npm run build` and output folder to `dist`.
3.  **Environment Variables Setup:** Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` inside the hosting dashboard.
4.  **Security Hardening:** Ensure database row-level security (RLS) is enabled and service keys are protected.

---

## 🛡️ Security Notes

*   **Public Client Security:** The client uses `anon_key` which is restricted in privileges on PostgreSQL. Ensure no service keys (`service_role` keys) are exposed in client builds.
*   **Least Privilege Database Access:** Modify PostgreSQL RLS rules inside Supabase if restrictions on booking manipulation are required.
*   **Safe Links:** All external designer and portfolio links utilize `target="_blank"` and `rel="noopener noreferrer"` to prevent tab-nabbing vulnerabilities.

---

## ✍️ Ownership & Branding

*   **Branding:** Infinity Bright Car Care Center
*   **Designed & Developed by:** [Salah Khaled](https://salahkhaled.com/en)
*   **Signature Footer Link:** Portfolio link integrated at the bottom of all layouts.

---

## 📝 Changelog

*   **v1.0.0:** Initial project boilerplate set up with React, Tailwind CSS, Vite.
*   **v2.0.0:** Configured database structure in Supabase (bookings, branches, services).
*   **v3.0.0:** Integrated PostgreSQL Realtime events, stats dashboards, drag-and-drop calendars, and CSV export functionality.
*   **v4.0.0:** Embedded Supabase Authentication gates, luxury dark/gold aesthetic, parallax animations, floating mesh gradients, and the designer signature badge.

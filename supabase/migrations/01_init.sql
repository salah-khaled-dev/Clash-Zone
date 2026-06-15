-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year TEXT,
    service_type TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add constraint to prevent duplicate booking for same date and time slot
ALTER TABLE bookings ADD CONSTRAINT unique_booking_date_slot UNIQUE (booking_date, time_slot);

-- 4. Create Database Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_branch_name ON bookings(branch_name);
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);

-- 5. Row-Level Security (RLS) Policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Branches & Services RLS: Public read-only
CREATE POLICY "Allow public read access to branches" 
ON branches FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to services" 
ON services FOR SELECT USING (is_active = true);

-- Bookings RLS
-- Public/anon role can perform all CRM actions on bookings (internal CRM)
CREATE POLICY "Allow public insert to bookings" 
ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to bookings" 
ON bookings FOR SELECT USING (true);

CREATE POLICY "Allow public update access to bookings" 
ON bookings FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to bookings" 
ON bookings FOR DELETE USING (true);

-- 6. Seed Data
-- Seed Riyadh Branch
INSERT INTO branches (id, name_ar, name_en, address, is_active)
VALUES 
  ('8f0e5b72-7489-42b7-8178-5db06ab787c8', 'فرع الرياض', 'Riyadh Branch', 'حي المروج، الرياض', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Services
INSERT INTO services (id, name_ar, name_en, description, duration_minutes, is_active)
VALUES
  ('a8385a49-9df7-4638-b7e1-cb52f7596ff1', 'حماية الطلاء PPF', 'Paint Protection Film', 'أفلام حماية طلاء المركبات الفاخرة ضد الخدوش والعوامل الجوية', 180, true),
  ('a8385a49-9df7-4638-b7e1-cb52f7596ff2', 'نانو سيراميك', 'Nano Ceramic Coating', 'طبقات نانو سيراميك لحماية ولمعان فائق يدوم طويلاً', 120, true),
  ('a8385a49-9df7-4638-b7e1-cb52f7596ff3', 'عزل حراري', 'Thermal Insulation', 'أفلام عزل الحرارة الفائقة للنوافذ والزجاج لراحة أكبر', 90, true),
  ('a8385a49-9df7-4638-b7e1-cb52f7596ff4', 'تظليل النوافذ', 'Window Tinting', 'درجات تظليل وحماية ممتازة متوافقة مع الأنظمة المرورية', 60, true)
ON CONFLICT (id) DO NOTHING;

-- Enable Realtime for bookings
alter publication supabase_realtime add table bookings;

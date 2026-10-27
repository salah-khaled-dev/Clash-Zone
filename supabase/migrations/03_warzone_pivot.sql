-- Migration 03: Transform to CLASH ZONE Booking Management System
-- Safe, incremental, non-destructive migration preserving existing booking records

-- 1. Add people_count column (positive integer for number of participants)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS people_count INTEGER DEFAULT 1;

-- 2. Add category column for the 7 CLASH ZONE booking categories
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS category TEXT;

-- 3. Backfill existing bookings safely so no data is lost or corrupted
UPDATE bookings 
SET people_count = 1 
WHERE people_count IS NULL OR people_count < 1;

-- Map previous legacy marketing sources to valid CLASH ZONE categories if available, or default to 'عميل جديد'
UPDATE bookings 
SET category = CASE 
    WHEN customer_source = 'كول سنتر' THEN 'كول سنتر'
    WHEN customer_source = 'عميل جديد' THEN 'عميل جديد'
    WHEN customer_source = 'عميل سابق' THEN 'عميل سابق'
    WHEN customer_source = 'عيد ميلاد' THEN 'عيد ميلاد'
    WHEN customer_source = 'جامعة' THEN 'جامعة'
    WHEN customer_source = 'إيفنت خارجي' THEN 'إيفنت خارجي'
    WHEN customer_source = 'مدرسة' THEN 'مدرسة'
    WHEN customer_type = 'returning' THEN 'عميل سابق'
    ELSE 'عميل جديد'
END
WHERE category IS NULL;

-- 4. Set NOT NULL and positive constraint on people_count
ALTER TABLE bookings ALTER COLUMN people_count SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN people_count SET DEFAULT 1;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_bookings_people_count_positive'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT chk_bookings_people_count_positive CHECK (people_count > 0);
    END IF;
END $$;

-- 5. Drop NOT NULL constraints from legacy automotive columns safely
ALTER TABLE bookings ALTER COLUMN vehicle_make DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN vehicle_model DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN service_type DROP NOT NULL;

-- 6. Drop existing category check constraints if any, and add CLASH ZONE 7 categories constraint
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'bookings'::regclass 
          AND contype = 'c' 
          AND conname LIKE '%category%'
    LOOP
        EXECUTE 'ALTER TABLE bookings DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

ALTER TABLE bookings ADD CONSTRAINT chk_bookings_category 
CHECK (category IN ('كول سنتر', 'عميل جديد', 'عميل سابق', 'عيد ميلاد', 'جامعة', 'إيفنت خارجي', 'مدرسة'));

-- 7. Add index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_bookings_category ON bookings(category);
CREATE INDEX IF NOT EXISTS idx_bookings_people_count ON bookings(people_count);

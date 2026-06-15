-- 1. Add new CRM tracking columns if they do not exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_source TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_type TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS next_followup_date TIMESTAMP WITH TIME ZONE;

-- 2. Modify branch_name default value
ALTER TABLE bookings ALTER COLUMN branch_name SET DEFAULT 'فرع الرياض - حي المروج';

-- 3. Safely drop the old status check constraint and apply new status checks
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Find and drop all check constraints on table bookings that check the status column
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'bookings'::regclass 
          AND contype = 'c' 
          AND conname LIKE '%status%'
    LOOP
        EXECUTE 'ALTER TABLE bookings DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 4. Apply new check constraint for statuses: جديد, تم التواصل, تم التأكيد, مكتمل, ملغي
ALTER TABLE bookings ADD CONSTRAINT chk_bookings_status CHECK (status IN ('جديد', 'تم التواصل', 'تم التأكيد', 'مكتمل', 'ملغي'));

-- 5. Change default status to 'جديد' (New) for new bookings
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'جديد';

-- 6. Ensure RLS policies are aligned with public/anon access for the internal CRM
DROP POLICY IF EXISTS "Allow authenticated read access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated update access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated delete access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public insert to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public read access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public update access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public delete access to bookings" ON bookings;

CREATE POLICY "Allow public insert to bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public update access to bookings" ON bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete access to bookings" ON bookings FOR DELETE USING (true);


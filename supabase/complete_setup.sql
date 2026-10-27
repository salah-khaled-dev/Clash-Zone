-- ==============================================================================
-- CLASH ZONE / WARZONE - COMPLETE DATABASE SETUP SCRIPT FOR NEW SUPABASE PROJECT
-- Project Ref: wcdcnqyhvbdarzzhrkft
-- ==============================================================================

BEGIN;

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create User Roles Table (RBAC)
CREATE TABLE IF NOT EXISTS public.warzone_user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'unassigned' CHECK (role IN ('admin', 'manager', 'employee', 'unassigned')),
    full_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Automatic User Sync Trigger: Whenever a user is created in auth.users, automatically add them to warzone_user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count integer;
  default_role text;
BEGIN
  -- Check if this is the first user in the system -> make them 'admin', otherwise 'unassigned'
  SELECT count(*) INTO user_count FROM public.warzone_user_roles;
  
  IF user_count = 0 THEN
    default_role := 'admin';
  ELSE
    default_role := 'unassigned';
  END IF;

  INSERT INTO public.warzone_user_roles (user_id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    default_role,
    true
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth.users into warzone_user_roles if any exist already
INSERT INTO public.warzone_user_roles (user_id, email, full_name, role, is_active)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
    CASE WHEN ROW_NUMBER() OVER (ORDER BY created_at ASC) = 1 THEN 'admin' ELSE 'unassigned' END, 
    true
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 3. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.warzone_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    number_of_people INTEGER NOT NULL DEFAULT 1 CHECK (number_of_people > 0),
    category TEXT NOT NULL CHECK (category IN ('كول سنتر', 'عميل جديد', 'عميل سابق', 'عيد ميلاد', 'جامعة', 'إيفنت خارجي', 'مدرسة')),
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes IN (30, 60)),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_warzone_bookings_date ON public.warzone_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_warzone_bookings_status ON public.warzone_bookings(status);
CREATE INDEX IF NOT EXISTS idx_warzone_bookings_phone ON public.warzone_bookings(phone);
CREATE INDEX IF NOT EXISTS idx_warzone_bookings_category ON public.warzone_bookings(category);
CREATE INDEX IF NOT EXISTS idx_warzone_bookings_created_by ON public.warzone_bookings(created_by);

-- 4. RBAC Helper Functions
CREATE OR REPLACE FUNCTION public.warzone_current_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.warzone_user_roles WHERE user_id = auth.uid() AND is_active = true),
    'unassigned'
  );
$$;

CREATE OR REPLACE FUNCTION public.warzone_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.warzone_user_roles
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.warzone_is_manager_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.warzone_user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
  );
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.warzone_current_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.warzone_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.warzone_is_manager_or_admin() TO authenticated;

-- 5. Booking Guard Functions & Triggers
-- Insert Trigger: Bind creator and set timestamp
CREATE OR REPLACE FUNCTION public.warzone_guard_booking_inserts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  NEW.created_at := COALESCE(NEW.created_at, NOW());
  NEW.updated_at := COALESCE(NEW.updated_at, NOW());
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS warzone_insert_guard ON public.warzone_bookings;
CREATE TRIGGER warzone_insert_guard
BEFORE INSERT ON public.warzone_bookings
FOR EACH ROW
EXECUTE FUNCTION public.warzone_guard_booking_inserts();

-- Update Trigger: Protect immutable fields & check staff permissions
CREATE OR REPLACE FUNCTION public.warzone_guard_booking_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.warzone_current_role();

  -- Verify user is an authorized, active staff member
  IF COALESCE(v_role, '') NOT IN ('admin', 'manager', 'employee') THEN
    RAISE EXCEPTION 'Unauthorized booking update: user has no active staff role'
      USING ERRCODE = '42501';
  END IF;

  -- Protect immutable system columns
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Booking ID cannot be changed'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Booking creation timestamp cannot be modified'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Booking creator cannot be modified'
      USING ERRCODE = '42501';
  END IF;

  -- Validate participant count is positive
  IF NEW.number_of_people IS NOT NULL AND NEW.number_of_people < 1 THEN
    RAISE EXCEPTION 'Number of people must be at least 1'
      USING ERRCODE = '23514';
  END IF;

  -- Auto-update timestamp
  NEW.updated_at = NOW();

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS warzone_update_guard ON public.warzone_bookings;
CREATE TRIGGER warzone_update_guard
BEFORE UPDATE ON public.warzone_bookings
FOR EACH ROW
EXECUTE FUNCTION public.warzone_guard_booking_updates();

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.warzone_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warzone_user_roles ENABLE ROW LEVEL SECURITY;

-- warzone_bookings RLS
DROP POLICY IF EXISTS "Warzone Select Bookings" ON public.warzone_bookings;
CREATE POLICY "Warzone Select Bookings" ON public.warzone_bookings
FOR SELECT TO authenticated
USING (
  public.warzone_current_role() IN ('admin', 'manager', 'employee')
);

DROP POLICY IF EXISTS "Warzone Insert Bookings" ON public.warzone_bookings;
CREATE POLICY "Warzone Insert Bookings" ON public.warzone_bookings
FOR INSERT TO authenticated
WITH CHECK (
  public.warzone_current_role() IN ('admin', 'manager', 'employee')
);

DROP POLICY IF EXISTS "Warzone Update Bookings" ON public.warzone_bookings;
CREATE POLICY "Warzone Update Bookings" ON public.warzone_bookings
FOR UPDATE TO authenticated
USING (
  public.warzone_current_role() IN ('admin', 'manager', 'employee')
)
WITH CHECK (
  public.warzone_current_role() IN ('admin', 'manager', 'employee')
);

DROP POLICY IF EXISTS "Warzone Delete Bookings" ON public.warzone_bookings;
CREATE POLICY "Warzone Delete Bookings" ON public.warzone_bookings
FOR DELETE TO authenticated
USING (
  public.warzone_is_manager_or_admin()
);

-- warzone_user_roles RLS
DROP POLICY IF EXISTS "Warzone Select User Roles" ON public.warzone_user_roles;
CREATE POLICY "Warzone Select User Roles" ON public.warzone_user_roles
FOR SELECT TO authenticated
USING (
  (user_id = auth.uid()) OR (public.warzone_current_role() IN ('admin', 'manager', 'employee'))
);

DROP POLICY IF EXISTS "Warzone Admin Manage Roles" ON public.warzone_user_roles;
CREATE POLICY "Warzone Admin Manage Roles" ON public.warzone_user_roles
FOR ALL TO authenticated
USING (public.warzone_is_admin())
WITH CHECK (public.warzone_is_admin());

-- 7. View: warzone_bookings_feed
DROP VIEW IF EXISTS public.warzone_bookings_feed CASCADE;
CREATE VIEW public.warzone_bookings_feed 
WITH (security_invoker = true)
AS
SELECT 
  b.id,
  b.customer_name,
  b.phone,
  b.number_of_people,
  b.category,
  b.booking_date,
  b.booking_time,
  b.duration_minutes,
  b.status,
  b.notes,
  b.created_at,
  b.updated_at,
  b.created_by,
  COALESCE(u.full_name, 'غير مسجل') AS creator_name,
  COALESCE(u.role, 'غير مسجل') AS creator_role
FROM public.warzone_bookings b
LEFT JOIN public.warzone_user_roles u ON b.created_by = u.user_id;

GRANT SELECT ON public.warzone_bookings_feed TO authenticated, anon, service_role;

-- 8. Compatibility Aliases (to support both warzone_* and ClashZone_* aliases)
DROP VIEW IF EXISTS public."ClashZone_bookings_feed" CASCADE;
CREATE VIEW public."ClashZone_bookings_feed" WITH (security_invoker = true) AS 
SELECT * FROM public.warzone_bookings_feed;
GRANT SELECT ON public."ClashZone_bookings_feed" TO authenticated, anon, service_role;

-- 9. Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'warzone_bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.warzone_bookings;
  END IF;
END $$;

ALTER TABLE public.warzone_bookings REPLICA IDENTITY FULL;

COMMIT;

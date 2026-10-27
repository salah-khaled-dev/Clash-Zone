-- ═══════════════════════════════════════════════════════════════════════════
-- CLASH ZONE MIGRATION 06: Employee Management, Full Name & Booking Creator Tracking
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Add full_name and is_active to public.ClashZone_user_roles
ALTER TABLE public.ClashZone_user_roles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Populate default full names for existing accounts
UPDATE public.ClashZone_user_roles
SET full_name = 'أحمد صلاح'
WHERE email = 'admin@bright.com' AND (full_name IS NULL OR full_name = '');

UPDATE public.ClashZone_user_roles
SET full_name = 'صلاح خالد'
WHERE email = 'salahkhaled9899@gmail.com' AND (full_name IS NULL OR full_name = '');

UPDATE public.ClashZone_user_roles
SET full_name = 'مستخدم تجريبي'
WHERE email = 'salahkhaled80@gmail.com' AND (full_name IS NULL OR full_name = '');

-- 3. Add created_by column to public.ClashZone_bookings
ALTER TABLE public.ClashZone_bookings
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.ClashZone_bookings
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- 4. Update ClashZone_current_role to check is_active
CREATE OR REPLACE FUNCTION public.ClashZone_current_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.ClashZone_user_roles WHERE user_id = auth.uid() AND is_active = true),
    'unassigned'
  );
$$;

-- 5. Update ClashZone_guard_booking_updates trigger function to protect created_by
CREATE OR REPLACE FUNCTION public.ClashZone_guard_booking_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.ClashZone_current_role();

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

-- 6. Insert trigger to guarantee created_by and created_at on INSERT
CREATE OR REPLACE FUNCTION public.ClashZone_guard_booking_inserts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Always bind creator to the authenticated user UID if available
  IF auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  NEW.created_at := COALESCE(NEW.created_at, NOW());
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS ClashZone_insert_guard ON public.ClashZone_bookings;
CREATE TRIGGER ClashZone_insert_guard
BEFORE INSERT ON public.ClashZone_bookings
FOR EACH ROW
EXECUTE FUNCTION public.ClashZone_guard_booking_inserts();

-- 7. Update RLS policies on ClashZone_user_roles to allow active staff to read names
DROP POLICY IF EXISTS "CLASH ZONE Select User Roles" ON public.ClashZone_user_roles;
CREATE POLICY "CLASH ZONE Select User Roles"
ON public.ClashZone_user_roles
FOR SELECT
TO authenticated
USING (
  (user_id = auth.uid()) 
  OR (public.ClashZone_current_role() IN ('admin', 'manager', 'employee'))
);

-- Admin manage roles policy remains strictly admin-only
DROP POLICY IF EXISTS "CLASH ZONE Admin Manage Roles" ON public.ClashZone_user_roles;
CREATE POLICY "CLASH ZONE Admin Manage Roles"
ON public.ClashZone_user_roles
FOR ALL
TO authenticated
USING (public.ClashZone_is_admin())
WITH CHECK (public.ClashZone_is_admin());

-- 8. Create unified bookings feed view with creator display name
DROP VIEW IF EXISTS public.ClashZone_bookings_feed;
CREATE VIEW public.ClashZone_bookings_feed 
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
  b.status,
  b.notes,
  b.created_at,
  b.updated_at,
  b.created_by,
  COALESCE(u.full_name, 'غير مسجل') AS creator_name,
  COALESCE(u.role, 'غير مسجل') AS creator_role
FROM public.ClashZone_bookings b
LEFT JOIN public.ClashZone_user_roles u ON b.created_by = u.user_id;

GRANT SELECT ON public.ClashZone_bookings_feed TO authenticated;

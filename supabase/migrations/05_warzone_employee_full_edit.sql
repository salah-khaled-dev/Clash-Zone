-- ==============================================================================
-- Migration 05: Grant Employees Full Booking Editing Permissions
-- ==============================================================================
-- Purpose:
-- 1. Allow employees to fully edit all booking fields:
--    - customer_name
--    - phone
--    - number_of_people
--    - category
--    - booking_date
--    - booking_time
--    - status
--    - notes
-- 2. Restrict immutable system fields (id, created_at) from being modified.
-- 3. Strictly restrict permanent deletion (DELETE) to 'admin' and 'manager' only.
-- 4. Preserve existing bookings and archives untouched.
-- 5. Block 'unassigned' and anonymous users from editing or reading bookings.
-- ==============================================================================

-- 1. Helper function: warzone_current_role
CREATE OR REPLACE FUNCTION public.warzone_current_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.warzone_user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- 2. Helper function: warzone_is_admin
CREATE OR REPLACE FUNCTION public.warzone_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.warzone_user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Helper function: warzone_is_manager_or_admin
CREATE OR REPLACE FUNCTION public.warzone_is_manager_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.warzone_user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  );
$$;

-- 4. Update the Booking Guard Trigger Function
-- Removes the outdated restriction that limited employees to only date, time, and status.
-- Now Admin, Manager, and Employee can update all editable booking fields.
CREATE OR REPLACE FUNCTION public.warzone_guard_booking_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.warzone_current_role();

  -- Verify user is an authorized staff member
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

  -- Validate participant count is positive
  IF NEW.number_of_people IS NOT NULL AND NEW.number_of_people < 1 THEN
    RAISE EXCEPTION 'Number of people must be at least 1'
      USING ERRCODE = '23514';
  END IF;

  -- Auto-update timestamp
  NEW.updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Ensure trigger is active on public.warzone_bookings
DROP TRIGGER IF EXISTS warzone_update_guard ON public.warzone_bookings;
CREATE TRIGGER warzone_update_guard
  BEFORE UPDATE ON public.warzone_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.warzone_guard_booking_updates();

-- 5. Row Level Security for public.warzone_bookings
ALTER TABLE public.warzone_bookings ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to ensure clean updated state
DROP POLICY IF EXISTS "War Zone Read Bookings" ON public.warzone_bookings;
DROP POLICY IF EXISTS "War Zone Insert Bookings" ON public.warzone_bookings;
DROP POLICY IF EXISTS "War Zone Update Bookings" ON public.warzone_bookings;
DROP POLICY IF EXISTS "War Zone Admin Delete" ON public.warzone_bookings;
DROP POLICY IF EXISTS "War Zone Select Bookings" ON public.warzone_bookings;
DROP POLICY IF EXISTS "War Zone Delete Bookings" ON public.warzone_bookings;

-- SELECT: Admin, Manager, and Employee can view bookings
CREATE POLICY "War Zone Select Bookings" ON public.warzone_bookings
FOR SELECT TO authenticated
USING (
  public.warzone_current_role() IN ('admin', 'manager', 'employee')
);

-- INSERT: Admin, Manager, and Employee can create bookings
CREATE POLICY "War Zone Insert Bookings" ON public.warzone_bookings
FOR INSERT TO authenticated
WITH CHECK (
  public.warzone_current_role() IN ('admin', 'manager', 'employee')
);

-- UPDATE: Admin, Manager, and Employee can update all editable fields
CREATE POLICY "War Zone Update Bookings" ON public.warzone_bookings
FOR UPDATE TO authenticated
USING (
  public.warzone_current_role() IN ('admin', 'manager', 'employee')
)
WITH CHECK (
  public.warzone_current_role() IN ('admin', 'manager', 'employee')
);

-- DELETE: Strictly Admin and Manager ONLY. Employees CANNOT delete.
CREATE POLICY "War Zone Delete Bookings" ON public.warzone_bookings
FOR DELETE TO authenticated
USING (
  public.warzone_is_manager_or_admin()
);

-- 6. Row Level Security for public.warzone_user_roles
ALTER TABLE public.warzone_user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own War Zone role" ON public.warzone_user_roles;
DROP POLICY IF EXISTS "War Zone Admin Manage Roles" ON public.warzone_user_roles;
DROP POLICY IF EXISTS "War Zone Select User Roles" ON public.warzone_user_roles;

-- SELECT: Users can read their own role; Admin can read all roles
CREATE POLICY "War Zone Select User Roles" ON public.warzone_user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR public.warzone_is_admin()
);

-- ALL (INSERT, UPDATE, DELETE): Strictly Admin ONLY
CREATE POLICY "War Zone Admin Manage Roles" ON public.warzone_user_roles
FOR ALL TO authenticated
USING (
  public.warzone_is_admin()
)
WITH CHECK (
  public.warzone_is_admin()
);

-- 7. Revoke execution from public and anon on security functions
REVOKE ALL ON FUNCTION public.warzone_current_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.warzone_is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.warzone_is_manager_or_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.warzone_current_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.warzone_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.warzone_is_manager_or_admin() TO authenticated;

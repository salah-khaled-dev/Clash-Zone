-- ==============================================================================
-- Migration 04: War Zone Security, RBAC & Role Enforcement
-- ==============================================================================
-- Security Audit & Design:
-- 1. Employee creation is delegated to the official Supabase Auth Admin API 
--    via a secure server-side Supabase Edge Function (supabase/functions/manage-employee).
-- 2. Direct passwords/user insertion into auth.users is strictly omitted from SQL.
-- 3. RBAC Roles:
--    - Admin: Full access to all bookings and user roles.
--    - Manager: Full access to create, edit (all fields), and delete bookings.
--    - Employee: Can create bookings, but can ONLY update booking_date, booking_time, and status.
--                Cannot delete bookings.
--    - Unassigned: Cannot read, create, update, or delete bookings.
-- 4. Status Check allows: 'pending', 'confirmed', 'completed', 'cancelled', 'group_cancelled'.
--    Group Cancel updates status to 'group_cancelled' without deleting any record.
-- 5. Existing bookings and archives ('public.bookings', 'archive.bookings_20261024') 
--    remain 100% untouched.
-- 6. No public or anon role can execute privileged functions or read private customer data.
-- ==============================================================================

-- 1. Helper Function: Get Current User Role
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

-- 2. Helper Function: Is Current User Admin
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

-- 3. Helper Function: Is Current User Manager or Admin
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

-- 4. Revoke access from public/anon and grant only to authenticated users
REVOKE ALL ON FUNCTION public.warzone_current_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.warzone_is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.warzone_is_manager_or_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.warzone_current_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.warzone_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.warzone_is_manager_or_admin() TO authenticated;

-- 5. Update Guard Trigger Function for Bookings
-- Enforces:
-- - Employee can ONLY update booking_date, booking_time, status.
-- - Admin and Manager can update all fields.
-- - Unassigned or unauthorized users cannot update.
CREATE OR REPLACE FUNCTION public.warzone_guard_booking_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.warzone_current_role();

  IF v_role = 'employee' THEN
    -- Employees can only modify date, time and status
    IF
      NEW.id IS DISTINCT FROM OLD.id
      OR NEW.customer_name IS DISTINCT FROM OLD.customer_name
      OR NEW.phone IS DISTINCT FROM OLD.phone
      OR NEW.number_of_people IS DISTINCT FROM OLD.number_of_people
      OR NEW.category IS DISTINCT FROM OLD.category
      OR NEW.notes IS DISTINCT FROM OLD.notes
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN
      RAISE EXCEPTION 'Employee can only update booking date, time and status'
        USING ERRCODE = '42501';
    END IF;

  ELSIF COALESCE(v_role, '') NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized booking update'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Booking ID cannot be changed'
      USING ERRCODE = '42501';
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Attach trigger to public.warzone_bookings
DROP TRIGGER IF EXISTS warzone_update_guard ON public.warzone_bookings;
CREATE TRIGGER warzone_update_guard
  BEFORE UPDATE ON public.warzone_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.warzone_guard_booking_updates();

-- 6. Row Level Security for public.warzone_bookings
ALTER TABLE public.warzone_bookings ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to ensure clean state
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

-- UPDATE: Admin, Manager, and Employee can update (Employee restricted by trigger above)
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

-- 7. Row Level Security for public.warzone_user_roles
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

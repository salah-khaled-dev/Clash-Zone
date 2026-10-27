-- ==============================================================================
-- CLASH ZONE MIGRATION 07: REMOVE GROUP CANCEL & UNIFY CANCELLATION STATUS
-- ==============================================================================

BEGIN;

-- 1. Safely normalize any historical 'group_cancelled' bookings to 'cancelled'
UPDATE public.ClashZone_bookings
SET status = 'cancelled', updated_at = NOW()
WHERE status = 'group_cancelled';

-- 2. Update CHECK constraint on status to strictly allow only the 4 required statuses:
--    'pending', 'confirmed', 'completed', 'cancelled'
ALTER TABLE public.ClashZone_bookings
  DROP CONSTRAINT IF EXISTS ClashZone_bookings_status_check;

ALTER TABLE public.ClashZone_bookings
  ADD CONSTRAINT ClashZone_bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));

-- 3. Ensure public.ClashZone_bookings is in supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ClashZone_bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ClashZone_bookings;
  END IF;
END $$;

ALTER TABLE public.ClashZone_bookings REPLICA IDENTITY FULL;

COMMIT;

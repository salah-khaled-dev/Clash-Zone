-- ═══════════════════════════════════════════════════════════════════════════
-- CLASH ZONE MIGRATION 08: Include duration_minutes in ClashZone_bookings_feed
-- ═══════════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.ClashZone_bookings_feed CASCADE;

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
  b.duration_minutes,
  b.status,
  b.notes,
  b.created_at,
  b.updated_at,
  b.created_by,
  COALESCE(u.full_name, 'غير مسجل') AS creator_name,
  COALESCE(u.role, 'غير مسجل') AS creator_role
FROM public.ClashZone_bookings b
LEFT JOIN public.ClashZone_user_roles u ON b.created_by = u.user_id;

GRANT SELECT ON public.ClashZone_bookings_feed TO authenticated, anon, service_role;

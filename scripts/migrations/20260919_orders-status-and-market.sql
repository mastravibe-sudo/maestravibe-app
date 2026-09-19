-- Run in the Supabase SQL editor before creating new orders.
-- The existing orders table predates the pending_verification workflow and
-- does not have a market column; the application derives legacy markets from
-- customer country metadata instead.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_verification', 'new', 'pending', 'accepted', 'completed', 'delivered', 'cancelled'));
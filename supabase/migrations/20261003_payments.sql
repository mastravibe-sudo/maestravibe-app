-- Run in Supabase SQL editor (no file needed in the project): supabase/migrations/20261003_payments.sql
-- Run once in Supabase SQL editor.
alter table orders
  add column if not exists market            text,                    -- 'pk' | 'us'
  add column if not exists currency          text,                    -- 'pkr' | 'usd'
  add column if not exists payment_method    text default 'cod',      -- 'cod' | 'online'
  add column if not exists payment_provider  text,                    -- 'stripe' ...
  add column if not exists payment_status    text default 'cod',      -- 'cod' | 'pending' | 'paid' | 'failed' | 'refunded'
  add column if not exists payment_reference text,
  add column if not exists paid_at           timestamptz;

create index if not exists orders_payment_reference_idx on orders (payment_reference);
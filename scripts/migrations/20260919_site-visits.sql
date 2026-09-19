CREATE TABLE IF NOT EXISTS public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at timestamptz NOT NULL DEFAULT now(),
  path text NOT NULL,
  visitor_id text NOT NULL,
  market text NULL CHECK (market IN ('pk', 'us') OR market IS NULL)
);

CREATE INDEX IF NOT EXISTS site_visits_visited_at_idx ON public.site_visits (visited_at);
CREATE INDEX IF NOT EXISTS site_visits_visitor_id_idx ON public.site_visits (visitor_id);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
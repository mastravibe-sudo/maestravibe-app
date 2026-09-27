-- Account signup uses the server-only service-role client because this app's
-- accounts table is a custom password/JWT system, not Supabase Auth users.
-- Never allow anonymous clients to write password hashes or choose account roles.

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

REVOKE INSERT ON TABLE public.accounts FROM PUBLIC, anon, authenticated;

DO $migration$
DECLARE
	insert_policy record;
BEGIN
	FOR insert_policy IN
		SELECT policyname
		FROM pg_policies
		WHERE schemaname = 'public'
			AND tablename = 'accounts'
			AND cmd = 'INSERT'
			AND (roles::text[] && ARRAY['public', 'anon', 'authenticated']::text[])
	LOOP
		EXECUTE format('DROP POLICY %I ON public.accounts', insert_policy.policyname);
	END LOOP;
	END;
$migration$;

-- Trusted server routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS. No public
-- INSERT policy is intentionally created: there is no auth.uid() user_id to
-- validate in the current signup schema.
-- Apply once to an existing Blindspot instance. Also append to schema.sql for new projects.
create table public.regression_suites (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now(),
  payload jsonb not null check (
    jsonb_typeof(payload) = 'object'
    and payload->>'kind' = 'blindspot-regression-suite'
    and jsonb_typeof(payload->'probes') = 'array'
    and jsonb_array_length(payload->'probes') between 1 and 80
    and octet_length(payload::text) <= 2000000)
);
create index regression_suites_user_created on public.regression_suites (user_id, created_at desc);
alter table public.regression_suites enable row level security;
grant select, insert, delete on public.regression_suites to authenticated;
revoke all on public.regression_suites from anon;
create policy "Owners read their suites" on public.regression_suites for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners save their suites" on public.regression_suites for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners delete their suites" on public.regression_suites for delete to authenticated using ((select auth.uid()) = user_id);

-- Bootstrap for a fresh Supabase project. Applied remotely as create_evaluation_runs.
create table public.evaluation_runs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now(),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 2000000)
);
create index evaluation_runs_user_created on public.evaluation_runs (user_id, created_at desc);
alter table public.evaluation_runs enable row level security;
grant select, insert, delete on public.evaluation_runs to authenticated;
revoke all on public.evaluation_runs from anon;
create policy "Owners read their runs" on public.evaluation_runs for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners save their runs" on public.evaluation_runs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners delete their runs" on public.evaluation_runs for delete to authenticated using ((select auth.uid()) = user_id);

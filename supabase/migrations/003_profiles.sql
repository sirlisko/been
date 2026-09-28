-- A public profile shows the user's map at /@username
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_-]{3,20}$'),
  is_public boolean not null default true
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can create own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own profile"
  on profiles for delete
  using (auth.uid() = user_id);

-- The only public read: a public username's country codes, without exposing user ids.
-- Returns null for an unknown or private username, so neither can be told apart.
create function public.public_map(name text)
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_agg(c.code order by c.code) filter (where c.code is not null), '{}')
  from public.profiles p
  left join public.user_countries c on c.user_id = p.user_id
  where p.username = lower(name) and p.is_public
  group by p.user_id;
$$;

grant execute on function public.public_map(text) to anon, authenticated;

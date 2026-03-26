create table visited_countries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  countries jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table visited_countries enable row level security;

create policy "Users can read own countries"
  on visited_countries for select
  using (auth.uid() = user_id);

create policy "Users can insert own countries"
  on visited_countries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own countries"
  on visited_countries for update
  using (auth.uid() = user_id);

-- Create custom problem types table
create table if not exists public.custom_problem_types (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null unique
);

-- Enable RLS
alter table public.custom_problem_types enable row level security;

-- Create policies - everyone can view and add custom types
create policy "Everyone can view custom problem types"
  on public.custom_problem_types for select
  using (true);

create policy "Anyone can insert custom problem types"
  on public.custom_problem_types for insert
  with check (true);
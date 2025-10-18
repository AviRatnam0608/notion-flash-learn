-- Run this SQL in your Lovable Cloud dashboard (Cloud tab -> Database -> SQL Editor)

-- Create questions table
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  problem_type text,
  problem_url text not null,
  code_solution_1 text not null,
  code_solution_2 text,
  code_solution_3 text,
  explanation text,
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.questions enable row level security;

-- Create policies - allow everyone to view all questions
create policy "Users can view all questions"
  on public.questions for select
  using (true);

-- Allow anyone to insert questions (adjust if you want auth required)
create policy "Anyone can insert questions"
  on public.questions for insert
  with check (true);

-- Users can update their own questions
create policy "Users can update their own questions"
  on public.questions for update
  using (auth.uid() = user_id);

-- Users can delete their own questions  
create policy "Users can delete their own questions"
  on public.questions for delete
  using (auth.uid() = user_id);

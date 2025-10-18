-- Add description column to questions table
ALTER TABLE public.questions 
ADD COLUMN description text;

-- Add an index on problem_url for faster lookups during backfill
CREATE INDEX IF NOT EXISTS idx_questions_problem_url ON public.questions(problem_url);
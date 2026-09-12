-- Add sort_order column to public.tasks to support manual ordering of tasks within a day
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

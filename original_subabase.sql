-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.study_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date DEFAULT CURRENT_DATE,
  subject text NOT NULL,
  sub_topic text NOT NULL,
  source text,
  total_questions integer DEFAULT 0,
  correct integer DEFAULT 0,
  wrong integer DEFAULT 0,
  blank integer DEFAULT 0,
  status text DEFAULT 'Open'::text,
  exam text,
  area text,
  kind text DEFAULT 'soru'::text,
  CONSTRAINT study_logs_pkey PRIMARY KEY (id),
  CONSTRAINT study_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  email text,
  role text CHECK (role = ANY (ARRAY['student'::text, 'coach'::text])),
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  exam_tracks jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.coach_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  coach_id uuid,
  status text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT coach_connections_pkey PRIMARY KEY (id),
  CONSTRAINT coach_connections_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id),
  CONSTRAINT coach_connections_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES auth.users(id)
);
CREATE TABLE public.mock_exams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  exam_type text NOT NULL,
  title text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_questions integer NOT NULL DEFAULT 0,
  net_score numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  results_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT mock_exams_pkey PRIMARY KEY (id)
);
CREATE TABLE public.weekly_schedules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL,
  week_start_date date NOT NULL,
  schedule_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT weekly_schedules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL DEFAULT ''::text,
  email text NOT NULL DEFAULT ''::text,
  target text NOT NULL DEFAULT ''::text,
  track USER-DEFINED NOT NULL DEFAULT 'sayisal'::yks_track,
  title text NOT NULL DEFAULT ''::text,
  coach_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.pair_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL,
  from_role USER-DEFINED NOT NULL,
  to_email text NOT NULL,
  to_user uuid,
  status text NOT NULL DEFAULT 'pending'::text,
  message text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT pair_invites_pkey PRIMARY KEY (id),
  CONSTRAINT pair_invites_from_user_fkey FOREIGN KEY (from_user) REFERENCES auth.users(id),
  CONSTRAINT pair_invites_to_user_fkey FOREIGN KEY (to_user) REFERENCES auth.users(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind = ANY (ARRAY['konu'::text, 'soru'::text, 'deneme'::text])),
  subject text NOT NULL,
  title text NOT NULL,
  day integer NOT NULL CHECK (day >= 0 AND day <= 6),
  week_offset integer NOT NULL DEFAULT 0,
  done boolean NOT NULL DEFAULT false,
  topic_id text,
  area_id text,
  area_name text,
  assigned_by text DEFAULT 'student'::text CHECK (assigned_by = ANY (ARRAY['student'::text, 'coach'::text])),
  result jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  topic_name text,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.user_roles(user_id)
);
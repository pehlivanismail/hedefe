-- coach_connections
CREATE TABLE IF NOT EXISTS public.coach_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS coach_connections_student_idx ON public.coach_connections(student_id);
CREATE INDEX IF NOT EXISTS coach_connections_coach_idx ON public.coach_connections(coach_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_connections TO authenticated;
GRANT ALL ON public.coach_connections TO service_role;
ALTER TABLE public.coach_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read connections" ON public.coach_connections FOR SELECT TO authenticated USING (student_id = auth.uid() OR coach_id = auth.uid());
CREATE POLICY "Participants create connections" ON public.coach_connections FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR coach_id = auth.uid());
CREATE POLICY "Participants update connections" ON public.coach_connections FOR UPDATE TO authenticated USING (student_id = auth.uid() OR coach_id = auth.uid()) WITH CHECK (student_id = auth.uid() OR coach_id = auth.uid());
CREATE POLICY "Participants delete connections" ON public.coach_connections FOR DELETE TO authenticated USING (student_id = auth.uid() OR coach_id = auth.uid());

-- helper: is caller the coach of this student?
CREATE OR REPLACE FUNCTION public.is_coach_of(_student uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_connections
    WHERE student_id = _student AND coach_id = auth.uid() AND coalesce(status,'approved') = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _student AND coach_id = auth.uid()
  )
$$;
GRANT EXECUTE ON FUNCTION public.is_coach_of(uuid) TO authenticated;

-- tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  subject text NOT NULL,
  title text NOT NULL,
  topic_id text,
  area_id text,
  area_name text,
  day integer NOT NULL,
  week_offset integer NOT NULL DEFAULT 0,
  done boolean NOT NULL DEFAULT false,
  result jsonb,
  assigned_by text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_student_idx ON public.tasks(student_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or coach read tasks" ON public.tasks FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id));
CREATE POLICY "Owner or coach insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR public.is_coach_of(student_id));
CREATE POLICY "Owner or coach update tasks" ON public.tasks FOR UPDATE TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id)) WITH CHECK (student_id = auth.uid() OR public.is_coach_of(student_id));
CREATE POLICY "Owner or coach delete tasks" ON public.tasks FOR DELETE TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id));

-- mock_exams
CREATE TABLE IF NOT EXISTS public.mock_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  exam_type text NOT NULL,
  date date NOT NULL DEFAULT current_date,
  net_score numeric NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  results_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mock_exams_user_idx ON public.mock_exams(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_exams TO authenticated;
GRANT ALL ON public.mock_exams TO service_role;
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or coach read exams" ON public.mock_exams FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id));
CREATE POLICY "Owner or coach insert exams" ON public.mock_exams FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_coach_of(user_id));
CREATE POLICY "Owner or coach update exams" ON public.mock_exams FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id)) WITH CHECK (user_id = auth.uid() OR public.is_coach_of(user_id));
CREATE POLICY "Owner or coach delete exams" ON public.mock_exams FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id));

-- study_logs
CREATE TABLE IF NOT EXISTS public.study_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  sub_topic text NOT NULL,
  area text,
  exam text,
  source text,
  status text,
  kind text,
  date date DEFAULT current_date,
  total_questions integer DEFAULT 0,
  correct integer DEFAULT 0,
  wrong integer DEFAULT 0,
  blank integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS study_logs_user_idx ON public.study_logs(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_logs TO authenticated;
GRANT ALL ON public.study_logs TO service_role;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or coach read logs" ON public.study_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id));
CREATE POLICY "Owner or coach insert logs" ON public.study_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_coach_of(user_id));
CREATE POLICY "Owner or coach update logs" ON public.study_logs FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id)) WITH CHECK (user_id = auth.uid() OR public.is_coach_of(user_id));
CREATE POLICY "Owner or coach delete logs" ON public.study_logs FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id));

-- weekly_schedules
CREATE TABLE IF NOT EXISTS public.weekly_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  schedule_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS weekly_schedules_student_week_idx ON public.weekly_schedules(student_id, week_start_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_schedules TO authenticated;
GRANT ALL ON public.weekly_schedules TO service_role;
ALTER TABLE public.weekly_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or coach read schedules" ON public.weekly_schedules FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id));
CREATE POLICY "Owner or coach insert schedules" ON public.weekly_schedules FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR public.is_coach_of(student_id));
CREATE POLICY "Owner or coach update schedules" ON public.weekly_schedules FOR UPDATE TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id)) WITH CHECK (student_id = auth.uid() OR public.is_coach_of(student_id));
CREATE POLICY "Owner or coach delete schedules" ON public.weekly_schedules FOR DELETE TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id));

-- user_roles extras used by the app
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS exam_tracks jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

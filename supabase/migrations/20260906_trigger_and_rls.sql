-- ============================================================
-- 1. Helper function for role check (avoids RLS recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- 2. Trigger: auto-insert profiles + user_roles on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, track, coach_id, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'track', '')::yks_track, 'sayisal'),
    NULL,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'student')::app_role
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Backfill existing users
-- ============================================================
INSERT INTO public.profiles (id, email, full_name, track, coach_id, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  COALESCE(NULLIF(raw_user_meta_data->>'track', '')::yks_track, 'sayisal'),
  NULL,
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  track = COALESCE(profiles.track, EXCLUDED.track);

INSERT INTO public.user_roles (user_id, role)
SELECT
  id,
  COALESCE(NULLIF(raw_user_meta_data->>'role', ''), 'student')::app_role
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 4. RLS: profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Coaches can view all profiles" ON public.profiles;
CREATE POLICY "Coaches can view all profiles" ON public.profiles FOR SELECT USING (public.get_my_role() = 'coach');
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 5. RLS: user_roles (no recursion via SECURITY DEFINER fn)
-- ============================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Coaches can view all roles" ON public.user_roles;
CREATE POLICY "Coaches can view all roles" ON public.user_roles FOR SELECT USING (public.get_my_role() = 'coach');

-- ============================================================
-- 6. RLS: tasks
-- ============================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can manage own tasks" ON public.tasks;
CREATE POLICY "Students can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Coaches can manage student tasks" ON public.tasks;
CREATE POLICY "Coaches can manage student tasks" ON public.tasks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.coach_connections cc
    WHERE cc.coach_id = auth.uid() AND cc.student_id = tasks.student_id AND cc.status = 'approved'
  )
);

-- ============================================================
-- 7. RLS: study_logs
-- ============================================================
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can manage own study logs" ON public.study_logs;
CREATE POLICY "Students can manage own study logs" ON public.study_logs FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Coaches can view student study logs" ON public.study_logs;
CREATE POLICY "Coaches can view student study logs" ON public.study_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.coach_connections cc
    WHERE cc.coach_id = auth.uid() AND cc.student_id = study_logs.user_id AND cc.status = 'approved'
  )
);
CREATE OR REPLACE FUNCTION public.get_my_email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt()->>'email';
$$;

DROP POLICY IF EXISTS "Users can view their own invites" ON public.pair_invites;

CREATE POLICY "Users can view their own invites" ON public.pair_invites
  FOR SELECT USING (
    auth.uid() = from_user
    OR to_email = public.get_my_email()
  );
-- Drop the overly restrictive profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON public.profiles;

-- Create an open read policy for profiles so invites can display names
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all operations for authenticated users on coach_connectio" ON public.coach_connections;
CREATE POLICY "Anyone can read coach connections" ON public.coach_connections FOR SELECT USING (true);
CREATE POLICY "Users can insert coach connections" ON public.coach_connections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their coach connections" ON public.coach_connections FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their coach connections" ON public.coach_connections FOR DELETE USING (auth.role() = 'authenticated');

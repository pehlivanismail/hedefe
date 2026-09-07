-- ============================================================
-- hedefe.net — LIVE DATABASE SYNC
-- Run this ONCE on your own Supabase project (SQL Editor).
-- It brings a database created from `original_subabase.sql`
-- up to the schema the current app code expects.
-- Safe to re-run: every statement is idempotent.
-- ============================================================

-- 1. Enum types -------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('student', 'coach');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.yks_track AS ENUM ('sayisal', 'sozel', 'esit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Missing columns -------------------------------------------
ALTER TABLE public.study_logs
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS area_id   text,
  ADD COLUMN IF NOT EXISTS area_name text,
  ADD COLUMN IF NOT EXISTS result    jsonb;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coach_id uuid REFERENCES public.profiles(id);

ALTER TABLE public.mock_exams
  ADD COLUMN IF NOT EXISTS results_data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 3. Helper functions ------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role::text
  )
$$;

CREATE OR REPLACE FUNCTION public.my_email()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(coalesce(email, '')) FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_coach_of(_student uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_connections
    WHERE student_id = _student AND coach_id = auth.uid()
      AND coalesce(status, 'approved') = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _student AND coach_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta_role  public.app_role;
  meta_track public.yks_track;
BEGIN
  meta_role  := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'role',  ''), 'student')::public.app_role;
  meta_track := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'track', ''), 'sayisal')::public.yks_track;

  INSERT INTO public.profiles (id, full_name, email, target, track, title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'target', ''),
    meta_track,
    COALESCE(NEW.raw_user_meta_data ->> 'title', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, meta_role::text)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.respond_pair_invite(_invite_id uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  inv public.pair_invites;
  caller_email text := public.my_email();
  student uuid;
  coach uuid;
BEGIN
  SELECT * INTO inv FROM public.pair_invites WHERE id = _invite_id AND status = 'pending';
  IF inv.id IS NULL THEN
    RAISE EXCEPTION 'Davet bulunamadi';
  END IF;
  IF NOT (inv.to_user = auth.uid() OR lower(inv.to_email) = caller_email) THEN
    RAISE EXCEPTION 'Bu davet size ait degil';
  END IF;

  IF _accept THEN
    IF inv.from_role = 'coach' THEN
      coach := inv.from_user; student := auth.uid();
    ELSE
      coach := auth.uid();    student := inv.from_user;
    END IF;

    IF NOT public.has_role(coach, 'coach') THEN
      RAISE EXCEPTION 'Karsi taraf koc degil';
    END IF;

    UPDATE public.profiles SET coach_id = coach WHERE id = student;
  END IF;

  UPDATE public.pair_invites
     SET status = CASE WHEN _accept THEN 'accepted' ELSE 'declined' END,
         to_user = auth.uid(),
         responded_at = now()
   WHERE id = inv.id;
END;
$$;

-- 4. Grants (PostgREST needs these explicitly) -----------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles,
  public.study_logs, public.tasks, public.mock_exams,
  public.weekly_schedules, public.coach_connections,
  public.pair_invites TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.profiles, public.user_roles, public.study_logs,
  public.tasks, public.mock_exams, public.weekly_schedules,
  public.coach_connections, public.pair_invites TO service_role;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_pair_invite(uuid, boolean) TO authenticated;

-- 5. Row Level Security ----------------------------------------
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_schedules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_connections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pair_invites       ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "Coaches can read their own students" ON public.profiles;
CREATE POLICY "Coaches can read their own students" ON public.profiles
  FOR SELECT TO authenticated USING (coach_id = auth.uid());
DROP POLICY IF EXISTS "Everyone signed in can read coach profiles" ON public.profiles;
CREATE POLICY "Everyone signed in can read coach profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(id, 'coach'));
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- user_roles (read-only from the app)
DROP POLICY IF EXISTS "Signed in users can read roles" ON public.user_roles;
CREATE POLICY "Signed in users can read roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

-- study_logs / mock_exams (user_id) and tasks / weekly_schedules (student_id)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['study_logs', 'mock_exams'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Owner or coach read %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Owner or coach read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Owner or coach insert %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Owner or coach insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_coach_of(user_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Owner or coach update %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Owner or coach update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id)) WITH CHECK (user_id = auth.uid() OR public.is_coach_of(user_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Owner or coach delete %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Owner or coach delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_coach_of(user_id))', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY['tasks', 'weekly_schedules'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Owner or coach read %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Owner or coach read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Owner or coach insert %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Owner or coach insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR public.is_coach_of(student_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Owner or coach update %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Owner or coach update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id)) WITH CHECK (student_id = auth.uid() OR public.is_coach_of(student_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Owner or coach delete %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Owner or coach delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (student_id = auth.uid() OR public.is_coach_of(student_id))', t);
  END LOOP;
END $$;

-- coach_connections: either participant
DROP POLICY IF EXISTS "Participants read connections" ON public.coach_connections;
CREATE POLICY "Participants read connections" ON public.coach_connections
  FOR SELECT TO authenticated USING (student_id = auth.uid() OR coach_id = auth.uid());
DROP POLICY IF EXISTS "Participants create connections" ON public.coach_connections;
CREATE POLICY "Participants create connections" ON public.coach_connections
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR coach_id = auth.uid());
DROP POLICY IF EXISTS "Participants update connections" ON public.coach_connections;
CREATE POLICY "Participants update connections" ON public.coach_connections
  FOR UPDATE TO authenticated USING (student_id = auth.uid() OR coach_id = auth.uid())
  WITH CHECK (student_id = auth.uid() OR coach_id = auth.uid());
DROP POLICY IF EXISTS "Participants delete connections" ON public.coach_connections;
CREATE POLICY "Participants delete connections" ON public.coach_connections
  FOR DELETE TO authenticated USING (student_id = auth.uid() OR coach_id = auth.uid());

-- pair_invites
DROP POLICY IF EXISTS "Sender can create invites" ON public.pair_invites;
CREATE POLICY "Sender can create invites" ON public.pair_invites
  FOR INSERT TO authenticated WITH CHECK (from_user = auth.uid());
DROP POLICY IF EXISTS "Sender can read own invites" ON public.pair_invites;
CREATE POLICY "Sender can read own invites" ON public.pair_invites
  FOR SELECT TO authenticated USING (from_user = auth.uid());
DROP POLICY IF EXISTS "Recipient can read invites" ON public.pair_invites;
CREATE POLICY "Recipient can read invites" ON public.pair_invites
  FOR SELECT TO authenticated USING (to_user = auth.uid() OR lower(to_email) = public.my_email());
DROP POLICY IF EXISTS "Sender can cancel invites" ON public.pair_invites;
CREATE POLICY "Sender can cancel invites" ON public.pair_invites
  FOR DELETE TO authenticated USING (from_user = auth.uid());

-- 6. Indexes ---------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_study_logs_user   ON public.study_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_student     ON public.tasks(student_id, week_offset);
CREATE INDEX IF NOT EXISTS idx_mock_exams_user   ON public.mock_exams(user_id, date);
CREATE INDEX IF NOT EXISTS idx_profiles_coach    ON public.profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_pair_invites_mail ON public.pair_invites(lower(to_email));
CREATE INDEX IF NOT EXISTS idx_pair_invites_from ON public.pair_invites(from_user);

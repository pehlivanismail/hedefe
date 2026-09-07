CREATE TABLE IF NOT EXISTS public.parent_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_links TO authenticated;
GRANT ALL ON public.parent_links TO service_role;
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read parent links" ON public.parent_links
  FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR student_id = auth.uid() OR public.is_coach_of(student_id));
CREATE POLICY "Participants create parent links" ON public.parent_links
  FOR INSERT TO authenticated
  WITH CHECK (parent_id = auth.uid() OR student_id = auth.uid());
CREATE POLICY "Participants delete parent links" ON public.parent_links
  FOR DELETE TO authenticated
  USING (parent_id = auth.uid() OR student_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_parent_of(_student uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_links
    WHERE student_id = _student AND parent_id = auth.uid()
      AND coalesce(status, 'approved') = 'approved'
  )
$$;

CREATE POLICY "Parent reads child profile" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_parent_of(id));
CREATE POLICY "Parent reads child logs" ON public.study_logs
  FOR SELECT TO authenticated USING (public.is_parent_of(user_id));
CREATE POLICY "Parent reads child tasks" ON public.tasks
  FOR SELECT TO authenticated USING (public.is_parent_of(student_id));
CREATE POLICY "Parent reads child exams" ON public.mock_exams
  FOR SELECT TO authenticated USING (public.is_parent_of(user_id));
CREATE POLICY "Parent reads child schedules" ON public.weekly_schedules
  FOR SELECT TO authenticated USING (public.is_parent_of(student_id));

CREATE TABLE IF NOT EXISTS public.parent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.parent_messages TO authenticated;
GRANT ALL ON public.parent_messages TO service_role;
ALTER TABLE public.parent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read messages" ON public.parent_messages
  FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR coach_id = auth.uid());
CREATE POLICY "Participants send messages" ON public.parent_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND (parent_id = auth.uid() OR coach_id = auth.uid()));

CREATE INDEX IF NOT EXISTS parent_messages_student_idx ON public.parent_messages (student_id, created_at);

CREATE OR REPLACE FUNCTION public.respond_pair_invite(_invite_id uuid, _accept boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.pair_invites;
  caller_email text := public.my_email();
  student uuid;
  coach uuid;
  parent uuid;
BEGIN
  SELECT * INTO inv FROM public.pair_invites WHERE id = _invite_id AND status = 'pending';
  IF inv.id IS NULL THEN
    RAISE EXCEPTION 'Davet bulunamadi';
  END IF;
  IF NOT (inv.to_user = auth.uid() OR lower(inv.to_email) = caller_email) THEN
    RAISE EXCEPTION 'Bu davet size ait degil';
  END IF;

  IF _accept THEN
    IF inv.from_role = 'parent' THEN
      parent := inv.from_user;
      student := auth.uid();
    ELSIF public.has_role(auth.uid(), 'parent') AND inv.from_role = 'student' THEN
      parent := auth.uid();
      student := inv.from_user;
    ELSIF inv.from_role = 'coach' THEN
      coach := inv.from_user;
      student := auth.uid();
    ELSE
      coach := auth.uid();
      student := inv.from_user;
    END IF;

    IF parent IS NOT NULL THEN
      IF NOT public.has_role(parent, 'parent') THEN
        RAISE EXCEPTION 'Karsi taraf veli degil';
      END IF;
      INSERT INTO public.parent_links (parent_id, student_id, status)
      VALUES (parent, student, 'approved')
      ON CONFLICT (parent_id, student_id) DO UPDATE SET status = 'approved';
    ELSE
      IF NOT public.has_role(coach, 'coach') THEN
        RAISE EXCEPTION 'Karsi taraf koc degil';
      END IF;
      UPDATE public.profiles SET coach_id = coach WHERE id = student;
    END IF;
  END IF;

  UPDATE public.pair_invites
     SET status = CASE WHEN _accept THEN 'accepted' ELSE 'declined' END,
         to_user = auth.uid(),
         responded_at = now()
   WHERE id = inv.id;
END;
$$;
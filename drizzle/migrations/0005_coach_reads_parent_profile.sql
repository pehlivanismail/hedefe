CREATE POLICY "Coach reads parents of own students" ON public.profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    WHERE pl.parent_id = public.profiles.id
      AND public.is_coach_of(pl.student_id)
  ));
CREATE POLICY "Student reads own parents" ON public.profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    WHERE pl.parent_id = public.profiles.id
      AND pl.student_id = auth.uid()
  ));
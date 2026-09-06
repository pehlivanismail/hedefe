CREATE TABLE public.pair_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_role public.app_role NOT NULL,
  to_email text NOT NULL,
  to_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

CREATE INDEX pair_invites_to_email_idx ON public.pair_invites (lower(to_email));
CREATE INDEX pair_invites_from_user_idx ON public.pair_invites (from_user);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pair_invites TO authenticated;
GRANT ALL ON public.pair_invites TO service_role;

ALTER TABLE public.pair_invites ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.my_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(email, '')) FROM public.profiles WHERE id = auth.uid()
$$;

CREATE POLICY "Sender can read own invites"
  ON public.pair_invites FOR SELECT TO authenticated
  USING (from_user = auth.uid());

CREATE POLICY "Recipient can read invites"
  ON public.pair_invites FOR SELECT TO authenticated
  USING (to_user = auth.uid() OR lower(to_email) = public.my_email());

CREATE POLICY "Sender can create invites"
  ON public.pair_invites FOR INSERT TO authenticated
  WITH CHECK (from_user = auth.uid());

CREATE POLICY "Sender can cancel invites"
  ON public.pair_invites FOR DELETE TO authenticated
  USING (from_user = auth.uid());

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
      coach := inv.from_user;
      student := auth.uid();
    ELSE
      coach := auth.uid();
      student := inv.from_user;
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

GRANT EXECUTE ON FUNCTION public.respond_pair_invite(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_email() TO authenticated;
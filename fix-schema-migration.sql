-- Create enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('student', 'coach');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.yks_track AS ENUM ('sayisal', 'sozel', 'esit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (Lovable added this for target and track settings)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  target text not null default '',
  track public.yks_track not null default 'sayisal',
  title text not null default '',
  coach_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Enable RLS and permissions for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Drop policies if they exist to recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can read their own students" ON public.profiles;
DROP POLICY IF EXISTS "Everyone signed in can read coach profiles" ON public.profiles;

-- Create policies for profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Coaches can read their own students" ON public.profiles FOR SELECT TO authenticated USING (coach_id = auth.uid());


-- 1. Create pair_invites table
CREATE TABLE IF NOT EXISTS public.pair_invites (
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

CREATE INDEX IF NOT EXISTS pair_invites_to_email_idx ON public.pair_invites (lower(to_email));
CREATE INDEX IF NOT EXISTS pair_invites_from_user_idx ON public.pair_invites (from_user);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pair_invites TO authenticated;
GRANT ALL ON public.pair_invites TO service_role;

ALTER TABLE public.pair_invites ENABLE ROW LEVEL SECURITY;

-- 2. Helper to get own email
CREATE OR REPLACE FUNCTION public.my_email()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  -- First try profiles
  SELECT lower(coalesce((SELECT email FROM public.profiles WHERE id = auth.uid()), ''))
$$;

-- 3. Pair Invites RLS Policies
DROP POLICY IF EXISTS "Sender can read own invites" ON public.pair_invites;
DROP POLICY IF EXISTS "Recipient can read invites" ON public.pair_invites;
DROP POLICY IF EXISTS "Sender can create invites" ON public.pair_invites;
DROP POLICY IF EXISTS "Sender can cancel invites" ON public.pair_invites;

CREATE POLICY "Sender can read own invites" ON public.pair_invites FOR SELECT TO authenticated USING (from_user = auth.uid());
CREATE POLICY "Recipient can read invites" ON public.pair_invites FOR SELECT TO authenticated USING (to_user = auth.uid() OR lower(to_email) = public.my_email());
CREATE POLICY "Sender can create invites" ON public.pair_invites FOR INSERT TO authenticated WITH CHECK (from_user = auth.uid());
CREATE POLICY "Sender can cancel invites" ON public.pair_invites FOR DELETE TO authenticated USING (from_user = auth.uid());

-- 4. RPC for responding to invites (Customized for V1 support)
CREATE OR REPLACE FUNCTION public.respond_pair_invite(_invite_id uuid, _accept boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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
  
  -- Sadece kendi emaili veya user idsiyse cevaplayabilir
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

    -- Update Lovable's profiles table
    UPDATE public.profiles SET coach_id = coach WHERE id = student;
    
    -- ALSO update V1 coach_connections table!!
    DELETE FROM public.coach_connections WHERE student_id = student;
    INSERT INTO public.coach_connections (student_id, coach_id, status)
    VALUES (student, coach, 'approved');
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

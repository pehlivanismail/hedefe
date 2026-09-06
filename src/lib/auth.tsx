import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Coach, Student, Track } from "@/lib/demo-data";

type Role = "student" | "coach";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  target: string;
  track: Track;
  title: string;
  coach_id: string | null;
};

type AuthValue = {
  loading: boolean;
  user: User | null;
  role: Role | null;
  student: Student | null;
  coach: Coach | null;
  coachList: Coach[];
  myStudents: Student[];
  setCoach: (coachId: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

const toStudent = (p: ProfileRow): Student => ({
  id: p.id,
  name: p.full_name || p.email,
  email: p.email,
  target: p.target || "Hedef belirlenmedi",
  pending: 0,
  track: p.track,
  coachId: p.coach_id,
});

const toCoach = (p: ProfileRow): Coach => ({
  id: p.id,
  name: p.full_name || p.email,
  email: p.email,
  title: p.title || "Koç",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<Record<string, Role>>({});

  const load = useCallback(async (uid: string | null) => {
    if (!uid) {
      setProfiles([]);
      setRoles({});
      return;
    }
    const [{ data: profileRows }, { data: roleRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, target, track, title, coach_id"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles((profileRows ?? []) as ProfileRow[]);
    setRoles(
      Object.fromEntries(
        (roleRows ?? []).map((r) => [r.user_id, r.role as Role]),
      ),
    );
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      void load(session?.user?.id ?? null);
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      await load(data.session?.user?.id ?? null);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  const me = profiles.find((p) => p.id === user?.id) ?? null;
  const role = user ? (roles[user.id] ?? null) : null;

  const value = useMemo<AuthValue>(() => {
    const coachList = profiles
      .filter((p) => roles[p.id] === "coach")
      .map(toCoach);
    const myStudents = user
      ? profiles.filter((p) => p.coach_id === user.id).map(toStudent)
      : [];

    return {
      loading,
      user,
      role,
      student: role === "student" && me ? toStudent(me) : null,
      coach: role === "coach" && me ? toCoach(me) : null,
      coachList,
      myStudents,
      refresh: () => load(user?.id ?? null),
      setCoach: async (coachId) => {
        if (!user) return;
        await supabase
          .from("profiles")
          .update({ coach_id: coachId })
          .eq("id", user.id);
        await load(user.id);
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfiles([]);
        setRoles({});
        setUser(null);
      },
    };
  }, [loading, user, role, me, profiles, roles, load]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

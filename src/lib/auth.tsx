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

function formatEmailToName(email: string) {
  const namePart = email.split('@')[0];
  return namePart
    .split(/[\.\-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

type Role = "student" | "coach";

// We map user_roles from V1 to the shape the UI expects
type ProfileRow = {
  user_id: string;
  full_name: string | null;
  email: string;
  role: string;
  exam_tracks: any;
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
  id: p.user_id,
  name: p.full_name || formatEmailToName(p.email),
  email: p.email,
  target: "Hedef belirlenmedi", // Not in V1 schema, default to fallback
  pending: 0,
  track: "sayisal", // Not strictly in V1 schema, default
  coachId: null, // We'll map this via coach_connections later if needed
});

const toCoach = (p: ProfileRow): Coach => ({
  id: p.user_id,
  name: p.full_name || formatEmailToName(p.email),
  email: p.email,
  title: "Koç",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [coachConnections, setCoachConnections] = useState<{ student_id: string; coach_id: string }[]>([]);

  const load = useCallback(async (uid: string | null) => {
    if (!uid) {
      setProfiles([]);
      setRoles({});
      setCoachConnections([]);
      return;
    }
    
    // Fetch all user roles for the coach/student listings
    const { data: roleRows, error } = await supabase
        .from("user_roles")
        .select("user_id, email, role, exam_tracks");
        
    console.log("Supabase Auth UID:", uid);
    console.log("Supabase User Roles Fetch Error:", error ? JSON.stringify(error) : "None");
    console.log("Supabase User Roles Fetched:", roleRows);

    // Fetch connections for coach-student relationship
    const { data: connections } = await supabase
        .from("coach_connections")
        .select("student_id, coach_id")
        .eq("status", "approved");

    setProfiles((roleRows ?? []) as ProfileRow[]);
    setRoles(
      Object.fromEntries(
        (roleRows ?? []).map((r) => [r.user_id, r.role as Role]),
      ),
    );
    setCoachConnections(connections ?? []);
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

    // If the user is logged in but doesn't have a role in the DB yet, default to student for testing
  let me = profiles.find((p) => p.user_id === user?.id) ?? null;
  let role = user ? (roles[user.id] ?? null) : null;
  
  if (user && !role) {
    role = "student";
    me = {
      user_id: user.id,
      full_name: user.email?.split("@")[0] || "Test",
      email: user.email || "",
      role: "student",
      exam_tracks: []
    };
  }

  const value = useMemo<AuthValue>(() => {
    const coachList = profiles
      .filter((p) => p.role === "coach")
      .map(toCoach);
      
    // Students belonging to this coach
    const myStudentIds = coachConnections.filter(c => c.coach_id === user?.id).map(c => c.student_id);
    const myStudents = user
      ? profiles.filter((p) => myStudentIds.includes(p.user_id)).map(toStudent)
      : [];
      
    // Attach coach ID to the current student
    let currentStudent = role === "student" && me ? toStudent(me) : null;
    if (currentStudent) {
        const connection = coachConnections.find(c => c.student_id === currentStudent!.id);
        if (connection) {
            currentStudent.coachId = connection.coach_id;
        }
    }

    return {
      loading,
      user,
      role,
      student: currentStudent,
      coach: role === "coach" && me ? toCoach(me) : null,
      coachList,
      myStudents,
      refresh: () => load(user?.id ?? null),
      setCoach: async (coachId) => {
        if (!user) return;
        
        // Remove existing connections
        await supabase.from("coach_connections").delete().eq("student_id", user.id);
        
        if (coachId) {
            await supabase
              .from("coach_connections")
              .insert({ student_id: user.id, coach_id: coachId, status: "approved" });
        }
        await load(user.id);
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfiles([]);
        setRoles({});
        setUser(null);
      },
    };
  }, [loading, user, role, me, profiles, roles, coachConnections, load]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

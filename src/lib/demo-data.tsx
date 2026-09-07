import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { realExams } from "@/lib/topics-data";


export const YKS_DATE = new Date("2027-06-19T10:00:00Z");

export function daysUntilYks(from: Date = new Date()) {
  return Math.max(
    0,
    Math.ceil((YKS_DATE.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export type StudyLog = {
  id: string;
  date: string;
  source: string;
  kind?: "konu" | "soru";
  solved?: number;
  wrong?: number;
  blank?: number;
};

export type Topic = {
  id: string;
  name: string;
  mastery: number; // 0..5
  debt: number;
  logs: StudyLog[];
};

export type Area = {
  id: string;
  name: string;
  topics: Topic[];
  /** Alan seviyesinde tutulan çalışma kayıtları */
  logs?: StudyLog[];
  /** Alan seviyesinde 0..5 hakimiyet (girilmediyse konulardan hesaplanır) */
  mastery?: number;
  /** Alan seviyesinde ek öğrenme borcu */
  debt?: number;
};
export type Subject = { id: string; name: string; areas: Area[] };

export type Track = "sayisal" | "sozel" | "esit";
export type Exam = {
  id: string;
  name: string;
  track: Track | null; // null = TYT, herkes için ortak
  subjects: Subject[];
};

export const TRACK_LABELS: Record<Track, string> = {
  sayisal: "AYT Sayısal",
  sozel: "AYT Sözel",
  esit: "AYT Eşit Ağırlık",
};

export type TaskKind = "konu" | "soru" | "deneme";

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
  konu: "Konu Çalışması",
  soru: "Soru Çözümü",
  deneme: "Deneme",
};

export type TaskResult = {
  /** Soru çözümü için */
  solved?: number;
  wrong?: number;
  blank?: number;
  /** Kaynak adı (kitap / yayın / fasikül) */
  source?: string;
  /** Deneme için */
  mockExamId?: string;
  note?: string;
};

export type Task = {
  id: string;
  kind: TaskKind;
  subject: string;
  title: string;
  day: number; // 0 = Pazartesi
  weekOffset?: number;
  done: boolean;
  studentId: string;
  topicId?: string | null | undefined;
  areaId?: string | null | undefined;
  /** Alan / konu adı (günlük raporda gösterilir) */
  areaName?: string | undefined;
  topicName?: string | undefined;
  /** Ödevi kim ekledi: öğrenci mi koç mu */
  assignedBy?: "student" | "coach" | undefined;
  /** Tamamlanma tarihi (YYYY-MM-DD) */
  completedAt?: string | undefined;

  result?: TaskResult | undefined;
};


export type MockExam = {
  id: string;
  date: string;
  publisher: string;
  type: "TYT" | "AYT";
  turkce: number;
  matematik: number;
  sosyal: number;
  fen: number;
  studentId?: string | undefined;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  target: string;
  pending: number;
  track: Track;
  coachId: string | null;
};

export type Coach = {
  id: string;
  name: string;
  email: string;
  title: string;
};

export type Session =
  | { role: "student"; id: string }
  | { role: "coach"; id: string }
  | null;

const topic = (
  id: string,
  name: string,
  mastery: number,
  debt: number,
  logs: StudyLog[] = [],
): Topic => ({ id, name, mastery, debt, logs });

const baseLogs: StudyLog[] = [
  { id: "l1", date: "12.09.2026", source: "3D Soru Bankası", solved: 40, wrong: 6, blank: 2 },
  { id: "l2", date: "18.09.2026", source: "Endemik Deneme", solved: 25, wrong: 3, blank: 1 },
];

export const exams: Exam[] = [
  ...realExams,
];
export const mockExams: MockExam[] = [];

export const coachList = [
  { id: "c1", name: "Zeynep Koç", email: "zeynep@hedefe.net", title: "Sayısal Koçu" },
  { id: "c2", name: "Ahmet Demir", email: "ahmet@hedefe.net", title: "Eşit Ağırlık Koçu" },
];

export const students: Student[] = [
  { id: "s1", name: "Ismail Pehlivan", email: "ismail@hedefe.net", target: "Çapa Tıp Fakültesi", pending: 3, track: "sayisal", coachId: "c1" },
  { id: "s2", name: "Elif Yıldız", email: "elif@hedefe.net", target: "Boğaziçi Bilgisayar Müh.", pending: 1, track: "sayisal", coachId: "c1" },
  { id: "s3", name: "Mert Aydın", email: "mert@hedefe.net", target: "Hacettepe Diş Hekimliği", pending: 5, track: "sayisal", coachId: null },
  { id: "s4", name: "Zehra Kaya", email: "zehra@hedefe.net", target: "İstanbul Hukuk", pending: 2, track: "esit", coachId: "c1" },
  { id: "s5", name: "Burak Şahin", email: "burak@hedefe.net", target: "ODTÜ İşletme", pending: 4, track: "esit", coachId: "c1" },
  { id: "s6", name: "Ayşe Demirtaş", email: "ayse@hedefe.net", target: "Ankara Psikoloji", pending: 0, track: "esit", coachId: "c1" },
  { id: "s7", name: "Kerem Doğan", email: "kerem@hedefe.net", target: "Gazi Tarih Öğretmenliği", pending: 6, track: "sozel", coachId: "c1" },
  { id: "s8", name: "Selin Arslan", email: "selin@hedefe.net", target: "İstanbul Türk Dili ve Ed.", pending: 3, track: "sozel", coachId: "c1" },
  { id: "s9", name: "Emre Çelik", email: "emre@hedefe.net", target: "İTÜ Elektrik Müh.", pending: 2, track: "sayisal", coachId: "c1" },
  { id: "s10", name: "Nisa Öztürk", email: "nisa@hedefe.net", target: "Ege Eczacılık", pending: 7, track: "sayisal", coachId: "c1" },
  { id: "s11", name: "Yusuf Kılıç", email: "yusuf@hedefe.net", target: "Marmara İktisat", pending: 1, track: "esit", coachId: "c2" },
  { id: "s12", name: "Deniz Acar", email: "deniz@hedefe.net", target: "Dokuz Eylül Hukuk", pending: 4, track: "esit", coachId: "c2" },
  { id: "s13", name: "Ece Korkmaz", email: "ece@hedefe.net", target: "Hacettepe Sosyoloji", pending: 2, track: "sozel", coachId: "c2" },
  { id: "s14", name: "Efe Yalçın", email: "efe@hedefe.net", target: "Koç Üniversitesi Tıp", pending: 5, track: "sayisal", coachId: "c2" },
];


export const CURRENT_STUDENT: Student = students[0]!;

/** Basit deterministik sayı üreteci (aynı öğrenci hep aynı örnek veriyi görür) */
function seedNum(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

export const SUBJECT_OPTIONS = [
  "Türkçe",
  "Matematik",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
];

type Store = {
  tasks: Task[];
  addTask: (t: Omit<Task, "id" | "done" | "kind"> & { kind?: TaskKind }) => void;
  completeTask: (id: string, result?: TaskResult) => void;
  mockExamList: MockExam[];
  addMockExam: (e: Omit<MockExam, "id">) => string;
  toggleTask: (id: string) => void;
  moveTask: (id: string, day: number) => void;
  examData: Exam[];
  addLog: (topicId: string, log: Omit<StudyLog, "id">) => void;
  addAreaLog: (areaId: string, log: Omit<StudyLog, "id">) => void;

  studyLogs: any[];

  session: Session;
  studentList: Student[];
  currentStudent: Student | null;
  currentCoach: Coach | null;
  coachList: Coach[];
  setCoach: (coachId: string | null) => void;
};

const StoreContext = createContext<Store | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [examData, setExamData] = useState<Exam[]>(exams);
  const auth = useAuth();
  const queryClient = useQueryClient();

  const targetStudentId = auth.student?.id || (auth.user && auth.role === "student" ? auth.user.id : null);

  const { data: tasksData } = useQuery({
    queryKey: ["tasks", targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("student_id", targetStudentId);
      if (error) throw error;
      // Map DB snake_case fields to Task camelCase fields
      return (data || []).map((row: any): Task => ({
        id: row.id,
        kind: row.kind as TaskKind,
        subject: row.subject,
        title: row.title,
        day: row.day,
        weekOffset: row.week_offset ?? 0,
        done: row.done,
        studentId: row.student_id,
        topicId: row.topic_id,
        areaId: row.area_id,
        areaName: row.area_name,
        topicName: row.topic_name,
        assignedBy: row.assigned_by,
        result: row.result as TaskResult | undefined,
      }));
    },
    enabled: !!targetStudentId,
  });

  const { data: mockExamsData } = useQuery({
    queryKey: ["mock_exams", targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return [];
      const { data, error } = await supabase
        .from("mock_exams")
        .select("*")
        .eq("user_id", targetStudentId);
      if (error) throw error;
      return data as any as MockExam[];
    },
    enabled: !!targetStudentId,
  });

  const { data: studyLogsData } = useQuery({
    queryKey: ["study_logs", targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return [];
      const { data, error } = await supabase
        .from("study_logs")
        .select("*")
        .eq("user_id", targetStudentId);
      if (error) throw error;
      return (data || []).map((row: any): StudyLog => ({
        id: row.id,
        date: row.date,
        source: row.source,
        kind: row.kind,
        solved: row.total_questions,
        wrong: row.wrong,
        blank: row.blank,
      }));
    },
    enabled: !!targetStudentId,
  });

  const addTaskMutation = useMutation({
    mutationFn: async (t: Omit<Task, "id" | "done" | "kind"> & { kind?: TaskKind }) => {
      const assignedBy = auth.role === "coach" ? "coach" : "student";
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          student_id: t.studentId,
          kind: t.kind ?? "konu",
          subject: t.subject,
          title: t.title,
          day: t.day,
          week_offset: t.weekOffset ?? 0,
          done: false,
          topic_id: t.topicId || null,
          area_id: t.areaId || null,
          area_name: t.areaName || null,
          topic_name: t.topicName || null,
          assigned_by: assignedBy,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ id, result }: { id: string, result?: TaskResult | undefined }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          done: true,
          result: result || null
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const task = (tasksData || []).find(t => t.id === id);
      if (!task) return;
      const { data, error } = await supabase
        .from("tasks")
        .update({ done: !task.done })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const moveTaskMutation = useMutation({
    mutationFn: async ({ id, day }: { id: string, day: number }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ day })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const addMockExamMutation = useMutation({
    mutationFn: async (e: Omit<MockExam, "id">) => {
      const { data, error } = await supabase
        .from("mock_exams")
        .insert({
          user_id: e.studentId || targetStudentId || "",
          date: e.date,
          exam_type: e.type,
          title: e.publisher,
          results_data: { turkce: e.turkce, matematik: e.matematik, sosyal: e.sosyal, fen: e.fen },
          net_score: e.turkce + e.matematik + e.sosyal + e.fen,
          total_questions: e.type === "TYT" ? 120 : 160
        })
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock_exams"] }),
  });

  const currentStudent = auth.student;
  const currentCoach = auth.coach;
  const studentList = auth.myStudents;
  const coachList = auth.coachList;
  const session: Session = auth.user
    ? auth.role === "coach"
      ? { role: "coach", id: auth.user.id }
      : auth.role === "student"
        ? { role: "student", id: auth.user.id }
        : null
    : null;

  const addLogMutation = useMutation({
    mutationFn: async ({ topicId, log, isArea }: { topicId: string, log: Omit<StudyLog, "id">, isArea?: boolean }) => {
      if (!targetStudentId) throw new Error("No user");
      const { data, error } = await supabase
        .from("study_logs")
        .insert({
          user_id: targetStudentId,
          date: log.date,
          subject: "Bilinmiyor", 
          area: "Bilinmiyor", 
          sub_topic: topicId,
          source: log.source,
          kind: log.kind,
          total_questions: log.solved ?? 0,
          correct: Math.max(0, (log.solved ?? 0) - (log.wrong ?? 0) - (log.blank ?? 0)),
          wrong: log.wrong ?? 0,
          blank: log.blank ?? 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study_logs"] }),
  });

  const value = useMemo<Store>(
    () => ({
      tasks: tasksData || [],
      examData,
      session,
      studentList,
      currentStudent,
      currentCoach,
      coachList,
      setCoach: (coachId) => {
        void auth.setCoach(coachId);
      },

      addTask: (t) => addTaskMutation.mutate(t),
      completeTask: (id, result) => completeTaskMutation.mutate({ id, result }),
      mockExamList: mockExamsData || [],
      addMockExam: (e) => {
        addMockExamMutation.mutate(e);
        return "temp-id";
      },
      toggleTask: (id) => toggleTaskMutation.mutate(id),
      moveTask: (id, day) => moveTaskMutation.mutate({ id, day }),
      addLog: (topicId, log) => addLogMutation.mutate({ topicId, log }),
      addAreaLog: (areaId, log) => addLogMutation.mutate({ topicId: areaId, log, isArea: true }),
      studyLogs: studyLogsData || [],
    }),

    [
      tasksData,
      mockExamsData,
      studyLogsData,
      examData,
      session,
      studentList,
      currentStudent,
      currentCoach,
      coachList,
      auth,
      addTaskMutation,
      completeTaskMutation,
      toggleTaskMutation,
      moveTaskMutation,
      addMockExamMutation
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useDemoData() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDemoData must be used inside DemoDataProvider");
  return ctx;
}

export function topicStats(exam: Exam) {
  let mastery = 0;
  let count = 0;
  let debt = 0;
  for (const s of exam.subjects)
    for (const a of s.areas)
      for (const t of a.topics) {
        mastery += t.mastery;
        debt += t.debt;
        count++;
      }
  return {
    success: count ? Math.round((mastery / (count * 5)) * 100) : 0,
    debt,
  };
}

export function subjectStats(subject: Subject) {
  let mastery = 0;
  let count = 0;
  let debt = 0;
  for (const a of subject.areas)
    for (const t of a.topics) {
      mastery += t.mastery;
      debt += t.debt;
      count++;
    }
  return {
    success: count ? Math.round((mastery / (count * 5)) * 100) : 0,
    debt,
  };
}

/** Alanın konularından ortalama hakimiyet (0..5). */
export function areaMasteryFromTopics(area: Area) {
  if (!area.topics.length) return 0;
  const sum = area.topics.reduce((n, t) => n + t.mastery, 0);
  return Math.round(sum / area.topics.length);
}

/** Alan seviyesinde gösterilecek hakimiyet, borç ve kayıtlar. */
export function areaStats(area: Area) {
  const topicDebt = area.topics.reduce((n, t) => n + t.debt, 0);
  return {
    mastery: area.mastery ?? areaMasteryFromTopics(area),
    debt: topicDebt + (area.debt ?? 0),
    logs: area.logs ?? [],
  };
}


/* ---------- Analiz yardımcıları ---------- */

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/** Öğrencinin alanına göre TYT + ilgili AYT sınavlarını, kişiye özel varyasyonla döner. */
export function examsForStudent(all: Exam[], student: Student, studyLogs: any[] = []): Exam[] {
  return all
    .filter((e) => e.track === null || e.track === student.track)
    .map((e) => ({
      ...e,
      subjects: e.subjects.map((s) => ({
        ...s,
        areas: s.areas.map((a) => {
          const areaLogsRaw = studyLogs.filter((l) => l.sub_topic === a.id);
          const areaLogs = areaLogsRaw.map((l) => ({
            id: l.id,
            date: l.date,
            source: l.source,
            solved: l.total_questions,
            wrong: l.wrong_answers,
            blank: l.blank_answers,
          }));

          return {
          ...a,
          logs: areaLogs,
          topics: a.topics.map((t) => {
            const topicLogsRaw = studyLogs.filter((l) => l.sub_topic === t.id);
            const topicLogs = topicLogsRaw.map((l) => ({
              id: l.id,
              date: l.date,
              source: l.source,
              solved: l.total_questions,
              wrong: l.wrong_answers,
              blank: l.blank_answers,
            }));

            let totalQ = 0;
            let correct = 0;
            for (const l of topicLogsRaw) {
               totalQ += l.total_questions;
               correct += l.correct_answers;
            }
            const mastery = totalQ > 0 ? Math.max(1, Math.min(5, Math.round((correct / totalQ) * 5))) : 0;

            return {
              ...t,
              mastery,
              debt: 0,
              logs: topicLogs,
            };
          }),
        }}),
      })),
    }));
}

export function subjectScoresOf(list: Exam[]) {
  const map = new Map<string, { mastery: number; count: number }>();
  for (const e of list)
    for (const s of e.subjects) {
      const key = `${e.id === "tyt" ? "TYT" : "AYT"} ${s.name}`;
      const cur = map.get(key) ?? { mastery: 0, count: 0 };
      for (const a of s.areas)
        for (const t of a.topics) {
          cur.mastery += t.mastery;
          cur.count++;
        }
      map.set(key, cur);
    }
  return [...map.entries()].map(([name, v]) => ({
    name,
    score: v.count ? Math.round((v.mastery / (v.count * 5)) * 1000) / 10 : 0,
  }));
}

export type WeakTopic = {
  topic: Topic;
  exam: string;
  subject: string;
  area: string;
};

export function weakestTopics(list: Exam[], limit = 5): WeakTopic[] {
  const rows: WeakTopic[] = [];
  for (const e of list)
    for (const s of e.subjects)
      for (const a of s.areas)
        for (const t of a.topics)
          rows.push({ topic: t, exam: e.name, subject: s.name, area: a.name });
  return rows
    .sort(
      (x, y) =>
        y.topic.debt - x.topic.debt || x.topic.mastery - y.topic.mastery,
    )
    .slice(0, limit);
}

export function overallStats(list: Exam[]) {
  let mastery = 0;
  let count = 0;
  let debt = 0;
  for (const e of list)
    for (const s of e.subjects)
      for (const a of s.areas)
        for (const t of a.topics) {
          mastery += t.mastery;
          debt += t.debt;
          count++;
        }
  return {
    success: count ? Math.round((mastery / (count * 5)) * 100) : 0,
    debt,
    topics: count,
  };
}

export type TopicOption = {
  topicId: string;
  topicName: string;
  areaName: string;
  subjectName: string;
  examName: string;
  label: string;
};

/** Öğrencinin sınavlarındaki tüm konuları Ders > Alan > Konu olarak düzleştirir. */
export function flatTopics(list: Exam[]): TopicOption[] {
  const rows: TopicOption[] = [];
  for (const e of list)
    for (const s of e.subjects)
      for (const a of s.areas)
        for (const t of a.topics)
          rows.push({
            topicId: t.id,
            topicName: t.name,
            areaName: a.name,
            subjectName: s.name,
            examName: e.name,
            label: `${e.name} · ${s.name} · ${a.name} · ${t.name}`,
          });
  return rows;
}

export type TargetKind = "area" | "topic";

export type StudyTarget = {
  kind: TargetKind;
  id: string;
  name: string;
  areaName: string;
  subjectName: string;
  examName: string;
  label: string;
};

/** Alanları ve konuları birlikte, seçilebilir hedefler olarak düzleştirir. */
export function flatTargets(list: Exam[]): StudyTarget[] {
  const rows: StudyTarget[] = [];
  for (const e of list)
    for (const s of e.subjects)
      for (const a of s.areas) {
        rows.push({
          kind: "area",
          id: a.id,
          name: a.name,
          areaName: a.name,
          subjectName: s.name,
          examName: e.name,
          label: `${e.name} · ${s.name} · ${a.name}`,
        });
        for (const t of a.topics)
          rows.push({
            kind: "topic",
            id: t.id,
            name: t.name,
            areaName: a.name,
            subjectName: s.name,
            examName: e.name,
            label: `${e.name} · ${s.name} · ${a.name} · ${t.name}`,
          });
      }
  return rows;
}

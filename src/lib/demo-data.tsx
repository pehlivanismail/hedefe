import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth";
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
  solved: number;
  wrong: number;
  blank: number;
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
  done: boolean;
  studentId: string;
  topicId?: string | null | undefined;
  areaId?: string | null | undefined;

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

  {
    id: "ayt-sozel",
    name: "AYT Sözel",
    track: "sozel",
    subjects: [
      {
        id: "ayt-edebiyat",
        name: "Edebiyat",
        areas: [
          {
            id: "siir-bilgisi",
            name: "Şiir Bilgisi",
            topics: [
              topic("siir-1", "Ölçü ve Uyak", 4, 1, baseLogs),
              topic("siir-2", "Söz Sanatları", 3, 3),
            ],
          },
          {
            id: "edebi-donemler",
            name: "Edebi Dönemler",
            topics: [
              topic("donem-1", "Divan Edebiyatı", 2, 5),
              topic("donem-2", "Tanzimat Edebiyatı", 2, 4),
            ],
          },
        ],
      },
      {
        id: "ayt-tarih-sozel",
        name: "Tarih",
        areas: [
          {
            id: "osmanli",
            name: "Osmanlı Tarihi",
            topics: [
              topic("osmanli-1", "Kuruluş Dönemi", 3, 2, baseLogs),
              topic("osmanli-2", "Dağılma Dönemi", 1, 6),
            ],
          },
        ],
      },
      {
        id: "ayt-cografya-sozel",
        name: "Coğrafya",
        areas: [
          {
            id: "beseri",
            name: "Beşeri Coğrafya",
            topics: [
              topic("beseri-1", "Nüfus Politikaları", 3, 2),
              topic("beseri-2", "Göçler", 2, 3),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ayt-esit",
    name: "AYT Eşit Ağırlık",
    track: "esit",
    subjects: [
      {
        id: "ayt-mat-ea",
        name: "Matematik",
        areas: [
          {
            id: "ea-turev",
            name: "Türev",
            topics: [
              topic("ea-turev-1", "Limit ve Süreklilik", 3, 2, baseLogs),
              topic("ea-turev-2", "Türev Uygulamaları", 2, 5),
            ],
          },
          {
            id: "ea-diziler",
            name: "Diziler",
            topics: [topic("ea-diziler-1", "Aritmetik Diziler", 2, 4)],
          },
        ],
      },
      {
        id: "ayt-edebiyat-ea",
        name: "Edebiyat",
        areas: [
          {
            id: "ea-siir",
            name: "Şiir Bilgisi",
            topics: [
              topic("ea-siir-1", "Ölçü ve Uyak", 3, 2),
              topic("ea-siir-2", "Söz Sanatları", 2, 4),
            ],
          },
        ],
      },
      {
        id: "ayt-tarih-ea",
        name: "Tarih",
        areas: [
          {
            id: "ea-inkilap",
            name: "İnkılap Tarihi",
            topics: [
              topic("ea-inkilap-1", "Kurtuluş Savaşı", 3, 3),
              topic("ea-inkilap-2", "Atatürk İlkeleri", 2, 4),
            ],
          },
        ],
      },
    ],
  },
];

export const mockExams: MockExam[] = [
  { id: "d1", date: "05.07.2026", publisher: "Endemik", type: "TYT", turkce: 28, matematik: 22, sosyal: 14, fen: 12 },
  { id: "d2", date: "19.07.2026", publisher: "3D", type: "TYT", turkce: 31, matematik: 25, sosyal: 15, fen: 14 },
  { id: "d3", date: "02.08.2026", publisher: "Bilgi Sarmal", type: "TYT", turkce: 33, matematik: 28, sosyal: 16, fen: 15 },
  { id: "d4", date: "16.08.2026", publisher: "Apotemi", type: "AYT", turkce: 18, matematik: 20, sosyal: 8, fen: 22 },
  { id: "d5", date: "30.08.2026", publisher: "Endemik", type: "AYT", turkce: 20, matematik: 24, sosyal: 9, fen: 26 },
  { id: "d6", date: "13.09.2026", publisher: "3D", type: "AYT", turkce: 21, matematik: 27, sosyal: 10, fen: 29 },
];

export const coaches: Coach[] = [
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

const initialTasks: Task[] = [
  { id: "t1", kind: "soru", subject: "Fizik", title: "Newton Hareket Yasaları Test 1", day: 0, done: true, studentId: "s1" },
  { id: "t2", kind: "soru", subject: "Matematik", title: "Türev Uygulamaları 40 soru", day: 0, done: false, studentId: "s1" },
  { id: "t3", kind: "konu", subject: "Biyoloji", title: "Hücre Bölünmeleri konu tekrarı", day: 1, done: false, studentId: "s1" },
  { id: "t4", kind: "soru", subject: "Türkçe", title: "Paragraf 30 soru", day: 2, done: true, studentId: "s1" },
  { id: "t5", kind: "soru", subject: "Kimya", title: "Mol Kavramı Test 3", day: 3, done: false, studentId: "s1" },
  { id: "t6", kind: "konu", subject: "Tarih", title: "İnkılap Tarihi özet çıkar", day: 4, done: false, studentId: "s1" },
  { id: "t7", kind: "deneme", subject: "Matematik", title: "TYT Deneme çöz", day: 5, done: false, studentId: "s1" },
  { id: "t8", kind: "konu", subject: "Biyoloji", title: "Haftalık tekrar", day: 6, done: false, studentId: "s1" },
  { id: "t9", kind: "soru", subject: "Fizik", title: "Optik Test 2", day: 2, done: false, studentId: "s2" },
];

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

  session: Session;
  studentList: Student[];
  currentStudent: Student | null;
  currentCoach: Coach | null;
  coachList: Coach[];
  setCoach: (coachId: string | null) => void;
};

const StoreContext = createContext<Store | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [examData, setExamData] = useState<Exam[]>(exams);
  const [mockExamList, setMockExamList] = useState<MockExam[]>(mockExams);
  const auth = useAuth();

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


  const value = useMemo<Store>(
    () => ({
      tasks,
      examData,
      session,
      studentList,
      currentStudent,
      currentCoach,
      coachList,
      setCoach: (coachId) => {
        void auth.setCoach(coachId);
      },

      addTask: (t) =>
        setTasks((prev) => [
          ...prev,
          { kind: "konu" as TaskKind, ...t, id: `t-${Date.now()}`, done: false },
        ]),
      completeTask: (id, result) =>
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, done: true, result: result ?? t.result } : t,
          ),
        ),
      mockExamList,
      addMockExam: (e) => {
        const id = `d-${Date.now()}`;
        setMockExamList((prev) => [...prev, { ...e, id }]);
        return id;
      },
      toggleTask: (id) =>
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        ),
      moveTask: (id, day) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, day } : t))),
      addLog: (topicId, log) =>
        setExamData((prev) =>
          prev.map((e) => ({
            ...e,
            subjects: e.subjects.map((s) => ({
              ...s,
              areas: s.areas.map((a) => ({
                ...a,
                topics: a.topics.map((tp) =>
                  tp.id === topicId
                    ? {
                        ...tp,
                        debt: Math.max(0, tp.debt + log.wrong + log.blank - 1),
                        logs: [...tp.logs, { ...log, id: `l-${Date.now()}` }],
                      }
                    : tp,
                ),
              })),
            })),
          })),
        ),
    }),
    [
      tasks,
      examData,
      mockExamList,
      session,
      studentList,
      currentStudent,
      currentCoach,
      coachList,
      auth,
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

/* ---------- Analiz yardımcıları ---------- */

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/** Öğrencinin alanına göre TYT + ilgili AYT sınavlarını, kişiye özel varyasyonla döner. */
export function examsForStudent(all: Exam[], student: Student): Exam[] {
  return all
    .filter((e) => e.track === null || e.track === student.track)
    .map((e) => ({
      ...e,
      subjects: e.subjects.map((s) => ({
        ...s,
        areas: s.areas.map((a) => ({
          ...a,
          topics: a.topics.map((t) => {
            const seed = hash(student.id + t.id);
            return {
              ...t,
              mastery: clamp(t.mastery - 1 + (seed % 3), 0, 5),
              debt: clamp(t.debt + (seed % 5) - 2, 0, 20),
            };
          }),
        })),
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

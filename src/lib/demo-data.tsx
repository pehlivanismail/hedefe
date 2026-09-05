import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

export type Area = { id: string; name: string; topics: Topic[] };
export type Subject = { id: string; name: string; areas: Area[] };
export type Exam = { id: string; name: string; subjects: Subject[] };

export type Task = {
  id: string;
  subject: string;
  title: string;
  day: number; // 0 = Pazartesi
  done: boolean;
  studentId: string;
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
};

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

export const subjectScores = [
  { name: "Türkçe", score: 80 },
  { name: "Matematik", score: 62.5 },
  { name: "Fizik", score: 47 },
  { name: "Kimya", score: 71 },
  { name: "Biyoloji", score: 88.5 },
  { name: "Tarih", score: 54 },
];

export const exams: Exam[] = [
  {
    id: "ayt",
    name: "AYT",
    subjects: [
      {
        id: "ayt-bio",
        name: "Biyoloji",
        areas: [
          {
            id: "hucre",
            name: "Hücre",
            topics: [
              topic("hucre-1", "Hücre Zarı ve Madde Geçişleri", 4, 2, baseLogs),
              topic("hucre-2", "Organeller", 3, 3, baseLogs.slice(0, 1)),
              topic("hucre-3", "Hücre Bölünmeleri", 2, 5),
            ],
          },
          {
            id: "kalitim",
            name: "Kalıtım",
            topics: [
              topic("kalitim-1", "Mendel Genetiği", 3, 1, baseLogs),
              topic("kalitim-2", "Eşeye Bağlı Kalıtım", 1, 4),
            ],
          },
        ],
      },
      {
        id: "ayt-mat",
        name: "Matematik",
        areas: [
          {
            id: "turev",
            name: "Türev",
            topics: [
              topic("turev-1", "Limit ve Süreklilik", 3, 2, baseLogs),
              topic("turev-2", "Türev Uygulamaları", 2, 6),
            ],
          },
          {
            id: "integral",
            name: "İntegral",
            topics: [
              topic("integral-1", "Belirsiz İntegral", 2, 3),
              topic("integral-2", "Alan Hesapları", 1, 5),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tyt",
    name: "TYT",
    subjects: [
      {
        id: "tyt-turkce",
        name: "Türkçe",
        areas: [
          {
            id: "paragraf",
            name: "Paragraf",
            topics: [
              topic("paragraf-1", "Anlatım Teknikleri", 5, 0, baseLogs),
              topic("paragraf-2", "Anlam Bütünlüğü", 4, 1),
            ],
          },
        ],
      },
      {
        id: "tyt-fizik",
        name: "Fizik",
        areas: [
          {
            id: "hareket",
            name: "Hareket",
            topics: [
              topic("hareket-1", "Newton Hareket Yasaları", 3, 2, baseLogs),
              topic("hareket-2", "Bağıl Hareket", 2, 4),
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

export const students: Student[] = [
  { id: "s1", name: "Ismail Pehlivan", email: "ismail@hedefe.net", target: "Çapa Tıp Fakültesi", pending: 3 },
  { id: "s2", name: "Elif Yıldız", email: "elif@hedefe.net", target: "Boğaziçi Bilgisayar Müh.", pending: 1 },
  { id: "s3", name: "Mert Aydın", email: "mert@hedefe.net", target: "Hacettepe Diş Hekimliği", pending: 5 },
];

export const CURRENT_STUDENT = students[0];

const initialTasks: Task[] = [
  { id: "t1", subject: "Fizik", title: "Newton Hareket Yasaları Test 1", day: 0, done: true, studentId: "s1" },
  { id: "t2", subject: "Matematik", title: "Türev Uygulamaları 40 soru", day: 0, done: false, studentId: "s1" },
  { id: "t3", subject: "Biyoloji", title: "Hücre Bölünmeleri konu tekrarı", day: 1, done: false, studentId: "s1" },
  { id: "t4", subject: "Türkçe", title: "Paragraf 30 soru", day: 2, done: true, studentId: "s1" },
  { id: "t5", subject: "Kimya", title: "Mol Kavramı Test 3", day: 3, done: false, studentId: "s1" },
  { id: "t6", subject: "Tarih", title: "İnkılap Tarihi özet çıkar", day: 4, done: false, studentId: "s1" },
  { id: "t7", subject: "Matematik", title: "TYT Deneme çöz", day: 5, done: false, studentId: "s1" },
  { id: "t8", subject: "Biyoloji", title: "Haftalık tekrar", day: 6, done: false, studentId: "s1" },
  { id: "t9", subject: "Fizik", title: "Optik Test 2", day: 2, done: false, studentId: "s2" },
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
  addTask: (t: Omit<Task, "id" | "done">) => void;
  toggleTask: (id: string) => void;
  moveTask: (id: string, day: number) => void;
  examData: Exam[];
  addLog: (topicId: string, log: Omit<StudyLog, "id">) => void;
};

const StoreContext = createContext<Store | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [examData, setExamData] = useState<Exam[]>(exams);

  const value = useMemo<Store>(
    () => ({
      tasks,
      examData,
      addTask: (t) =>
        setTasks((prev) => [
          ...prev,
          { ...t, id: `t-${Date.now()}`, done: false },
        ]),
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
    [tasks, examData],
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

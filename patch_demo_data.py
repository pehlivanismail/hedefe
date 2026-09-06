import re
import sys

file_path = "src/lib/demo-data.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Add imports for Supabase and useQuery at the top
if 'import { supabase }' not in content:
    content = content.replace('import { useAuth } from "@/lib/auth";', 'import { useAuth } from "@/lib/auth";\nimport { supabase } from "@/integrations/supabase/client";\nimport { useQuery } from "@tanstack/react-query";')

# Now let's replace the DemoDataProvider implementation
provider_start = content.find("export function DemoDataProvider({ children }: { children: ReactNode }) {")
if provider_start == -1:
    print("Could not find DemoDataProvider")
    sys.exit(1)

# We want to replace everything from provider_start to the end of the Provider (where it returns <StoreContext.Provider>)
provider_end = content.find("return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;", provider_start)
if provider_end == -1:
    print("Could not find end of DemoDataProvider")
    sys.exit(1)

new_provider = """export function DemoDataProvider({ children }: { children: ReactNode }) {
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

  // Use react-query to fetch data from Supabase if we have a student
  const targetStudentId = currentStudent?.id || (session?.role === 'student' ? session.id : null);

  const { data: studyLogsData } = useQuery({
    queryKey: ['study_logs', targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return [];
      const { data } = await supabase.from('study_logs').select('*').eq('user_id', targetStudentId);
      return data || [];
    },
    enabled: !!targetStudentId
  });

  const { data: mockExamsData } = useQuery({
    queryKey: ['mock_exams', targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return [];
      const { data } = await supabase.from('mock_exams').select('*').eq('user_id', targetStudentId);
      return data || [];
    },
    enabled: !!targetStudentId
  });

  const { data: schedulesData } = useQuery({
    queryKey: ['weekly_schedules', targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return null;
      // Just fetch the latest weekly schedule for now
      const { data } = await supabase.from('weekly_schedules').select('*').eq('student_id', targetStudentId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      return data;
    },
    enabled: !!targetStudentId
  });

  // Reconstruct examData by injecting Supabase study_logs into the base 'exams' structure
  const examData = useMemo(() => {
    // Deep clone the base exams to avoid mutating the static mock
    const clonedExams: Exam[] = JSON.parse(JSON.stringify(exams));
    
    // Clear out all mock logs from the clone and reset mastery/debt
    for (const e of clonedExams) {
      for (const s of e.subjects) {
        for (const a of s.areas) {
          for (const t of a.topics) {
            t.logs = [];
            t.mastery = 0;
            t.debt = 0;
          }
        }
      }
    }
    
    // Inject real logs
    if (studyLogsData && studyLogsData.length > 0) {
      for (const log of studyLogsData) {
        // Find the topic
        for (const e of clonedExams) {
          for (const s of e.subjects) {
            if (s.name !== log.subject && s.id !== log.subject) continue;
            for (const a of s.areas) {
              if (a.name !== log.area && a.id !== log.area) continue;
              for (const t of a.topics) {
                if (t.name === log.sub_topic || t.id === log.sub_topic) {
                   t.logs.push({
                     id: log.id,
                     date: log.date,
                     source: log.source,
                     solved: log.total_questions,
                     wrong: log.wrong_answers,
                     blank: log.blank_answers
                   });
                   // Simple mock calculation for mastery
                   t.mastery = Math.min(5, t.mastery + (log.total_questions / 50));
                   t.debt = t.debt + log.wrong_answers + log.blank_answers;
                }
              }
            }
          }
        }
      }
    }
    return clonedExams;
  }, [studyLogsData]);

  // Reconstruct mock exams
  const mockExamList = useMemo(() => {
    if (!mockExamsData) return [];
    return mockExamsData.map(dbExam => ({
      id: dbExam.id,
      name: dbExam.publisher,
      date: dbExam.date,
      type: dbExam.exam_type as any,
      score: dbExam.total_net,
      // Just mock subject breakdowns for now to prevent UI crash
      subjects: []
    }));
  }, [mockExamsData]);

  // Reconstruct tasks (weekly_schedules)
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  useEffect(() => {
    if (schedulesData?.schedule_data) {
      setLocalTasks(schedulesData.schedule_data as any);
    } else {
      setLocalTasks([]); // Or keep initialTasks if empty
    }
  }, [schedulesData]);

  const value = useMemo<Store>(
    () => ({
      tasks: localTasks,
      examData,
      mockExamList,
      addMockExam: (e) => {
        // TODO: Mutate to Supabase
        return Math.random().toString();
      },
      addLog: (topicId, log) => {
        // TODO: Mutate to Supabase
      },
      addTask: (t) => {
         // TODO: Mutate to Supabase
      },
      completeTask: (id, res) => {
         // TODO: Mutate to Supabase
      },
      toggleTask: (id) => {},
      moveTask: (id, day) => {},
      session,
      studentList,
      currentStudent,
      currentCoach,
      coachList,
      setCoach: auth.setCoach,
    }),
    [localTasks, examData, mockExamList, session, studentList, currentStudent, currentCoach, coachList, auth.setCoach],
  );

  """

full_new_content = content[:provider_start] + new_provider + content[provider_end:]

with open(file_path, "w") as f:
    f.write(full_new_content)

import sys

file_path = "src/lib/demo-data.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Add imports
if 'import { supabase }' not in content:
    content = content.replace('import { useAuth } from "@/lib/auth";', 'import { useAuth } from "@/lib/auth";\nimport { supabase } from "@/integrations/supabase/client";\nimport { useQuery } from "@tanstack/react-query";')

# Inject Supabase logic into DemoDataProvider
target_hook = """  const [examData, setExamData] = useState<Exam[]>(exams);
  const [mockExamList, setMockExamList] = useState<MockExam[]>(mockExams);
  const auth = useAuth();"""

replacement_hook = """  const [examData, setExamData] = useState<Exam[]>(exams);
  const [mockExamList, setMockExamList] = useState<MockExam[]>(mockExams);
  const auth = useAuth();

  const targetStudentId = auth.student?.id || (auth.user && auth.role === "student" ? auth.user.id : null);

  const { data: studyLogsData } = useQuery({
    queryKey: ["study_logs", targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return [];
      const { data, error } = await supabase
        .from("study_logs")
        .select("*")
        .eq("user_id", targetStudentId);
      if (error) {
        console.error("Error fetching study logs:", error);
        return [];
      }
      return data;
    },
    enabled: !!targetStudentId,
  });

  useEffect(() => {
    if (!studyLogsData) return;

    const clonedExams: Exam[] = JSON.parse(JSON.stringify(exams));
    
    // Clear out base mock logs/debt/mastery
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

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "");

    for (const log of studyLogsData) {
      let matched = false;
      const normSubj = normalize(log.subject);
      const normArea = normalize(log.area);
      const normTopic = normalize(log.sub_topic);
      
      for (const e of clonedExams) {
        for (const s of e.subjects) {
          if (normalize(s.name) !== normSubj && normalize(s.id) !== normSubj) continue;
          for (const a of s.areas) {
            if (normalize(a.name) !== normArea && normalize(a.id) !== normArea) continue;
            for (const t of a.topics) {
              if (normalize(t.name) === normTopic || normalize(t.id) === normTopic) {
                matched = true;
                t.logs.push({
                  id: log.id,
                  date: log.date,
                  source: log.source,
                  solved: log.total_questions,
                  wrong: log.wrong_answers,
                  blank: log.blank_answers,
                });
                t.mastery = Math.min(5, t.mastery + log.total_questions / 50);
                t.debt = t.debt + log.wrong_answers + log.blank_answers;
              }
            }
          }
        }
      }
      if (!matched) {
        console.warn("Unmatched DB Log:", log.subject, ">", log.area, ">", log.sub_topic, "for log ID:", log.id);
      }
    }

    setExamData(clonedExams);
  }, [studyLogsData]);"""

content = content.replace(target_hook, replacement_hook)

with open(file_path, "w") as f:
    f.write(content)
print("Patched demo-data.tsx for Lovable merge!")

import re

types_file = "src/integrations/supabase/types.ts"

with open(types_file, "r") as f:
    content = f.read()

tables_definition = """
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          target: string | null
          title: string | null
          track: Database["public"]["Enums"]["yks_track"] | null
          coach_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          target?: string | null
          title?: string | null
          track?: Database["public"]["Enums"]["yks_track"] | null
          coach_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          target?: string | null
          title?: string | null
          track?: Database["public"]["Enums"]["yks_track"] | null
          coach_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          role: string
          exam_tracks: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          role: string
          exam_tracks?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          role?: string
          exam_tracks?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      study_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          subject: string
          area: string
          sub_topic: string
          source: string
          total_questions: number
          correct_answers: number
          wrong_answers: number
          blank_answers: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          subject: string
          area: string
          sub_topic: string
          source: string
          total_questions: number
          correct_answers: number
          wrong_answers: number
          blank_answers: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          subject?: string
          area?: string
          sub_topic?: string
          source?: string
          total_questions?: number
          correct_answers?: number
          wrong_answers?: number
          blank_answers?: number
          created_at?: string
        }
        Relationships: []
      }
      mock_exams: {
        Row: {
          id: string
          user_id: string
          date: string
          exam_type: string
          publisher: string
          turkce_net: number
          matematik_net: number
          sosyal_net: number
          fen_net: number
          total_net: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          exam_type: string
          publisher: string
          turkce_net: number
          matematik_net: number
          sosyal_net: number
          fen_net: number
          total_net: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          exam_type?: string
          publisher?: string
          turkce_net?: number
          matematik_net?: number
          sosyal_net?: number
          fen_net?: number
          total_net?: number
          created_at?: string
        }
        Relationships: []
      }
      homeworks: {
        Row: {
          id: string
          student_id: string
          coach_id: string | null
          title: string
          description: string | null
          due_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          coach_id?: string | null
          title: string
          description?: string | null
          due_date: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          coach_id?: string | null
          title?: string
          description?: string | null
          due_date?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      weekly_schedules: {
        Row: {
          id: string
          student_id: string
          week_start_date: string
          schedule_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          week_start_date: string
          schedule_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          week_start_date?: string
          schedule_data?: Json
          created_at?: string
        }
        Relationships: []
      }
      coach_connections: {
        Row: {
          id: string
          coach_id: string
          student_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          student_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          student_id?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }"""

# Use regex to replace the Tables: { ... } block
# We find "Tables: {" and the next "Views: {"
new_content = re.sub(
    r"Tables:\s*\{.*?(?=\s+Views:\s*\{)",
    f"Tables: {{\n{tables_definition}",
    content,
    flags=re.DOTALL
)

with open(types_file, "w") as f:
    f.write(new_content)

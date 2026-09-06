export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {

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
      }
      tasks: {
        Row: {
          id: string
          student_id: string
          kind: string
          subject: string
          title: string
          day: number
          week_offset: number
          done: boolean
          topic_id: string | null
          area_id: string | null
          area_name: string | null
          assigned_by: string
          result: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          kind: string
          subject: string
          title: string
          day: number
          week_offset?: number
          done?: boolean
          topic_id?: string | null
          area_id?: string | null
          area_name?: string | null
          assigned_by?: string
          result?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          kind?: string
          subject?: string
          title?: string
          day?: number
          week_offset?: number
          done?: boolean
          topic_id?: string | null
          area_id?: string | null
          area_name?: string | null
          assigned_by?: string
          result?: Json | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "coach"
      yks_track: "sayisal" | "sozel" | "esit"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "coach"],
      yks_track: ["sayisal", "sozel", "esit"],
    },
  },
} as const

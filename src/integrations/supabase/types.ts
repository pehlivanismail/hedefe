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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      coach_connections: {
        Row: {
          coach_id: string | null
          created_at: string
          id: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: []
      }
      mock_exams: {
        Row: {
          created_at: string | null
          date: string
          exam_type: string
          id: string
          net_score: number
          results_data: Json
          title: string
          total_questions: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          exam_type: string
          id?: string
          net_score?: number
          results_data?: Json
          title: string
          total_questions?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          exam_type?: string
          id?: string
          net_score?: number
          results_data?: Json
          title?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      pair_invites: {
        Row: {
          created_at: string
          from_role: Database["public"]["Enums"]["app_role"]
          from_user: string
          id: string
          message: string
          responded_at: string | null
          status: string
          to_email: string
          to_user: string | null
        }
        Insert: {
          created_at?: string
          from_role: Database["public"]["Enums"]["app_role"]
          from_user: string
          id?: string
          message?: string
          responded_at?: string | null
          status?: string
          to_email: string
          to_user?: string | null
        }
        Update: {
          created_at?: string
          from_role?: Database["public"]["Enums"]["app_role"]
          from_user?: string
          id?: string
          message?: string
          responded_at?: string | null
          status?: string
          to_email?: string
          to_user?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          coach_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          target: string
          title: string
          track: Database["public"]["Enums"]["yks_track"]
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          target?: string
          title?: string
          track?: Database["public"]["Enums"]["yks_track"]
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          target?: string
          title?: string
          track?: Database["public"]["Enums"]["yks_track"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_logs: {
        Row: {
          area: string | null
          blank: number | null
          correct: number | null
          date: string | null
          exam: string | null
          id: string
          source: string | null
          status: string | null
          sub_topic: string
          subject: string
          total_questions: number | null
          user_id: string
          wrong: number | null
        }
        Insert: {
          area?: string | null
          blank?: number | null
          correct?: number | null
          date?: string | null
          exam?: string | null
          id?: string
          source?: string | null
          status?: string | null
          sub_topic: string
          subject: string
          total_questions?: number | null
          user_id: string
          wrong?: number | null
        }
        Update: {
          area?: string | null
          blank?: number | null
          correct?: number | null
          date?: string | null
          exam?: string | null
          id?: string
          source?: string | null
          status?: string | null
          sub_topic?: string
          subject?: string
          total_questions?: number | null
          user_id?: string
          wrong?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          area_id: string | null
          area_name: string | null
          assigned_by: string | null
          created_at: string
          day: number
          done: boolean
          id: string
          kind: string
          result: Json | null
          student_id: string
          subject: string
          title: string
          topic_id: string | null
          week_offset: number
        }
        Insert: {
          area_id?: string | null
          area_name?: string | null
          assigned_by?: string | null
          created_at?: string
          day: number
          done?: boolean
          id?: string
          kind: string
          result?: Json | null
          student_id: string
          subject: string
          title: string
          topic_id?: string | null
          week_offset?: number
        }
        Update: {
          area_id?: string | null
          area_name?: string | null
          assigned_by?: string | null
          created_at?: string
          day?: number
          done?: boolean
          id?: string
          kind?: string
          result?: Json | null
          student_id?: string
          subject?: string
          title?: string
          topic_id?: string | null
          week_offset?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          email: string | null
          exam_tracks: Json
          full_name: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          exam_tracks?: Json
          full_name?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          exam_tracks?: Json
          full_name?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_schedules: {
        Row: {
          created_at: string | null
          id: string
          schedule_data: Json
          student_id: string
          updated_at: string | null
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          schedule_data?: Json
          student_id: string
          updated_at?: string | null
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          schedule_data?: Json
          student_id?: string
          updated_at?: string | null
          week_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_email: { Args: never; Returns: string }
      respond_pair_invite: {
        Args: { _accept: boolean; _invite_id: string }
        Returns: undefined
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["student", "coach"],
      yks_track: ["sayisal", "sozel", "esit"],
    },
  },
} as const

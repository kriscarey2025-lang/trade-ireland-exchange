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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_clicks: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          ip_hash: string | null
          page_url: string | null
          user_agent: string | null
          viewer_id: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          ip_hash: string | null
          page_url: string | null
          user_agent: string | null
          viewer_id: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          advertiser_id: string
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          placement: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          placement?: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          placement?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisers: {
        Row: {
          business_email: string
          business_name: string
          business_phone: string | null
          business_website: string | null
          created_at: string
          id: string
          is_active: boolean | null
          location: string | null
          logo_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          business_email: string
          business_name: string
          business_phone?: string | null
          business_website?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          business_email?: string
          business_name?: string
          business_phone?: string | null
          business_website?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      banned_ips: {
        Row: {
          banned_by: string
          created_at: string
          id: string
          ip_address: string
          reason: string
          related_user_id: string | null
        }
        Insert: {
          banned_by: string
          created_at?: string
          id?: string
          ip_address: string
          reason: string
          related_user_id?: string | null
        }
        Update: {
          banned_by?: string
          created_at?: string
          id?: string
          ip_address?: string
          reason?: string
          related_user_id?: string | null
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_by: string
          created_at: string
          id: string
          reason: string
          related_report_id: string | null
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          id?: string
          reason: string
          related_report_id?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          id?: string
          reason?: string
          related_report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banned_users_related_report_id_fkey"
            columns: ["related_report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_shares: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          owner_id: string
          shared_with_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          owner_id: string
          shared_with_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          shared_with_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_shares_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          completed_by_1: boolean | null
          completed_by_2: boolean | null
          created_at: string
          id: string
          participant_1: string
          participant_2: string
          service_id: string | null
          updated_at: string
        }
        Insert: {
          completed_by_1?: boolean | null
          completed_by_2?: boolean | null
          created_at?: string
          id?: string
          participant_1: string
          participant_2: string
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_by_1?: boolean | null
          completed_by_2?: boolean | null
          created_at?: string
          id?: string
          participant_1?: string
          participant_2?: string
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          related_conversation_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          related_conversation_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_conversation_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_related_conversation_id_fkey"
            columns: ["related_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_rate_limits: {
        Row: {
          message_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          message_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          message_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_service_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_service_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_service_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_service_id_fkey"
            columns: ["related_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits: number
          email: string | null
          facebook_url: string | null
          full_name: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          facebook_url?: string | null
          full_name?: string | null
          id: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_by: string | null
          reviewed_at: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_by?: string | null
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_by?: string | null
          reviewed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          review_text: string | null
          reviewed_user_id: string
          reviewer_id: string
          service_id: string | null
          service_rating: number | null
          user_rating: number
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          review_text?: string | null
          reviewed_user_id: string
          reviewer_id: string
          service_id?: string | null
          service_rating?: number | null
          user_rating: number
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          review_text?: string | null
          reviewed_user_id?: string
          reviewer_id?: string
          service_id?: string | null
          service_rating?: number | null
          user_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          accepted_categories: string[] | null
          category: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location: string | null
          price: number | null
          price_type: string | null
          status: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_categories?: string[] | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          price_type?: string | null
          status?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_categories?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          price_type?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ip_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          onboarding_completed: boolean | null
          service_radius_km: number
          skills_offered: string[] | null
          skills_offered_custom: string[] | null
          skills_wanted: string[] | null
          skills_wanted_custom: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          service_radius_km?: number
          skills_offered?: string[] | null
          skills_offered_custom?: string[] | null
          skills_wanted?: string[] | null
          skills_wanted_custom?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          service_radius_km?: number
          skills_offered?: string[] | null
          skills_offered_custom?: string[] | null
          skills_wanted?: string[] | null
          skills_wanted_custom?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_type: string
          document_url: string
          id: string
          reviewed_at: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_type?: string
          document_url: string
          id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_advertiser_by_email: {
        Args: {
          _business_email: string
          _business_name: string
          _business_phone?: string
          _business_website?: string
          _email: string
          _location?: string
        }
        Returns: string
      }
      earn_credits: {
        Args: {
          _amount: number
          _conversation_id?: string
          _description: string
        }
        Returns: boolean
      }
      get_basic_profile: {
        Args: { _profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          full_name: string
          id: string
          location: string
        }[]
      }
      get_pending_verifications: {
        Args: never
        Returns: {
          admin_notes: string
          document_type: string
          document_url: string
          id: string
          reviewed_at: string
          status: string
          submitted_at: string
          user_avatar: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_profile_for_conversation: {
        Args: { _profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          contact_shared: boolean
          email: string
          full_name: string
          id: string
          location: string
          phone: string
        }[]
      }
      get_public_services: {
        Args: {
          _category?: string
          _location?: string
          _search?: string
          _status?: string
        }
        Returns: {
          accepted_categories: string[]
          category: string
          created_at: string
          description: string
          id: string
          images: string[]
          location: string
          price: number
          price_type: string
          provider_avatar: string
          provider_facebook: string
          provider_instagram: string
          provider_linkedin: string
          provider_name: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }[]
      }
      get_service_by_id: {
        Args: { _service_id: string }
        Returns: {
          accepted_categories: string[]
          category: string
          created_at: string
          description: string
          id: string
          images: string[]
          location: string
          price: number
          price_type: string
          provider_avatar: string
          provider_bio: string
          provider_facebook: string
          provider_instagram: string
          provider_linkedin: string
          provider_location: string
          provider_name: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_ratings: {
        Args: { _user_id: string }
        Returns: {
          avg_service_rating: number
          avg_user_rating: number
          total_reviews: number
        }[]
      }
      get_verification_document_url: {
        Args: { _request_id: string }
        Returns: string
      }
      has_contact_access: {
        Args: { _profile_id: string; _viewer_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ip_banned: { Args: { _ip_address: string }; Returns: boolean }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      log_user_ip: {
        Args: { _ip_address: string; _user_agent?: string; _user_id: string }
        Returns: undefined
      }
      review_verification: {
        Args: { _approved: boolean; _notes?: string; _request_id: string }
        Returns: undefined
      }
      spend_credits: {
        Args: {
          _amount: number
          _conversation_id?: string
          _description: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const

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
          approved: boolean | null
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
          approved?: boolean | null
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
          approved?: boolean | null
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
      advertiser_interest_rate_limits: {
        Row: {
          ip_hash: string
          submission_count: number
          window_start: string
        }
        Insert: {
          ip_hash: string
          submission_count?: number
          window_start?: string
        }
        Update: {
          ip_hash?: string
          submission_count?: number
          window_start?: string
        }
        Relationships: []
      }
      advertiser_interests: {
        Row: {
          admin_notes: string | null
          business_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          location: string
          message: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          location: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          location?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
      browse_nudges: {
        Row: {
          contacted_at: string | null
          created_at: string
          id: string
          nudge_sent_at: string | null
          provider_name: string | null
          service_id: string
          service_title: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          contacted_at?: string | null
          created_at?: string
          id?: string
          nudge_sent_at?: string | null
          provider_name?: string | null
          service_id: string
          service_title: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          contacted_at?: string | null
          created_at?: string
          id?: string
          nudge_sent_at?: string | null
          provider_name?: string | null
          service_id?: string
          service_title?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "browse_nudges_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          archived_at: string | null
          category: string
          county: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_visible: boolean
          location: string | null
          moderated_at: string | null
          moderation_reason: string | null
          moderation_status: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          category: string
          county?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          location?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          moderation_status?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          category?: string
          county?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          location?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          moderation_status?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          accepted_at: string | null
          accepted_by_1: boolean | null
          accepted_by_2: boolean | null
          agreed_completion_date: string | null
          completed_by_1: boolean | null
          completed_by_2: boolean | null
          created_at: string
          id: string
          offered_skill: string | null
          offered_skill_category: string | null
          participant_1: string
          participant_2: string
          service_id: string | null
          swap_status: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_1?: boolean | null
          accepted_by_2?: boolean | null
          agreed_completion_date?: string | null
          completed_by_1?: boolean | null
          completed_by_2?: boolean | null
          created_at?: string
          id?: string
          offered_skill?: string | null
          offered_skill_category?: string | null
          participant_1: string
          participant_2: string
          service_id?: string | null
          swap_status?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_1?: boolean | null
          accepted_by_2?: boolean | null
          agreed_completion_date?: string | null
          completed_by_1?: boolean | null
          completed_by_2?: boolean | null
          created_at?: string
          id?: string
          offered_skill?: string | null
          offered_skill_category?: string | null
          participant_1?: string
          participant_2?: string
          service_id?: string | null
          swap_status?: string | null
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
      interests: {
        Row: {
          created_at: string
          id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: []
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
          edited_at: string | null
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
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
      moderation_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          reason: string | null
          reviewed_by: string | null
          service_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          reason?: string | null
          reviewed_by?: string | null
          service_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          reason?: string | null
          reviewed_by?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
          related_conversation_id: string | null
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
          related_conversation_id?: string | null
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
          related_conversation_id?: string | null
          related_service_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_conversation_id_fkey"
            columns: ["related_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
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
          is_founder: boolean | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          updated_at: string
          verification_status: string | null
          website_url: string | null
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
          is_founder?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
          verification_status?: string | null
          website_url?: string | null
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
          is_founder?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
          verification_status?: string | null
          website_url?: string | null
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
          reported_service_id: string | null
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
          reported_service_id?: string | null
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
          reported_service_id?: string | null
          reported_user_id?: string
          reporter_id?: string
          resolved_by?: string | null
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_service_id_fkey"
            columns: ["reported_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
          completed_swaps_count: number | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_time_sensitive: boolean | null
          location: string | null
          moderated_at: string | null
          moderation_reason: string | null
          moderation_status: string | null
          needed_by_date: string | null
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
          completed_swaps_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_time_sensitive?: boolean | null
          location?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          moderation_status?: string | null
          needed_by_date?: string | null
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
          completed_swaps_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_time_sensitive?: boolean | null
          location?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          moderation_status?: string | null
          needed_by_date?: string | null
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
      signup_rate_limits: {
        Row: {
          ip_hash: string
          submission_count: number
          window_start: string
        }
        Insert: {
          ip_hash: string
          submission_count?: number
          window_start?: string
        }
        Update: {
          ip_hash?: string
          submission_count?: number
          window_start?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_public: boolean
          message: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          is_public?: boolean
          message?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_public?: boolean
          message?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      trustpilot_invites_sent: {
        Row: {
          email: string
          id: string
          sent_at: string
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          sent_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          created_at: string
          duration_seconds: number | null
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          status: string
          subject: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          status?: string
          subject: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          status?: string
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          interest_emails_enabled: boolean | null
          last_digest_sent_at: string | null
          message_emails_enabled: boolean | null
          onboarding_completed: boolean | null
          service_radius_km: number
          skills_offered: string[] | null
          skills_offered_custom: string[] | null
          skills_wanted: string[] | null
          skills_wanted_custom: string[] | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
          weekly_digest_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          interest_emails_enabled?: boolean | null
          last_digest_sent_at?: string | null
          message_emails_enabled?: boolean | null
          onboarding_completed?: boolean | null
          service_radius_km?: number
          skills_offered?: string[] | null
          skills_offered_custom?: string[] | null
          skills_wanted?: string[] | null
          skills_wanted_custom?: string[] | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
          weekly_digest_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          interest_emails_enabled?: boolean | null
          last_digest_sent_at?: string | null
          message_emails_enabled?: boolean | null
          onboarding_completed?: boolean | null
          service_radius_km?: number
          skills_offered?: string[] | null
          skills_offered_custom?: string[] | null
          skills_wanted?: string[] | null
          skills_wanted_custom?: string[] | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
          weekly_digest_enabled?: boolean | null
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
      welcome_emails_sent: {
        Row: {
          email: string
          id: string
          sent_at: string
        }
        Insert: {
          email: string
          id?: string
          sent_at?: string
        }
        Update: {
          email?: string
          id?: string
          sent_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_advertiser_rate_limit: {
        Args: {
          _ip_hash: string
          _max_requests?: number
          _window_minutes?: number
        }
        Returns: boolean
      }
      check_signup_rate_limit: {
        Args: {
          _ip_hash: string
          _max_requests?: number
          _window_minutes?: number
        }
        Returns: boolean
      }
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
      get_message_count: { Args: never; Returns: number }
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
      get_public_profile: {
        Args: { _profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          completed_swaps_count: number
          facebook_url: string
          first_name: string
          id: string
          instagram_url: string
          is_founder: boolean
          linkedin_url: string
          location: string
          registered_at: string
          verification_status: string
          website_url: string
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
          completed_swaps_count: number
          created_at: string
          description: string
          id: string
          images: string[]
          is_time_sensitive: boolean
          location: string
          needed_by_date: string
          price: number
          price_type: string
          provider_avatar: string
          provider_facebook: string
          provider_instagram: string
          provider_is_founder: boolean
          provider_linkedin: string
          provider_name: string
          provider_verification_status: string
          provider_website: string
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
          provider_is_founder: boolean
          provider_linkedin: string
          provider_location: string
          provider_name: string
          provider_verification_status: string
          provider_website: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }[]
      }
      get_swap_stats: {
        Args: never
        Returns: {
          completed_count: number
          in_progress_count: number
          pending_count: number
        }[]
      }
      get_top_swappers: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          completed_swaps: number
          full_name: string
          id: string
          is_founder: boolean
          location: string
          verification_status: string
        }[]
      }
      get_user_engagement_summary: {
        Args: { _user_id: string }
        Returns: {
          contacts_initiated: number
          last_active_at: string
          services_created: number
          total_time_spent_minutes: number
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
      get_visible_board_posts: {
        Args: never
        Returns: {
          category: string
          county: string
          created_at: string
          description: string
          id: string
          image_url: string
          location: string
          poster_avatar: string
          poster_name: string
          status: string
          title: string
          user_id: string
        }[]
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
      increment_completed_swaps: {
        Args: { _service_id: string }
        Returns: undefined
      }
      insert_advertiser_interest: {
        Args: {
          _business_name: string
          _contact_name: string
          _email: string
          _location?: string
          _message?: string
          _phone?: string
          _website?: string
        }
        Returns: string
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_ip_banned: { Args: { _ip_address: string }; Returns: boolean }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      log_user_ip: {
        Args: { _ip_address: string; _user_agent?: string; _user_id: string }
        Returns: undefined
      }
      record_service_view: {
        Args: {
          _provider_name: string
          _service_id: string
          _service_title: string
        }
        Returns: undefined
      }
      review_verification: {
        Args: { _approved: boolean; _notes?: string; _request_id: string }
        Returns: undefined
      }
      search_community_posts: {
        Args: {
          _category?: string
          _county?: string
          _limit?: number
          _offset?: number
          _search?: string
          _status?: string
        }
        Returns: {
          category: string
          county: string
          created_at: string
          description: string
          id: string
          image_url: string
          location: string
          poster_avatar: string
          poster_name: string
          status: string
          title: string
          total_count: number
          user_id: string
        }[]
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

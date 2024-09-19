export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      daily_progress: {
        Row: {
          id: number;
          user_id: string;
          date: string;
          cards_studied: number;
          new_words_learned: number;
          review_accuracy: number;
          study_time_minutes: number;
        };
        Insert: {
          id?: number;
          user_id: string;
          date: string;
          cards_studied: number;
          new_words_learned: number;
          review_accuracy: number;
          study_time_minutes: number;
        };
        Update: {
          id?: number;
          user_id?: string;
          date?: string;
          cards_studied?: number;
          new_words_learned?: number;
          review_accuracy?: number;
          study_time_minutes?: number;
        };
      };
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          created_at: string;
          last_studied: string;
          review_limit: number;
          card_count: number;
          new_cards_per_day: number;
          review_order: string;
          min_ease_factor: number;
          max_ease_factor: number;
          enable_ai_hints: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          created_at?: string;
          last_studied?: string;
          review_limit: number;
          card_count: number;
          new_cards_per_day: number;
          review_order: string;
          min_ease_factor: number;
          max_ease_factor: number;
          enable_ai_hints: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          last_studied?: string;
          review_limit?: number;
          card_count?: number;
          new_cards_per_day?: number;
          review_order?: string;
          min_ease_factor?: number;
          max_ease_factor?: number;
          enable_ai_hints?: boolean;
        };
      };
      flashcard_reviews: {
        Row: {
          id: number;
          flashcard_id: number;
          user_id: string;
          session_id: string;
          review_time: number;
          performance_rating: number;
          review_type: string;
        };
        Insert: {
          id?: number;
          flashcard_id: number;
          user_id: string;
          session_id: string;
          review_time: number;
          performance_rating: number;
          review_type: string;
        };
        Update: {
          id?: number;
          flashcard_id?: number;
          user_id?: string;
          session_id?: string;
          review_time?: number;
          performance_rating?: number;
          review_type?: string;
        };
      };
      flashcards: {
        Row: {
          id: number;
          deck_id: string;
          front: string;
          back: string;
          notes: string;
          created_at: string;
          last_reviewed: string;
          review_count: number;
          ease_factor: number;
          interval: number;
          due_date: string;
        };
        Insert: {
          id?: number;
          deck_id: string;
          front: string;
          back: string;
          notes: string;
          created_at?: string;
          last_reviewed?: string;
          review_count?: number;
          ease_factor?: number;
          interval?: number;
          due_date?: string;
        };
        Update: {
          id?: number;
          deck_id?: string;
          front?: string;
          back?: string;
          notes?: string;
          created_at?: string;
          last_reviewed?: string;
          review_count?: number;
          ease_factor?: number;
          interval?: number;
          due_date?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          username: string;
          bio: string;
          avatar_url: string;
          total_cards_studied: number;
          total_study_time: number;
          longest_streak: number;
          email: string;
          role: string;
          theme: string;
          daily_review_limit: number;
          default_study_duration: number;
          preferred_study_mode: string;
          notifications_enabled: boolean;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          full_name: string;
          username: string;
          bio?: string;
          avatar_url?: string;
          total_cards_studied?: number;
          total_study_time?: number;
          longest_streak?: number;
          email: string;
          role?: string;
          theme?: string;
          daily_review_limit?: number;
          default_study_duration?: number;
          preferred_study_mode?: string;
          notifications_enabled?: boolean;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          full_name?: string;
          username?: string;
          bio?: string;
          avatar_url?: string;
          total_cards_studied?: number;
          total_study_time?: number;
          longest_streak?: number;
          email?: string;
          role?: string;
          theme?: string;
          daily_review_limit?: number;
          default_study_duration?: number;
          preferred_study_mode?: string;
          notifications_enabled?: boolean;
          is_admin?: boolean;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          deck_id: string;
          start_time: string;
          end_time: string;
          cards_reviewed: number;
          correct_reviews: number;
          card_count: number;
          is_scrambled: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_id: string;
          start_time: string;
          end_time?: string;
          cards_reviewed?: number;
          correct_reviews?: number;
          card_count: number;
          is_scrambled: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_id?: string;
          start_time?: string;
          end_time?: string;
          cards_reviewed?: number;
          correct_reviews?: number;
          card_count?: number;
          is_scrambled?: boolean;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          deck_id: string;
          created_at: string;
          last_message: string;
          last_updated: string;
          messages: Json;
          token_count: number;
          model: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_id: string;
          created_at?: string;
          last_message: string;
          last_updated?: string;
          messages: Json;
          token_count: number;
          model: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_id?: string;
          created_at?: string;
          last_message?: string;
          last_updated?: string;
          messages?: Json;
          token_count?: number;
          model?: string;
        };
      };
      weekly_stats: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          total_cards_studied: number;
          total_new_words: number;
          average_accuracy: number;
          total_study_time_minutes: number;
          longest_streak: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          total_cards_studied: number;
          total_new_words: number;
          average_accuracy: number;
          total_study_time_minutes: number;
          longest_streak: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          total_cards_studied?: number;
          total_new_words?: number;
          average_accuracy?: number;
          total_study_time_minutes?: number;
          longest_streak?: number;
        };
      };
      feedbacks: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          feedback_type: string;
          message: string;
          screenshot_url: string | null;
          metadata: Json | null;
          full_name: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          feedback_type: string;
          message: string;
          screenshot_url?: string | null;
          metadata?: Json | null;
          full_name?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          feedback_type?: string;
          message?: string;
          screenshot_url?: string | null;
          metadata?: Json | null;
          full_name?: string | null;
        };
      };
      admins: {
        Row: {
          user_id: string;
        };
        Insert: {
          user_id: string;
        };
        Update: {
          user_id?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          igdb_id: number;
          name: string;
          slug: string | null;
          cover_url: string | null;
          summary: string | null;
          first_release_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          igdb_id: number;
          name: string;
          slug?: string | null;
          cover_url?: string | null;
          summary?: string | null;
          first_release_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          igdb_id?: number;
          name?: string;
          slug?: string | null;
          cover_url?: string | null;
          summary?: string | null;
          first_release_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      library_entries: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          is_profile_public: boolean;
          is_library_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          is_profile_public?: boolean;
          is_library_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          is_profile_public?: boolean;
          is_library_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          rating_tempo_1: number;
          rating_tempo_2: number;
          rating_tempo_3: number;
          rating_tempo_4: number;
          rating_tempo_5: number;
          overall_rating: number;
          content: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          rating_tempo_1: number;
          rating_tempo_2: number;
          rating_tempo_3: number;
          rating_tempo_4: number;
          rating_tempo_5: number;
          overall_rating: number;
          content?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          rating_tempo_1?: number;
          rating_tempo_2?: number;
          rating_tempo_3?: number;
          rating_tempo_4?: number;
          rating_tempo_5?: number;
          overall_rating?: number;
          content?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_profiles: {
        Row: {
          id: string;
          user_id: string;
          saved_profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          saved_profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          saved_profile_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      protect_username_immutability: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

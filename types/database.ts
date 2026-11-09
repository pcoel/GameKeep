
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


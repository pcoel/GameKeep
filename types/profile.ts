export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_profile_public: boolean;
  is_library_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_profile_public: boolean;
  is_library_public: boolean;
  created_at: string;
  is_saved?: boolean;
}

export type ActionResponse<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };


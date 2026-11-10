/**
 * Tipos do sistema de avaliações progressivas e reviews (Feature 003).
 * Alinhados ao data-model.md e à Constituição §4.3.
 */

export interface ReviewAuthor {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface GameReview {
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
  author?: ReviewAuthor;
  game?: {
    id: string;
    igdb_id: number;
    name: string;
    cover_url: string | null;
  };
}

export interface GameRatingSummary {
  total_reviews: number;
  overall_average: number | null;
  tempo_1_average: number | null;
  tempo_2_average: number | null;
  tempo_3_average: number | null;
  tempo_4_average: number | null;
  tempo_5_average: number | null;
}


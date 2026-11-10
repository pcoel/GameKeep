/**
 * Tipos do catálogo de jogos e biblioteca pessoal (Feature 002).
 * Alinhados ao data-model.md e à Constituição §4.2.
 */

/** Status permitidos para jogos na biblioteca pessoal (Constituição §4.2) */
export type LibraryGameStatus = "want_to_play" | "playing" | "completed";

/** Representação de um jogo no catálogo local */
export interface Game {
  id: string;
  igdb_id: number;
  name: string;
  slug: string | null;
  cover_url: string | null;
  summary: string | null;
  first_release_date: string | null;
  created_at: string;
  updated_at: string;
}

/** Entrada na biblioteca pessoal do usuário */
export interface LibraryEntry {
  id: string;
  user_id: string;
  game_id: string;
  status: LibraryGameStatus;
  created_at: string;
  updated_at: string;
  game?: Game;
  user_rating?: number | null;
}


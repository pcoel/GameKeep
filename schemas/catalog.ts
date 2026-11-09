import { z } from "zod";

/** Schema de status da biblioteca — três valores constitucionais (§4.2) */
export const libraryStatusSchema = z.enum(["want_to_play", "playing", "completed"], {
  errorMap: () => ({ message: "O status deve ser 'Quero jogar', 'Jogando' ou 'Concluído'." }),
});

/** Schema de busca de jogos no catálogo (T007) */
export const searchGameSchema = z.object({
  query: z
    .string({ required_error: "O termo de pesquisa é obrigatório." })
    .trim()
    .min(2, "A pesquisa deve conter pelo menos 2 caracteres.")
    .max(100, "O termo de pesquisa não pode exceder 100 caracteres."),
});

/** Schema de adição de jogo à biblioteca (T010) */
export const addGameToLibrarySchema = z.object({
  igdb_id: z.number({ required_error: "Identificador de jogo inválido." }).int().positive("Identificador de jogo inválido."),
  name: z.string({ required_error: "O nome do jogo é obrigatório." }).trim().min(1, "O nome do jogo é obrigatório."),
  slug: z.string().nullable().optional(),
  cover_url: z.string().url("URL de capa inválida.").nullable().optional(),
  summary: z.string().nullable().optional(),
  first_release_date: z.string().nullable().optional(),
  status: libraryStatusSchema,
});

/** Schema de alteração de status de um jogo na biblioteca (T010) */
export const updateLibraryStatusSchema = z.object({
  entry_id: z.string({ required_error: "Identificador de entrada inválido." }).uuid("Identificador de entrada inválido."),
  status: libraryStatusSchema,
});

/** Schema de remoção de jogo da biblioteca (T010) */
export const removeGameFromLibrarySchema = z.object({
  entry_id: z.string({ required_error: "Identificador de entrada inválido." }).uuid("Identificador de entrada inválido."),
});

// Tipos inferidos
export type SearchGameInput = z.infer<typeof searchGameSchema>;
export type AddGameToLibraryInput = z.infer<typeof addGameToLibrarySchema>;
export type UpdateLibraryStatusInput = z.infer<typeof updateLibraryStatusSchema>;
export type RemoveGameFromLibraryInput = z.infer<typeof removeGameFromLibrarySchema>;

